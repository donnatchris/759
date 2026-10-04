import { NextResponse } from 'next/server';

import { sendMarketingEmails } from '@/features/mail/lib/marketing-email.service';

export const maxDuration = 60;

export async function POST(request: Request) {
  const siteName = process.env.SITE_NAME || 'unknown-site';
  const logPrefix = `[cron-marketing-emails-${siteName}]`;
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

  console.info(`${logPrefix} Sending marketing emails...`);

  try {
    const result = await sendMarketingEmails();

    console.info(`${logPrefix} Marketing emails processed:`);
    console.dir(result, { depth: null });

    return NextResponse.json({
      success: result.failedMarketingEmailCount === 0,
      siteName,
      result,
    });
  } catch (error) {
    console.error(`${logPrefix} Failed:`, error);

    return NextResponse.json(
      {
        success: false,
        error: 'Marketing email cron failed',
      },
      { status: 500 },
    );
  }
}
