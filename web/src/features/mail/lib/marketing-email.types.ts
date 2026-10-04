import type { MarketingEmailStatus } from '@prisma/client';

export type { MarketingEmailStatus };

export type TMarketingEmailListItem = {
  id: string;
  subject: string;
  eyebrow: string | null;
  title: string;
  intro: string | null;
  content: string;
  note: string | null;
  imageUrl: string | null;
  links: string[];
  status: MarketingEmailStatus;
  scheduledFor: string;
  sentAt: string | null;
  eligibleRecipientCount: number;
  sentRecipientCount: number;
  emailAttempts: number;
  emailLastAttemptAt: string | null;
  emailLastError: string | null;
  createdByUserId: string | null;
  createdByEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TMarketingEmailsPagination = {
  items: TMarketingEmailListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  previousPage: number | null;
  nextPage: number | null;
};

export type TMarketingEmailRecipient = {
  email: string;
};

export type TSendMarketingEmailsOptions = {
  ignoreSchedule?: boolean;
  limit?: number;
  now?: Date;
};

export type TSendMarketingEmailsDetail = {
  id: string;
  subject: string;
  status: 'SENT' | 'FAILED' | 'SKIPPED';
  attempts: number;
  eligibleRecipientCount: number;
  sentRecipientCount: number;
  error: string | null;
};

export type TSendMarketingEmailsResult = {
  processedMarketingEmailCount: number;
  sentMarketingEmailCount: number;
  failedMarketingEmailCount: number;
  skippedMarketingEmailCount: number;
  sentRecipientCount: number;
  details: TSendMarketingEmailsDetail[];
};
