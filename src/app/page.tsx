"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { colors, spacing, typography, containers, shadows } from '@/styles/design-tokens';

export default function Home() {
  return (
    <div style={{ background: colors.background, minHeight: "100vh" }}>
      {/* Header */}
      <header style={{
        background: colors.background,
        borderBottom: `1px solid ${colors.border.light}`,
        padding: `${spacing[4]} ${spacing[4]}`,
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: shadows.sm
      }}>
        <div style={{
          maxWidth: containers.xl,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: spacing[4]
        }}>
          <h1 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            margin: 0
          }}>
            🛡️ LinkStream
          </h1>
          <div style={{ display: "flex", gap: spacing[2], alignItems: "center" }}>
            <Link href="/login" passHref legacyBehavior>
              <a style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </a>
            </Link>
            <Link href="/login" passHref legacyBehavior>
              <a style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="md">
                  Get Started
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: colors.text.inverse,
        padding: `${spacing[16]} ${spacing[4]}`,
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative elements for depth */}
        <div style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          filter: "blur(60px)"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
          filter: "blur(60px)"
        }} />

        <div style={{ maxWidth: containers.md, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            fontSize: "clamp(3rem, 10vw, 5rem)",
            marginBottom: spacing[4]
          }}>
            🚨
          </div>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: typography.fontWeight.bold,
            marginBottom: spacing[4],
            lineHeight: typography.lineHeight.tight
          }}>
            Your LinkedIn Could Be Gone Tomorrow
          </h1>
          <p style={{
            fontSize: typography.fontSize.xl,
            marginBottom: spacing[8],
            opacity: 0.95,
            lineHeight: typography.lineHeight.relaxed
          }}>
            <strong>700M+ LinkedIn accounts compromised.</strong> Don't lose years of networking to hackers or platform changes.
          </p>

          <div style={{ display: "flex", gap: spacing[4], justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup?plan=pro" passHref legacyBehavior>
              <a style={{ textDecoration: 'none' }}>
                <Button
                  variant="danger"
                  size="lg"
                  style={{ fontSize: typography.fontSize.xl }}
                >
                  🛡️ Get Pro Protection
                </Button>
              </a>
            </Link>
            <Link href="/login" passHref legacyBehavior>
              <a style={{ textDecoration: 'none' }}>
                <Button
                  size="lg"
                  style={{
                    fontSize: typography.fontSize.xl,
                    background: "rgba(255, 255, 255, 0.2)",
                    color: colors.text.inverse,
                    border: "2px solid rgba(255, 255, 255, 0.5)"
                  }}
                >
                  Start Free
                </Button>
              </a>
            </Link>
          </div>
          <p style={{
            fontSize: typography.fontSize.base,
            marginTop: spacing[4],
            opacity: 0.9
          }}>
            Free plan available • No credit card required • 2-minute setup
          </p>
        </div>
      </section>

      {/* Features */}
      <section style={{
        padding: `${spacing[16]} ${spacing[4]}`,
        background: colors.surface
      }}>
        <div style={{ maxWidth: containers.lg, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            ...typography.heading.h2,
            marginBottom: spacing[12]
          }}>
            Complete LinkedIn Protection
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: spacing[6]
          }}>
            <Card variant="elevated" hoverable padding="lg">
              <div style={{ fontSize: "3rem", marginBottom: spacing[4] }}>📥</div>
              <h3 style={{
                ...typography.heading.h4,
                marginBottom: spacing[3]
              }}>
                Automatic Backup
              </h3>
              <p style={{
                color: colors.text.secondary,
                lineHeight: typography.lineHeight.relaxed
              }}>
                Securely backup all your connections, messages, posts, and profile data before disaster strikes.
              </p>
            </Card>

            <Card variant="elevated" hoverable padding="lg">
              <div style={{ fontSize: "3rem", marginBottom: spacing[4] }}>🤖</div>
              <h3 style={{
                ...typography.heading.h4,
                marginBottom: spacing[3]
              }}>
                AI-Powered Insights
              </h3>
              <p style={{
                color: colors.text.secondary,
                lineHeight: typography.lineHeight.relaxed
              }}>
                Get intelligent analysis of your network, growth opportunities, and professional strategy.
              </p>
            </Card>

            <Card variant="elevated" hoverable padding="lg">
              <div style={{ fontSize: "3rem", marginBottom: spacing[4] }}>🚨</div>
              <h3 style={{
                ...typography.heading.h4,
                marginBottom: spacing[3]
              }}>
                Emergency Recovery
              </h3>
              <p style={{
                color: colors.text.secondary,
                lineHeight: typography.lineHeight.relaxed
              }}>
                When disaster strikes, instantly access all your professional connections and data.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{
        padding: `${spacing[16]} ${spacing[4]}`,
        background: colors.background
      }}>
        <div style={{ maxWidth: containers.lg, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: spacing[12] }}>
            <h2 style={{
              ...typography.heading.h2,
              marginBottom: spacing[4]
            }}>
              Choose Your Protection Level
            </h2>
            <p style={{
              fontSize: typography.fontSize.lg,
              color: colors.text.secondary,
              maxWidth: "600px",
              margin: "0 auto"
            }}>
              Start free or go premium for advanced protection and AI-powered insights
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: spacing[6],
            maxWidth: "1000px",
            margin: "0 auto"
          }}>
            {/* Free Plan */}
            <Card variant="bordered" padding="lg" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ ...typography.heading.h3, marginBottom: spacing[2] }}>Free</h3>
                <div style={{ fontSize: "2.5rem", fontWeight: typography.fontWeight.bold, marginBottom: spacing[4], color: colors.text.primary }}>
                  £0<span style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.normal, color: colors.text.secondary }}>/month</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: spacing[6] }}>
                  <li style={{ marginBottom: spacing[2], display: "flex", alignItems: "start" }}>
                    <span style={{ color: colors.success[500], marginRight: spacing[2] }}>✓</span>
                    <span>1 LinkedIn backup per month</span>
                  </li>
                  <li style={{ marginBottom: spacing[2], display: "flex", alignItems: "start" }}>
                    <span style={{ color: colors.success[500], marginRight: spacing[2] }}>✓</span>
                    <span>Basic data export</span>
                  </li>
                  <li style={{ marginBottom: spacing[2], display: "flex", alignItems: "start" }}>
                    <span style={{ color: colors.success[500], marginRight: spacing[2] }}>✓</span>
                    <span>Standard charts</span>
                  </li>
                  <li style={{ marginBottom: spacing[2], display: "flex", alignItems: "start" }}>
                    <span style={{ color: colors.success[500], marginRight: spacing[2] }}>✓</span>
                    <span>Basic PDF reports</span>
                  </li>
                </ul>
              </div>
              <Link href="/login" passHref legacyBehavior>
                <a style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="md" fullWidth>
                    Start Free
                  </Button>
                </a>
              </Link>
            </Card>

            {/* Pro Plan */}
            <Card variant="elevated" padding="lg" style={{ display: "flex", flexDirection: "column", border: `3px solid ${colors.primary[500]}`, position: "relative" }}>
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                background: colors.primary[500],
                color: colors.text.inverse,
                padding: `${spacing[1]} ${spacing[4]}`,
                borderRadius: "20px",
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.bold
              }}>
                🛡️ Most Popular
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ ...typography.heading.h3, marginBottom: spacing[2] }}>Pro</h3>
                <div style={{ fontSize: "2.5rem", fontWeight: typography.fontWeight.bold, marginBottom: spacing[4], color: colors.primary[600] }}>
                  £10<span style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.normal, color: colors.text.secondary }}>/month</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: spacing[6] }}>
                  <li style={{ marginBottom: spacing[2], display: "flex", alignItems: "start" }}>
                    <span style={{ color: colors.success[500], marginRight: spacing[2] }}>✓</span>
                    <span><strong>4 backups per month</strong></span>
                  </li>
                  <li style={{ marginBottom: spacing[2], display: "flex", alignItems: "start" }}>
                    <span style={{ color: colors.success[500], marginRight: spacing[2] }}>✓</span>
                    <span><strong>AI-powered insights</strong></span>
                  </li>
                  <li style={{ marginBottom: spacing[2], display: "flex", alignItems: "start" }}>
                    <span style={{ color: colors.success[500], marginRight: spacing[2] }}>✓</span>
                    <span>Professional PDF reports</span>
                  </li>
                  <li style={{ marginBottom: spacing[2], display: "flex", alignItems: "start" }}>
                    <span style={{ color: colors.success[500], marginRight: spacing[2] }}>✓</span>
                    <span>Historical tracking</span>
                  </li>
                  <li style={{ marginBottom: spacing[2], display: "flex", alignItems: "start" }}>
                    <span style={{ color: colors.success[500], marginRight: spacing[2] }}>✓</span>
                    <span>Network analysis</span>
                  </li>
                  <li style={{ marginBottom: spacing[2], display: "flex", alignItems: "start" }}>
                    <span style={{ color: colors.success[500], marginRight: spacing[2] }}>✓</span>
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
              <Link href="/signup?plan=pro" passHref legacyBehavior>
                <a style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="md" fullWidth>
                    Get Pro
                  </Button>
                </a>
              </Link>
            </Card>

            {/* Business Plan */}
            <Card variant="elevated" padding="lg" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ ...typography.heading.h3, marginBottom: spacing[2] }}>Business</h3>
                <div style={{ fontSize: "2.5rem", fontWeight: typography.fontWeight.bold, marginBottom: spacing[4], color: colors.text.primary }}>
                  £75<span style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.normal, color: colors.text.secondary }}>/month</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: spacing[6] }}>
                  <li style={{ marginBottom: spacing[2], display: "flex", alignItems: "start" }}>
                    <span style={{ color: colors.success[500], marginRight: spacing[2] }}>✓</span>
                    <span><strong>Everything in Pro</strong></span>
                  </li>
                  <li style={{ marginBottom: spacing[2], display: "flex", alignItems: "start" }}>
                    <span style={{ color: colors.success[500], marginRight: spacing[2] }}>✓</span>
                    <span><strong>Unlimited backups</strong></span>
                  </li>
                  <li style={{ marginBottom: spacing[2], display: "flex", alignItems: "start" }}>
                    <span style={{ color: colors.success[500], marginRight: spacing[2] }}>✓</span>
                    <span><strong>Up to 10 team users</strong></span>
                  </li>
                  <li style={{ marginBottom: spacing[2], display: "flex", alignItems: "start" }}>
                    <span style={{ color: colors.success[500], marginRight: spacing[2] }}>✓</span>
                    <span>Shared team analytics</span>
                  </li>
                  <li style={{ marginBottom: spacing[2], display: "flex", alignItems: "start" }}>
                    <span style={{ color: colors.success[500], marginRight: spacing[2] }}>✓</span>
                    <span>Audit logs & compliance</span>
                  </li>
                </ul>
              </div>
              <Link href="/signup?plan=business" passHref legacyBehavior>
                <a style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="md" fullWidth>
                    Get Business
                  </Button>
                </a>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: `${spacing[16]} ${spacing[4]}`,
        background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
        color: colors.text.inverse,
        textAlign: "center"
      }}>
        <div style={{ maxWidth: containers.md, margin: "0 auto" }}>
          <h2 style={{
            ...typography.heading.h2,
            marginBottom: spacing[4]
          }}>
            Don't Wait Until It's Too Late
          </h2>
          <p style={{
            fontSize: typography.fontSize.xl,
            marginBottom: spacing[8],
            opacity: 0.95,
            lineHeight: typography.lineHeight.relaxed
          }}>
            Every day you wait is another day your professional network is at risk.
          </p>

          <Link href="/signup?plan=pro" passHref legacyBehavior>
            <a style={{ textDecoration: 'none' }}>
              <Button
                size="lg"
                style={{
                  background: colors.background,
                  color: colors.danger[600],
                  fontSize: typography.fontSize.xl,
                  boxShadow: shadows.xl
                }}
              >
                🛡️ Get Pro Protection
              </Button>
            </a>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: colors.gray[900],
        color: colors.text.inverse,
        padding: `${spacing[12]} ${spacing[4]}`,
        textAlign: "center"
      }}>
        <h3 style={{
          ...typography.heading.h4,
          marginBottom: spacing[2]
        }}>
          🛡️ LinkStream
        </h3>
        <p style={{
          opacity: 0.8,
          fontSize: typography.fontSize.base,
          marginBottom: spacing[6]
        }}>
          Protecting professional networks worldwide
        </p>
        <div style={{
          display: "flex",
          gap: spacing[6],
          justifyContent: "center",
          marginBottom: spacing[6],
          flexWrap: "wrap"
        }}>
          <Link href="/privacy" style={{ color: colors.text.inverse, opacity: 0.8, textDecoration: "none", fontSize: typography.fontSize.sm }}>
            Privacy Policy
          </Link>
          <Link href="/terms" style={{ color: colors.text.inverse, opacity: 0.8, textDecoration: "none", fontSize: typography.fontSize.sm }}>
            Terms of Service
          </Link>
          <Link href="/contact" style={{ color: colors.text.inverse, opacity: 0.8, textDecoration: "none", fontSize: typography.fontSize.sm }}>
            Contact
          </Link>
        </div>
        <p style={{
          opacity: 0.6,
          fontSize: typography.fontSize.sm
        }}>
          © {new Date().getFullYear()} LinkStream. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
