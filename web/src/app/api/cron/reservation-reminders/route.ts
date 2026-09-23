import { NextResponse } from 'next/server';

import { sendReservationReminderEmails } from '@/features/mail/lib/reservation-email.service';

export async function POST(request: Request) {
  const siteName = process.env.SITE_NAME || 'unknown-site';
  const logPrefix = `[cron-reservation-reminders-${siteName}]`;
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken) {
    console.error(`${logPrefix} Missing CRON_SECRET`);
    return NextResponse.json(
      { error: 'Cron secret is not configured' },
      { status: 500 },
    );
  }

  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.info(`${logPrefix} Sending reservation reminder emails...`);

  try {
    const result = await sendReservationReminderEmails();

    console.info(`${logPrefix} Reservation reminder emails processed:`);
    console.dir(result, { depth: null });

    return NextResponse.json({
      success: true,
      siteName,
      result,
    });
  } catch (error) {
    console.error(`${logPrefix} Failed:`, error);

    return NextResponse.json(
      {
        success: false,
        error: 'Reservation reminder email cron failed',
      },
      { status: 500 },
    );
  }
}
