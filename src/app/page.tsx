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

          <Link href="/login" passHref legacyBehavior>
            <a style={{ textDecoration: 'none' }}>
              <Button
                variant="danger"
                size="lg"
                style={{ fontSize: typography.fontSize.xl }}
              >
                🛡️ Start Free Protection
              </Button>
            </a>
          </Link>
          <p style={{
            fontSize: typography.fontSize.base,
            marginTop: spacing[4],
            opacity: 0.9
          }}>
            Free • No credit card • 2-minute setup
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

          <Link href="/login" passHref legacyBehavior>
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
                🛡️ Start Free Account
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
        <p style={{
          opacity: 0.6,
          fontSize: typography.fontSize.sm
        }}>
          © 2024 LinkStream. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
