/** Durable batch delivery. Dependencies are injected to exercise crash/retry boundaries. */
export const MARKETING_BATCH_SIZE = 100;
const REQUEST_TIMEOUT_MS = 15_000;
// Leave a margin before Resend forgets an ambiguous request after 24 hours.
const SAFE_REPLAY_MS = 23 * 60 * 60 * 1000;

export type MarketingSnapshot = {
  from: string;
  subject: string;
  html: string;
  recipients: string[];
};
export type MarketingBatchMessage = {
  from: string;
  to: string;
  subject: string;
  html: string;
  tags: { name: string; value: string }[];
};
export type MarketingBatchResponse = {
  data: { data: { id: string }[] } | null;
  error: { name: string; message: string; statusCode: number | null } | null;
  headers?: Record<string, string> | null;
};
export type DeliveryCheckpoint = {
  nextBatchIndex?: number;
  batchAttemptedAt?: Date | null;
  sentRecipientCount?: number;
  consecutiveFailures?: number;
};
export type DeliveryOutcome = {
  status: 'SENT' | 'FAILED' | 'PENDING';
  sentRecipientCount: number;
  error: string | null;
  nextAttemptAt?: Date;
  requiresReview?: boolean;
};

type DeliveryDependencies = {
  now: () => number;
  sleep: (ms: number) => Promise<void>;
  reserveSlot: () => Promise<Date>;
  checkpoint: (data: DeliveryCheckpoint) => Promise<void>;
  send: (
    messages: MarketingBatchMessage[],
    key: string,
    timeoutMs: number,
  ) => Promise<MarketingBatchResponse>;
};

export function retryDelayMs(
  headers: Record<string, string> | null | undefined,
  now: number,
  attempt: number,
) {
  const value = Object.entries(headers ?? {}).find(
    ([key]) => key.toLowerCase() === 'retry-after',
  )?.[1];
  const seconds = value === undefined ? NaN : Number(value);
  const delay = Number.isFinite(seconds)
    ? seconds * 1000
    : value
      ? Date.parse(value) - now
      : 0;
  return Math.max(1000 * 2 ** attempt, Number.isFinite(delay) ? delay : 0);
}

export async function deliverMarketingEmail(
  state: {
    id: string;
    snapshot: MarketingSnapshot;
    nextBatchIndex: number;
    batchAttemptedAt: Date | null;
    sentRecipientCount: number;
  },
  deadline: number,
  deps: DeliveryDependencies,
): Promise<DeliveryOutcome> {
  let count = state.sentRecipientCount;
  let attemptedAt = state.batchAttemptedAt;
  const pending = (
    error: string | null,
    nextAttemptAt = new Date(deps.now()),
  ): DeliveryOutcome => ({
    status: 'PENDING',
    sentRecipientCount: count,
    error,
    nextAttemptAt,
  });

  for (
    let index = state.nextBatchIndex;
    index * MARKETING_BATCH_SIZE < state.snapshot.recipients.length;
    index++
  ) {
    const recipients = state.snapshot.recipients.slice(
      index * MARKETING_BATCH_SIZE,
      (index + 1) * MARKETING_BATCH_SIZE,
    );
    const messages = recipients.map((to) => ({
      from: state.snapshot.from,
      to,
      subject: state.snapshot.subject,
      html: state.snapshot.html,
      tags: [{ name: 'marketing_email_id', value: state.id }],
    }));
    for (let attempt = 0; ; attempt++) {
      if (attemptedAt && deps.now() - attemptedAt.getTime() >= SAFE_REPLAY_MS) {
        return {
          status: 'FAILED',
          sentRecipientCount: count,
          requiresReview: true,
          error: `Lot ${index + 1} incertain depuis plus de 23 h : vérifier sa réception dans Resend avant toute reprise.`,
        };
      }
      if (deps.now() + REQUEST_TIMEOUT_MS + 2000 >= deadline)
        return pending(null);
      const slot = await deps.reserveSlot();
      if (slot.getTime() + REQUEST_TIMEOUT_MS + 2000 >= deadline)
        return pending(null, slot);
      await deps.sleep(Math.max(0, slot.getTime() - deps.now()));
      // Refresh ownership immediately before issuing an external side effect.
      const previouslyAttempted = attemptedAt !== null;
      attemptedAt ??= new Date(deps.now());
      await deps.checkpoint({ batchAttemptedAt: attemptedAt });
      let result: MarketingBatchResponse;
      try {
        result = await deps.send(
          messages,
          `marketing-email-${state.id}-batch-${index}`,
          REQUEST_TIMEOUT_MS,
        );
      } catch {
        result = {
          data: null,
          error: {
            name: 'network_error',
            message: 'Réponse Resend inconnue (réseau ou délai dépassé).',
            statusCode: null,
          },
        };
      }
      if (!result.error && result.data?.data.length === recipients.length) {
        count += recipients.length;
        await deps.checkpoint({
          nextBatchIndex: index + 1,
          sentRecipientCount: count,
          batchAttemptedAt: null,
          consecutiveFailures: 0,
        });
        attemptedAt = null;
        break;
      }
      const error = result.error;
      const message = error
        ? `${error.name} (${error.statusCode ?? 'réseau'}): ${error.message}`
        : 'Réponse Resend incomplète : réception du lot incertaine.';
      // A definitive rejection of a first request is safe to retry even after 24h.
      // Never erase uncertainty left by an earlier network/server failure.
      if (
        !previouslyAttempted &&
        error?.statusCode &&
        error.statusCode >= 400 &&
        error.statusCode < 500 &&
        error.statusCode !== 409
      ) {
        await deps.checkpoint({ batchAttemptedAt: null });
        attemptedAt = null;
      }
      if (
        error?.name === 'daily_quota_exceeded' ||
        error?.name === 'monthly_quota_exceeded'
      ) {
        const next =
          error.name === 'daily_quota_exceeded'
            ? new Date(deps.now())
            : new Date(deps.now() + 60 * 60 * 1000);
        if (error.name === 'daily_quota_exceeded')
          next.setUTCHours(24, 0, 5, 0);
        next.setTime(
          Math.max(
            next.getTime(),
            deps.now() + retryDelayMs(result.headers, deps.now(), attempt),
          ),
        );
        return {
          status: 'FAILED',
          sentRecipientCount: count,
          error: message,
          nextAttemptAt: next,
        };
      }
      const transient =
        !error?.statusCode ||
        error.statusCode === 429 ||
        error.statusCode >= 500 ||
        error.name === 'concurrent_idempotent_requests';
      if (!transient)
        return {
          status: 'FAILED',
          sentRecipientCount: count,
          error: message,
          requiresReview: true,
        };
      const delay = retryDelayMs(result.headers, deps.now(), attempt);
      const next = new Date(deps.now() + delay);
      if (
        attempt >= 2 ||
        next.getTime() + REQUEST_TIMEOUT_MS + 2000 >= deadline
      ) {
        return pending(message, next);
      }
      await deps.sleep(delay);
    }
  }
  return { status: 'SENT', sentRecipientCount: count, error: null };
}
