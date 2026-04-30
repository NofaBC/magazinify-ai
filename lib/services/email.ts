import sgMail from '@sendgrid/mail';
import { logger } from '@/lib/utils/logger';

// Initialize SendGrid
const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL ?? 'supportdesk@nofabusinessconsulting.com';

/** Send the published issue link to the client */
export async function sendIssueEmail(params: {
  to: string;
  businessName: string;
  yearMonth: string;
  shareableUrl: string;
}): Promise<boolean> {
  const { to, businessName, yearMonth, shareableUrl } = params;
  const [year, month] = yearMonth.split('-');
  const monthName = new Date(Number(year), Number(month) - 1).toLocaleString(
    'en-US',
    { month: 'long' }
  );

  try {
    await sgMail.send({
      to,
      from: { email: FROM_EMAIL, name: 'Magazinify AI' },
      subject: `Your ${monthName} ${year} Magazine is Ready — ${businessName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #171717; margin-bottom: 8px;">
            ${businessName}
          </h1>
          <p style="font-size: 14px; color: #71717a; margin-bottom: 24px;">
            ${monthName} ${year} Edition
          </p>

          <p style="font-size: 15px; color: #3f3f46; line-height: 1.6; margin-bottom: 24px;">
            Your latest digital magazine is ready to view and share. Click the button below to read through your new issue.
          </p>

          <a href="${shareableUrl}" style="display: inline-block; background: #171717; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
            View Your Magazine →
          </a>

          <p style="font-size: 13px; color: #a1a1aa; margin-top: 32px; line-height: 1.5;">
            Share this link with your audience to build authority and drive traffic back to your website.
          </p>

          <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 32px 0;" />

          <p style="font-size: 11px; color: #d4d4d8;">
            Powered by Magazinify AI™ — A NOFA AI Factory™ Product
          </p>
        </div>
      `,
    });

    logger.info('Issue email sent', { to, yearMonth });
    return true;
  } catch (err) {
    logger.error('Failed to send issue email', {
      to,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
