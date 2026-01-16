import Link from 'next/link';
import { colors, spacing, typography, containers, borderRadius } from '@/styles/design-tokens';

export const metadata = {
  title: 'Terms of Service | LinkStream',
  description: 'Terms and conditions for using LinkStream',
};

export default function TermsOfServicePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: colors.surface,
      padding: spacing[4]
    }}>
      <div style={{
        maxWidth: containers.md,
        margin: "0 auto",
        background: "white",
        padding: spacing[8],
        borderRadius: borderRadius.xl
      }}>
        {/* Header */}
        <div style={{ marginBottom: spacing[8] }}>
          <Link
            href="/"
            style={{
              color: colors.primary[600],
              textDecoration: "none",
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium
            }}
          >
            ← Back to Home
          </Link>
        </div>

        <h1 style={{
          ...typography.heading.h1,
          marginBottom: spacing[3]
        }}>
          Terms of Service
        </h1>
        <p style={{
          fontSize: typography.fontSize.base,
          color: colors.text.secondary,
          marginBottom: spacing[8]
        }}>
          Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div style={{
          fontSize: typography.fontSize.base,
          lineHeight: "1.8",
          color: colors.text.primary
        }}>
          {/* Agreement to Terms */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>1. Agreement to Terms</h2>
            <p style={{ marginBottom: spacing[4] }}>
              These Terms of Service ("Terms") constitute a legally binding agreement between you and LinkStream ("we," "us," or "our") concerning your access to and use of the LinkStream website at www.lstream.app and related services (collectively, the "Service").
            </p>
            <p style={{ marginBottom: spacing[4] }}>
              By accessing or using the Service, you agree that you have read, understood, and agree to be bound by these Terms. If you do not agree, you must not access or use the Service.
            </p>
          </section>

          {/* Service Description */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>2. Description of Service</h2>
            <p style={{ marginBottom: spacing[4] }}>
              LinkStream provides a platform for backing up, analyzing, and protecting your LinkedIn data. Our Service allows you to:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Upload and securely store your LinkedIn data exports</li>
              <li>Analyze your network connections and activity</li>
              <li>Create secure backups of your professional network data</li>
              <li>Access insights about your LinkedIn presence</li>
            </ul>
            <p style={{ marginBottom: spacing[4] }}>
              We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice.
            </p>
          </section>

          {/* Eligibility */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>3. Eligibility</h2>
            <p style={{ marginBottom: spacing[4] }}>
              You must be at least 18 years old to use our Service. By using the Service, you represent and warrant that:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>You will not use the Service for any illegal purpose</li>
              <li>Your use of the Service will not violate any applicable law or regulation</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>4. User Accounts</h2>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>4.1 Account Creation</h3>
            <p style={{ marginBottom: spacing[4] }}>
              To use certain features of the Service, you must create an account. You agree to:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your password</li>
              <li>Accept all responsibility for activities under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>4.2 Account Security</h3>
            <p style={{ marginBottom: spacing[4] }}>
              You are responsible for maintaining the confidentiality of your account credentials. We are not liable for any loss or damage arising from your failure to protect your account information.
            </p>
          </section>

          {/* Acceptable Use */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>5. Acceptable Use Policy</h2>
            <p style={{ marginBottom: spacing[4] }}>You agree not to:</p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Upload content that infringes on intellectual property rights</li>
              <li>Upload malicious code, viruses, or harmful software</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems (bots, scrapers) without permission</li>
              <li>Impersonate another person or entity</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Sell, rent, or lease access to the Service</li>
              <li>Use the Service to spam or send unsolicited communications</li>
            </ul>
          </section>

          {/* User Content */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>6. User Content and Data</h2>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>6.1 Your Data</h3>
            <p style={{ marginBottom: spacing[4] }}>
              You retain all ownership rights to the LinkedIn data and other content you upload to the Service ("Your Data"). By uploading Your Data, you grant us a limited license to:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Store and process Your Data to provide the Service</li>
              <li>Create backups of Your Data</li>
              <li>Analyze Your Data to provide insights and features</li>
              <li>Use aggregated, anonymized data for service improvement</li>
            </ul>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>6.2 Data Responsibility</h3>
            <p style={{ marginBottom: spacing[4] }}>
              You are responsible for:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>The accuracy and legality of Your Data</li>
              <li>Ensuring you have the right to upload and share Your Data</li>
              <li>Complying with LinkedIn's Terms of Service regarding data exports</li>
              <li>Maintaining your own backup copies of Your Data</li>
            </ul>
          </section>

          {/* Subscription and Payments */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>7. Subscriptions and Payments</h2>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>7.1 Subscription Plans</h3>
            <p style={{ marginBottom: spacing[4] }}>
              We offer various subscription plans with different features and pricing. Current plans include:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li><strong>Free:</strong> Basic features with limitations</li>
              <li><strong>Pro:</strong> £9/month - Advanced features for individuals</li>
              <li><strong>Business:</strong> £75/month - Team features for up to 10 users</li>
              <li><strong>Enterprise:</strong> Custom pricing - For large organizations</li>
            </ul>
            <p style={{ marginBottom: spacing[4] }}>
              Prices are subject to change with 30 days' notice to existing subscribers.
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>7.2 Billing</h3>
            <p style={{ marginBottom: spacing[4] }}>
              Paid subscriptions are billed:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Monthly in advance for monthly plans</li>
              <li>Annually in advance for annual plans (if offered)</li>
              <li>Automatically until cancelled</li>
            </ul>
            <p style={{ marginBottom: spacing[4] }}>
              You authorize us to charge your payment method on a recurring basis. All fees are non-refundable except as required by law or as stated in our refund policy.
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>7.3 Payment Processing</h3>
            <p style={{ marginBottom: spacing[4] }}>
              Payments are processed by Stripe, Inc. By providing payment information, you agree to Stripe's terms and authorize them to store and process your payment information.
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>7.4 Failed Payments</h3>
            <p style={{ marginBottom: spacing[4] }}>
              If a payment fails:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>We will attempt to process the payment again</li>
              <li>Your account may be suspended or downgraded</li>
              <li>You remain responsible for any uncollected amounts</li>
            </ul>
          </section>

          {/* Cancellation and Refunds */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>8. Cancellation and Refunds</h2>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>8.1 Cancellation</h3>
            <p style={{ marginBottom: spacing[4] }}>
              You may cancel your subscription at any time through your account settings. Upon cancellation:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>You will retain access until the end of your current billing period</li>
              <li>No refund will be issued for the remaining days of your billing period</li>
              <li>Your account will be downgraded to the Free plan</li>
              <li>Some features will no longer be available</li>
            </ul>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>8.2 Refund Policy</h3>
            <p style={{ marginBottom: spacing[4] }}>
              We offer refunds in the following circumstances:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li><strong>14-Day Money-Back Guarantee:</strong> If you cancel within 14 days of your first payment, we will provide a full refund</li>
              <li><strong>Service Issues:</strong> If our Service is unavailable for extended periods, we may issue prorated refunds</li>
              <li><strong>Billing Errors:</strong> If you were charged incorrectly, we will refund the error</li>
            </ul>
            <p style={{ marginBottom: spacing[4] }}>
              To request a refund, contact us at{' '}
              <a href="mailto:billing@lstream.app" style={{ color: colors.primary[600] }}>
                billing@lstream.app
              </a>
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>8.3 We May Cancel</h3>
            <p style={{ marginBottom: spacing[4] }}>
              We reserve the right to suspend or terminate your account if you:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Violate these Terms</li>
              <li>Use the Service fraudulently or illegally</li>
              <li>Fail to pay fees owed</li>
              <li>Engage in abusive behavior toward our staff or other users</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>9. Intellectual Property</h2>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>9.1 Our Content</h3>
            <p style={{ marginBottom: spacing[4] }}>
              The Service, including all content, features, and functionality, is owned by LinkStream and protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>9.2 License to Use</h3>
            <p style={{ marginBottom: spacing[4] }}>
              We grant you a limited, non-exclusive, non-transferable license to access and use the Service for its intended purpose. You may not:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Copy, modify, or create derivative works</li>
              <li>Reverse engineer or decompile the Service</li>
              <li>Remove any copyright or proprietary notices</li>
              <li>Use our trademarks without permission</li>
            </ul>
          </section>

          {/* Disclaimers */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>10. Disclaimers</h2>
            <p style={{ marginBottom: spacing[4] }}>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Warranties of merchantability or fitness for a particular purpose</li>
              <li>Warranties that the Service will be uninterrupted or error-free</li>
              <li>Warranties regarding the accuracy or reliability of data</li>
              <li>Warranties that security measures will prevent unauthorized access</li>
            </ul>
            <p style={{ marginBottom: spacing[4] }}>
              We do not warrant that the Service will meet your requirements or that any defects will be corrected.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>11. Limitation of Liability</h2>
            <p style={{ marginBottom: spacing[4] }}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
              <li>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM</li>
              <li>WE ARE NOT LIABLE FOR ANY LOSS OF DATA, PROFITS, OR BUSINESS OPPORTUNITIES</li>
            </ul>
            <p style={{ marginBottom: spacing[4] }}>
              Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability for consequential damages. In such cases, our liability will be limited to the maximum extent permitted by law.
            </p>
          </section>

          {/* Indemnification */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>12. Indemnification</h2>
            <p style={{ marginBottom: spacing[4] }}>
              You agree to indemnify, defend, and hold harmless LinkStream and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your Data uploaded to the Service</li>
            </ul>
          </section>

          {/* Dispute Resolution */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>13. Dispute Resolution</h2>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>13.1 Informal Resolution</h3>
            <p style={{ marginBottom: spacing[4] }}>
              If you have a dispute, please contact us first at{' '}
              <a href="mailto:legal@lstream.app" style={{ color: colors.primary[600] }}>
                legal@lstream.app
              </a>{' '}
              to attempt to resolve it informally.
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>13.2 Governing Law</h3>
            <p style={{ marginBottom: spacing[4] }}>
              These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to conflict of law principles.
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>13.3 Jurisdiction</h3>
            <p style={{ marginBottom: spacing[4] }}>
              Any legal action or proceeding relating to these Terms shall be brought exclusively in the courts of England and Wales. You consent to the jurisdiction of such courts.
            </p>
          </section>

          {/* Changes to Terms */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>14. Changes to These Terms</h2>
            <p style={{ marginBottom: spacing[4] }}>
              We may modify these Terms at any time. When we make material changes:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>We will update the "Last updated" date</li>
              <li>We will notify you via email or through the Service</li>
              <li>Changes become effective 30 days after notification</li>
            </ul>
            <p style={{ marginBottom: spacing[4] }}>
              Your continued use of the Service after changes become effective constitutes acceptance of the modified Terms. If you do not agree, you must stop using the Service and cancel your account.
            </p>
          </section>

          {/* Termination */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>15. Termination</h2>
            <p style={{ marginBottom: spacing[4] }}>
              Upon termination of your account:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Your access to the Service will cease immediately</li>
              <li>Your Data will be deleted within 30 days unless you export it first</li>
              <li>Provisions that should survive termination (payment obligations, liability limitations, etc.) will continue to apply</li>
            </ul>
          </section>

          {/* General Provisions */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>16. General Provisions</h2>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>16.1 Entire Agreement</h3>
            <p style={{ marginBottom: spacing[4] }}>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and LinkStream regarding the Service.
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>16.2 Severability</h3>
            <p style={{ marginBottom: spacing[4] }}>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>16.3 Waiver</h3>
            <p style={{ marginBottom: spacing[4] }}>
              Our failure to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision.
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>16.4 Assignment</h3>
            <p style={{ marginBottom: spacing[4] }}>
              You may not assign or transfer these Terms or your account without our written consent. We may assign these Terms without restriction.
            </p>
          </section>

          {/* Contact Information */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>17. Contact Us</h2>
            <p style={{ marginBottom: spacing[4] }}>
              If you have questions about these Terms, please contact us:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4], listStyle: "none" }}>
              <li style={{ marginBottom: spacing[2] }}>
                <strong>Legal Inquiries:</strong>{' '}
                <a href="mailto:legal@lstream.app" style={{ color: colors.primary[600] }}>
                  legal@lstream.app
                </a>
              </li>
              <li style={{ marginBottom: spacing[2] }}>
                <strong>General Support:</strong>{' '}
                <a href="mailto:support@lstream.app" style={{ color: colors.primary[600] }}>
                  support@lstream.app
                </a>
              </li>
              <li style={{ marginBottom: spacing[2] }}>
                <strong>Website:</strong>{' '}
                <a href="https://www.lstream.app/contact" style={{ color: colors.primary[600] }}>
                  www.lstream.app/contact
                </a>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer Navigation */}
        <div style={{
          marginTop: spacing[12],
          paddingTop: spacing[6],
          borderTop: `1px solid ${colors.border.default}`,
          display: "flex",
          gap: spacing[6],
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          <Link href="/privacy" style={{ color: colors.primary[600], textDecoration: "none" }}>
            Privacy Policy
          </Link>
          <Link href="/contact" style={{ color: colors.primary[600], textDecoration: "none" }}>
            Contact Us
          </Link>
          <Link href="/" style={{ color: colors.primary[600], textDecoration: "none" }}>
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
