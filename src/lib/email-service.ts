// src/lib/email-service.ts
import { Resend } from 'resend';
import type { SubscriptionTier } from './subscription-tiers';
import { CalendarReminderService } from './calendar-integration';

// Lazy initialize Resend only when needed to avoid build errors
let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-build');
  }
  return resend;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static fromEmail = process.env.EMAIL_FROM || 'LinkStream <onboarding@resend.dev>';

  static async sendEmail({ to, subject, html, text }: SendEmailParams): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY not configured. Email would have been sent to:', to);
        return { success: false, error: 'Email service not configured' };
      }

      const resendClient = getResend();
      const { data, error } = await resendClient.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
        text: text || this.htmlToText(html),
      });

      if (error) {
        console.error('❌ Email send error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Email sent successfully:', data?.id);
      return { success: true, id: data?.id };
    } catch (error: any) {
      console.error('❌ Email service error:', error);
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  static async sendWelcomeEmail(userEmail: string, userName?: string): Promise<{ success: boolean; error?: string; id?: string }> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://linkstream.app';

    const subject = '🛡️ Welcome to LinkStream - Your LinkedIn is Now Protected!';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to LinkStream</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 90%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #3B82F6 0%, #1F2937 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🛡️ LinkStream</h1>
                      <p style="color: #E5E7EB; margin: 10px 0 0 0; font-size: 16px;">Your LinkedIn Security Partner</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1F2937; margin: 0 0 20px 0; font-size: 24px;">Welcome${userName ? `, ${userName}` : ''}! 👋</h2>

                      <p style="color: #4B5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                        Thank you for trusting LinkStream to protect your professional network. You've taken an important step in securing your LinkedIn data.
                      </p>

                      <div style="background: #F3F4F6; padding: 24px; border-radius: 12px; margin: 24px 0;">
                        <h3 style="color: #1F2937; margin: 0 0 16px 0; font-size: 18px;">🚀 Next Steps:</h3>
                        <ol style="color: #4B5563; line-height: 1.8; margin: 0; padding-left: 20px;">
                          <li style="margin-bottom: 8px;"><strong>Download your LinkedIn data</strong> - Go to LinkedIn Settings → Data Privacy → Get a copy of your data</li>
                          <li style="margin-bottom: 8px;"><strong>Upload to LinkStream</strong> - Upload your LinkedIn export ZIP file to our secure dashboard</li>
                          <li style="margin-bottom: 8px;"><strong>Get AI insights</strong> - Receive intelligent analysis of your professional network</li>
                          <li><strong>Stay protected</strong> - We'll remind you when it's time to update your backup</li>
                        </ol>
                      </div>

                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${appUrl}/dashboard" style="display: inline-block; background: #3B82F6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                          📊 Go to Dashboard
                        </a>
                      </div>

                      <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 8px; margin: 24px 0;">
                        <p style="color: #92400E; margin: 0; font-size: 14px;">
                          <strong>💡 Pro Tip:</strong> Set up your first backup today! It only takes 2-3 minutes and you'll immediately see insights about your network growth.
                        </p>
                      </div>

                      <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                        Need help getting started? Check out our <a href="${appUrl}/dashboard/guide" style="color: #3B82F6; text-decoration: none;">step-by-step guide</a> or reply to this email.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: #F9FAFB; padding: 24px 30px; border-top: 1px solid #E5E7EB;">
                      <p style="color: #6B7280; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                        You're receiving this email because you signed up for LinkStream.<br>
                        <a href="${appUrl}" style="color: #3B82F6; text-decoration: none;">LinkStream</a> - Protect Your Professional Network
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const text = `
Welcome to LinkStream${userName ? `, ${userName}` : ''}!

Thank you for trusting LinkStream to protect your professional network. You've taken an important step in securing your LinkedIn data.

Next Steps:
1. Download your LinkedIn data - Go to LinkedIn Settings → Data Privacy → Get a copy of your data
2. Upload to LinkStream - Upload your LinkedIn export ZIP file to our secure dashboard
3. Get AI insights - Receive intelligent analysis of your professional network
4. Stay protected - We'll remind you when it's time to update your backup

Go to Dashboard: ${appUrl}/dashboard

Pro Tip: Set up your first backup today! It only takes 2-3 minutes and you'll immediately see insights about your network growth.

Need help? Check out our guide at ${appUrl}/dashboard/guide

---
LinkStream - Protect Your Professional Network
${appUrl}
    `;

    return this.sendEmail({ to: userEmail, subject, html, text });
  }

  static async sendUpgradeWelcomeEmail(
    userEmail: string,
    tier: SubscriptionTier,
    userName?: string
  ): Promise<{ success: boolean; error?: string; id?: string }> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://linkstream.app';

    const tierNames = {
      free: 'Free',
      pro: 'Pro',
      business: 'Business',
      enterprise: 'Enterprise'
    };

    const tierFeatures = {
      pro: [
        '✅ 4 LinkedIn backups per month (weekly)',
        '✅ Advanced AI-powered insights with Gemini',
        '✅ Professional PDF reports',
        '✅ Historical data tracking & comparison',
        '✅ Network analysis and trends',
        '✅ Priority recovery support'
      ],
      business: [
        '✅ Everything in Pro',
        '✅ Unlimited backups per user',
        '✅ Team management (up to 10 members)',
        '✅ Shared team analytics',
        '✅ Premium AI insights',
        '✅ Audit logs & compliance'
      ],
      enterprise: [
        '✅ Everything in Business',
        '✅ Unlimited team members',
        '✅ SSO integration',
        '✅ API access for integrations',
        '✅ Dedicated security consultant',
        '✅ Priority incident response',
        '✅ White-label options'
      ]
    };

    const subject = `🎉 Welcome to LinkStream ${tierNames[tier as keyof typeof tierNames] || 'Pro'}!`;

    const features = tierFeatures[tier as keyof typeof tierFeatures] || tierFeatures.pro;
    const featuresList = features.map(f => `<li style="margin-bottom: 8px;">${f}</li>`).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to LinkStream ${tierNames[tier as keyof typeof tierNames]}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 90%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🎉 Welcome to ${tierNames[tier as keyof typeof tierNames]}!</h1>
                      <p style="color: #D1FAE5; margin: 10px 0 0 0; font-size: 16px;">Your LinkedIn is now fully protected</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1F2937; margin: 0 0 20px 0; font-size: 24px;">Thank you${userName ? `, ${userName}` : ''}! 🙏</h2>

                      <p style="color: #4B5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                        Your payment has been processed and your <strong>${tierNames[tier as keyof typeof tierNames]} subscription</strong> is now active! You've unlocked premium features to keep your professional network safe and analyzed.
                      </p>

                      <div style="background: #ECFDF5; padding: 24px; border-radius: 12px; margin: 24px 0; border: 2px solid #10B981;">
                        <h3 style="color: #065F46; margin: 0 0 16px 0; font-size: 18px;">🔓 Your ${tierNames[tier as keyof typeof tierNames]} Features:</h3>
                        <ul style="color: #047857; line-height: 1.8; margin: 0; padding-left: 20px;">
                          ${featuresList}
                        </ul>
                      </div>

                      <div style="background: #F3F4F6; padding: 24px; border-radius: 12px; margin: 24px 0;">
                        <h3 style="color: #1F2937; margin: 0 0 16px 0; font-size: 18px;">🚀 Get Started Now:</h3>
                        <ol style="color: #4B5563; line-height: 1.8; margin: 0; padding-left: 20px;">
                          <li style="margin-bottom: 8px;"><strong>Download your LinkedIn data</strong> - Go to LinkedIn Settings → Data Privacy → Get a copy of your data</li>
                          <li style="margin-bottom: 8px;"><strong>Upload to LinkStream</strong> - Upload your export to get AI-powered insights</li>
                          <li style="margin-bottom: 8px;"><strong>Set up reminders</strong> - We'll email you when it's time for your next backup</li>
                          <li><strong>Explore your insights</strong> - See network growth, engagement trends, and more</li>
                        </ol>
                      </div>

                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${appUrl}/dashboard" style="display: inline-block; background: #10B981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                          🛡️ Go to Dashboard
                        </a>
                      </div>

                      <div style="background: #DBEAFE; border-left: 4px solid #3B82F6; padding: 16px; border-radius: 8px; margin: 24px 0;">
                        <p style="color: #1E40AF; margin: 0; font-size: 14px;">
                          <strong>💼 Manage Your Subscription:</strong> You can view invoices, update payment methods, or manage your subscription anytime from your <a href="${appUrl}/dashboard/subscription" style="color: #3B82F6; text-decoration: underline;">subscription page</a>.
                        </p>
                      </div>

                      <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                        Questions? We're here to help! Reply to this email or check out our <a href="${appUrl}/dashboard/guide" style="color: #3B82F6; text-decoration: none;">help center</a>.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: #F9FAFB; padding: 24px 30px; border-top: 1px solid #E5E7EB;">
                      <p style="color: #6B7280; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                        Thank you for choosing LinkStream ${tierNames[tier as keyof typeof tierNames]}!<br>
                        <a href="${appUrl}" style="color: #3B82F6; text-decoration: none;">LinkStream</a> - Protect Your Professional Network
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const text = `
Welcome to LinkStream ${tierNames[tier as keyof typeof tierNames]}${userName ? `, ${userName}` : ''}!

Your payment has been processed and your ${tierNames[tier as keyof typeof tierNames]} subscription is now active! You've unlocked premium features to keep your professional network safe and analyzed.

Your ${tierNames[tier as keyof typeof tierNames]} Features:
${features.join('\n')}

Get Started Now:
1. Download your LinkedIn data - Go to LinkedIn Settings → Data Privacy → Get a copy of your data
2. Upload to LinkStream - Upload your export to get AI-powered insights
3. Set up reminders - We'll email you when it's time for your next backup
4. Explore your insights - See network growth, engagement trends, and more

Go to Dashboard: ${appUrl}/dashboard

Manage Your Subscription: You can view invoices, update payment methods, or manage your subscription anytime from ${appUrl}/dashboard/subscription

Questions? Reply to this email or check out our help center at ${appUrl}/dashboard/guide

---
Thank you for choosing LinkStream ${tierNames[tier as keyof typeof tierNames]}!
LinkStream - Protect Your Professional Network
${appUrl}
    `;

    return this.sendEmail({ to: userEmail, subject, html, text });
  }

  static async sendBackupReminderEmail(
    userEmail: string,
    tier: SubscriptionTier,
    nextBackupDate: Date,
    userName?: string,
    daysUntil?: number
  ): Promise<{ success: boolean; error?: string; id?: string }> {
    const emailContent = CalendarReminderService.generateEmailReminder(tier, userEmail, nextBackupDate);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://linkstream.app';

    // Customize subject based on urgency
    let subject = emailContent.subject;
    if (daysUntil !== undefined) {
      if (daysUntil === 0) {
        subject = `⏰ Your LinkedIn backup is due TODAY!`;
      } else if (daysUntil === 1) {
        subject = `⏰ Your LinkedIn backup is due TOMORROW!`;
      } else if (daysUntil < 0) {
        subject = `🚨 Your LinkedIn backup is ${Math.abs(daysUntil)} days overdue`;
      } else {
        subject = `📅 LinkedIn backup reminder - ${daysUntil} days until due`;
      }
    }

    // Enhanced HTML with urgency indicators
    const urgencyColor = daysUntil !== undefined && daysUntil <= 1 ? '#EF4444' : daysUntil !== undefined && daysUntil <= 3 ? '#F59E0B' : '#3B82F6';
    const urgencyEmoji = daysUntil !== undefined && daysUntil <= 1 ? '🚨' : daysUntil !== undefined && daysUntil <= 3 ? '⏰' : '📅';

    const html = emailContent.html.replace(
      '<h1 style="color: white; margin: 0; font-size: 24px;">🚀 LinkedIn Analytics</h1>',
      `<h1 style="color: white; margin: 0; font-size: 24px;">${urgencyEmoji} LinkStream</h1>`
    ).replace(
      'background: linear-gradient(135deg, ${tierColor} 0%, #1F2937 100%);',
      `background: linear-gradient(135deg, ${urgencyColor} 0%, #1F2937 100%);`
    );

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text: emailContent.text,
    });
  }

  // Helper to convert simple HTML to plain text
  private static htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }
}
