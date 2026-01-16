import Link from 'next/link';
import { colors, spacing, typography, containers, borderRadius } from '@/styles/design-tokens';

export const metadata = {
  title: 'Privacy Policy | LinkStream',
  description: 'How LinkStream protects and handles your data',
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
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
          {/* Introduction */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>1. Introduction</h2>
            <p style={{ marginBottom: spacing[4] }}>
              LinkStream ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service at www.lstream.app (the "Service").
            </p>
            <p style={{ marginBottom: spacing[4] }}>
              By using LinkStream, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Service.
            </p>
          </section>

          {/* Information We Collect */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>2. Information We Collect</h2>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>2.1 Account Information</h3>
            <p style={{ marginBottom: spacing[4] }}>
              When you create an account, we collect:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Email address</li>
              <li>Display name (if provided)</li>
              <li>Password (stored securely using Firebase Authentication)</li>
            </ul>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>2.2 LinkedIn Data</h3>
            <p style={{ marginBottom: spacing[4] }}>
              When you upload your LinkedIn data export, we process and store:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Connection information</li>
              <li>Messages and conversations</li>
              <li>Posts, comments, and reactions</li>
              <li>Company information</li>
              <li>Invitation history</li>
              <li>Profile information included in your data export</li>
            </ul>
            <p style={{ marginBottom: spacing[4] }}>
              <strong>Important:</strong> Your LinkedIn data is stored securely and encrypted. We do not share your LinkedIn data with third parties for marketing purposes. We only process this data to provide you with backup, analysis, and protection services.
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>2.3 Payment Information</h3>
            <p style={{ marginBottom: spacing[4] }}>
              Payment processing is handled by Stripe, Inc. We do not store your full credit card information. We receive and store:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Stripe customer ID</li>
              <li>Subscription status and billing dates</li>
              <li>Last 4 digits of your payment method</li>
              <li>Billing email</li>
            </ul>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>2.4 Usage Data</h3>
            <p style={{ marginBottom: spacing[4] }}>
              We automatically collect information about how you interact with our Service:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>IP address</li>
              <li>Pages visited and features used</li>
              <li>Time and date of visits</li>
              <li>Time spent on pages</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>3. How We Use Your Information</h2>
            <p style={{ marginBottom: spacing[4] }}>We use your information to:</p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Provide, operate, and maintain our Service</li>
              <li>Process your LinkedIn data backups and provide analysis</li>
              <li>Process payments and send billing-related communications</li>
              <li>Send you important service updates and security alerts</li>
              <li>Respond to your support requests and inquiries</li>
              <li>Improve and optimize our Service</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>4. Data Storage and Security</h2>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>4.1 Where We Store Your Data</h3>
            <p style={{ marginBottom: spacing[4] }}>
              Your data is stored using:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li><strong>Firebase (Google Cloud):</strong> User authentication and account data</li>
              <li><strong>Cloud Firestore:</strong> Backup metadata and user preferences</li>
              <li><strong>Cloud Storage:</strong> Your uploaded LinkedIn data exports (encrypted)</li>
            </ul>
            <p style={{ marginBottom: spacing[4] }}>
              Data is stored in secure Google Cloud data centers with industry-standard encryption.
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>4.2 Security Measures</h3>
            <p style={{ marginBottom: spacing[4] }}>We implement security measures including:</p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Encryption in transit (HTTPS/TLS)</li>
              <li>Encryption at rest for stored files</li>
              <li>Secure authentication using Firebase</li>
              <li>Regular security audits</li>
              <li>Access controls and monitoring</li>
            </ul>
            <p style={{ marginBottom: spacing[4] }}>
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Data Sharing and Disclosure */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>5. Data Sharing and Disclosure</h2>
            <p style={{ marginBottom: spacing[4] }}>
              <strong>We do not sell your personal data or LinkedIn data to third parties.</strong>
            </p>
            <p style={{ marginBottom: spacing[4] }}>We may share your information with:</p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li><strong>Service Providers:</strong> Google Cloud (Firebase), Stripe (payments), Resend (email delivery) - only as necessary to provide our Service</li>
              <li><strong>Legal Requirements:</strong> If required by law, court order, or governmental authority</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice to you)</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
          </section>

          {/* Your Rights (GDPR) */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>6. Your Rights and Choices</h2>
            <p style={{ marginBottom: spacing[4] }}>
              Under GDPR (for EU/UK users) and other privacy laws, you have the following rights:
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>6.1 Access and Portability</h3>
            <p style={{ marginBottom: spacing[4] }}>
              You can access your data at any time through your dashboard. You can also request a complete export of your data by contacting us or using the GDPR export feature in your account settings.
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>6.2 Correction</h3>
            <p style={{ marginBottom: spacing[4] }}>
              You can update your account information through your account settings.
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>6.3 Deletion</h3>
            <p style={{ marginBottom: spacing[4] }}>
              You have the right to request deletion of your account and all associated data. You can do this through your account settings or by contacting us at{' '}
              <a href="mailto:privacy@lstream.app" style={{ color: colors.primary[600] }}>privacy@lstream.app</a>.
              We will delete your data within 30 days of your request.
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>6.4 Object to Processing</h3>
            <p style={{ marginBottom: spacing[4] }}>
              You can object to certain types of processing of your data by contacting us.
            </p>

            <h3 style={{ ...typography.heading.h3, marginBottom: spacing[3] }}>6.5 Withdraw Consent</h3>
            <p style={{ marginBottom: spacing[4] }}>
              You can withdraw consent for data processing at any time by deleting your account.
            </p>
          </section>

          {/* Data Retention */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>7. Data Retention</h2>
            <p style={{ marginBottom: spacing[4] }}>
              We retain your data for as long as your account is active or as needed to provide you services. When you delete your account:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Your data is permanently deleted within 30 days</li>
              <li>Backup copies are removed from our systems</li>
              <li>Some metadata may be retained for legal compliance (e.g., billing records for tax purposes) for up to 7 years</li>
            </ul>
          </section>

          {/* Cookies */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>8. Cookies and Tracking</h2>
            <p style={{ marginBottom: spacing[4] }}>
              We use cookies and similar tracking technologies to:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Maintain your login session</li>
              <li>Remember your preferences</li>
              <li>Analyze how you use our Service</li>
            </ul>
            <p style={{ marginBottom: spacing[4] }}>
              You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our Service.
            </p>
          </section>

          {/* International Transfers */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>9. International Data Transfers</h2>
            <p style={{ marginBottom: spacing[4] }}>
              Your data may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place, including:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Standard Contractual Clauses approved by the EU Commission</li>
              <li>Compliance with GDPR and UK data protection laws</li>
              <li>Use of service providers certified under relevant data protection frameworks</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>10. Children's Privacy</h2>
            <p style={{ marginBottom: spacing[4] }}>
              Our Service is not intended for users under the age of 18. We do not knowingly collect personal information from children under 18. If you believe we have collected information from a child under 18, please contact us immediately.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>11. Changes to This Privacy Policy</h2>
            <p style={{ marginBottom: spacing[4] }}>
              We may update this Privacy Policy from time to time. We will notify you of material changes by:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending you an email notification (for significant changes)</li>
            </ul>
            <p style={{ marginBottom: spacing[4] }}>
              Your continued use of the Service after changes become effective constitutes your acceptance of the updated Privacy Policy.
            </p>
          </section>

          {/* Contact Information */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>12. Contact Us</h2>
            <p style={{ marginBottom: spacing[4] }}>
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4], listStyle: "none" }}>
              <li style={{ marginBottom: spacing[2] }}>
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@lstream.app" style={{ color: colors.primary[600] }}>
                  privacy@lstream.app
                </a>
              </li>
              <li style={{ marginBottom: spacing[2] }}>
                <strong>Support:</strong>{' '}
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

          {/* GDPR Representative */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>13. GDPR Data Protection Officer</h2>
            <p style={{ marginBottom: spacing[4] }}>
              For GDPR-related inquiries, you can contact our Data Protection Officer at:{' '}
              <a href="mailto:dpo@lstream.app" style={{ color: colors.primary[600] }}>
                dpo@lstream.app
              </a>
            </p>
            <p style={{ marginBottom: spacing[4] }}>
              You also have the right to lodge a complaint with your local data protection authority if you believe we have not complied with applicable data protection laws.
            </p>
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
          <Link href="/terms" style={{ color: colors.primary[600], textDecoration: "none" }}>
            Terms of Service
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
