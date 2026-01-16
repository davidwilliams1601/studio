import Link from 'next/link';
import { colors, spacing, typography, containers, borderRadius } from '@/styles/design-tokens';

export const metadata = {
  title: 'Contact Us | LinkStream',
  description: 'Get in touch with the LinkStream team',
};

export default function ContactPage() {
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
          Contact Us
        </h1>
        <p style={{
          fontSize: typography.fontSize.lg,
          color: colors.text.secondary,
          marginBottom: spacing[8]
        }}>
          We're here to help. Get in touch with our team.
        </p>

        <div style={{
          fontSize: typography.fontSize.base,
          lineHeight: "1.8",
          color: colors.text.primary
        }}>
          {/* Support */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>Get Support</h2>
            <p style={{ marginBottom: spacing[4] }}>
              Need help with your account or have a question? Our support team is ready to assist you.
            </p>
            <div style={{
              background: colors.primary[50],
              padding: spacing[6],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.primary[200]}`
            }}>
              <div style={{ marginBottom: spacing[4] }}>
                <p style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
                  📧 Email Support
                </p>
                <p style={{ marginBottom: spacing[2] }}>
                  For general inquiries and support:
                </p>
                <a
                  href="mailto:support@lstream.app"
                  style={{
                    color: colors.primary[600],
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    textDecoration: "none"
                  }}
                >
                  support@lstream.app
                </a>
              </div>
              <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                We typically respond within 24 hours during business days.
              </p>
            </div>
          </section>

          {/* Specific Departments */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>Department Contacts</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: spacing[4] }}>
              {/* Sales */}
              <div style={{
                padding: spacing[4],
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.lg
              }}>
                <h3 style={{ ...typography.heading.h3, marginBottom: spacing[2] }}>
                  💼 Sales & Business Inquiries
                </h3>
                <p style={{ marginBottom: spacing[2], color: colors.text.secondary }}>
                  Interested in Business or Enterprise plans?
                </p>
                <a
                  href="mailto:sales@lstream.app"
                  style={{ color: colors.primary[600], textDecoration: "none", fontWeight: typography.fontWeight.medium }}
                >
                  sales@lstream.app
                </a>
              </div>

              {/* Billing */}
              <div style={{
                padding: spacing[4],
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.lg
              }}>
                <h3 style={{ ...typography.heading.h3, marginBottom: spacing[2] }}>
                  💳 Billing & Payments
                </h3>
                <p style={{ marginBottom: spacing[2], color: colors.text.secondary }}>
                  Questions about subscriptions, invoices, or refunds?
                </p>
                <a
                  href="mailto:billing@lstream.app"
                  style={{ color: colors.primary[600], textDecoration: "none", fontWeight: typography.fontWeight.medium }}
                >
                  billing@lstream.app
                </a>
              </div>

              {/* Privacy */}
              <div style={{
                padding: spacing[4],
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.lg
              }}>
                <h3 style={{ ...typography.heading.h3, marginBottom: spacing[2] }}>
                  🔒 Privacy & Data Protection
                </h3>
                <p style={{ marginBottom: spacing[2], color: colors.text.secondary }}>
                  GDPR requests, data deletion, or privacy concerns?
                </p>
                <a
                  href="mailto:privacy@lstream.app"
                  style={{ color: colors.primary[600], textDecoration: "none", fontWeight: typography.fontWeight.medium }}
                >
                  privacy@lstream.app
                </a>
              </div>

              {/* Legal */}
              <div style={{
                padding: spacing[4],
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.lg
              }}>
                <h3 style={{ ...typography.heading.h3, marginBottom: spacing[2] }}>
                  ⚖️ Legal
                </h3>
                <p style={{ marginBottom: spacing[2], color: colors.text.secondary }}>
                  Terms of Service, legal notices, or compliance questions?
                </p>
                <a
                  href="mailto:legal@lstream.app"
                  style={{ color: colors.primary[600], textDecoration: "none", fontWeight: typography.fontWeight.medium }}
                >
                  legal@lstream.app
                </a>
              </div>
            </div>
          </section>

          {/* Self-Service */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>Self-Service Resources</h2>
            <p style={{ marginBottom: spacing[4] }}>
              Many questions can be answered through our self-service resources:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li style={{ marginBottom: spacing[2] }}>
                <Link href="/dashboard/guide" style={{ color: colors.primary[600], textDecoration: "none" }}>
                  LinkedIn Export Guide
                </Link> - Step-by-step instructions for exporting your LinkedIn data
              </li>
              <li style={{ marginBottom: spacing[2] }}>
                <Link href="/privacy" style={{ color: colors.primary[600], textDecoration: "none" }}>
                  Privacy Policy
                </Link> - Learn how we protect your data
              </li>
              <li style={{ marginBottom: spacing[2] }}>
                <Link href="/terms" style={{ color: colors.primary[600], textDecoration: "none" }}>
                  Terms of Service
                </Link> - Understand our terms and conditions
              </li>
            </ul>
          </section>

          {/* Account Management */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>Account Management</h2>
            <p style={{ marginBottom: spacing[4] }}>
              Need to manage your account? You can handle most account tasks directly through your dashboard:
            </p>
            <ul style={{ marginLeft: spacing[6], marginBottom: spacing[4] }}>
              <li style={{ marginBottom: spacing[2] }}>
                <Link href="/dashboard" style={{ color: colors.primary[600], textDecoration: "none" }}>
                  Dashboard
                </Link> - View your backups and analytics
              </li>
              <li style={{ marginBottom: spacing[2] }}>
                <Link href="/dashboard/subscription" style={{ color: colors.primary[600], textDecoration: "none" }}>
                  Subscription Management
                </Link> - Upgrade, downgrade, or cancel your plan
              </li>
              <li style={{ marginBottom: spacing[2] }}>
                <strong>Data Export:</strong> Access through your dashboard under Settings
              </li>
            </ul>
          </section>

          {/* Response Times */}
          <section style={{ marginBottom: spacing[8] }}>
            <h2 style={{ ...typography.heading.h2, marginBottom: spacing[4] }}>Expected Response Times</h2>
            <div style={{
              background: colors.gray[50],
              padding: spacing[4],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.border.default}`
            }}>
              <ul style={{ marginLeft: spacing[6], marginBottom: 0 }}>
                <li style={{ marginBottom: spacing[2] }}>
                  <strong>Support Requests:</strong> 24 hours (business days)
                </li>
                <li style={{ marginBottom: spacing[2] }}>
                  <strong>Billing Inquiries:</strong> 48 hours
                </li>
                <li style={{ marginBottom: spacing[2] }}>
                  <strong>Privacy/GDPR Requests:</strong> 30 days (as required by law)
                </li>
                <li>
                  <strong>Sales Inquiries:</strong> 1-2 business days
                </li>
              </ul>
            </div>
          </section>

          {/* Business Hours Note */}
          <section style={{ marginBottom: spacing[8] }}>
            <div style={{
              background: colors.primary[50],
              padding: spacing[4],
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.primary[200]}`
            }}>
              <p style={{ marginBottom: spacing[2], fontWeight: typography.fontWeight.semibold, color: colors.primary[700] }}>
                💡 Business Hours
              </p>
              <p style={{ marginBottom: 0, fontSize: typography.fontSize.sm, color: colors.primary[700] }}>
                Our support team operates Monday through Friday, 9:00 AM - 6:00 PM GMT.
                While we receive emails 24/7, responses outside business hours will be sent on the next business day.
              </p>
            </div>
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
          <Link href="/terms" style={{ color: colors.primary[600], textDecoration: "none" }}>
            Terms of Service
          </Link>
          <Link href="/" style={{ color: colors.primary[600], textDecoration: "none" }}>
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
