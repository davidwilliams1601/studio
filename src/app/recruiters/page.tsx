"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RecruitersPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Navigation */}
      <nav style={{
        padding: "1.5rem 2rem",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <Link href="/" style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", textDecoration: "none" }}>
          🛡️ LinkStream
        </Link>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link href="/login" style={{ color: "#64748b", textDecoration: "none", fontWeight: "500" }}>
            Login
          </Link>
          <Link href="/signup">
            <Button variant="primary">Get Protected</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: "4rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        textAlign: "center"
      }}>
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          padding: "0.75rem 1.5rem",
          borderRadius: "9999px",
          display: "inline-block",
          marginBottom: "2rem",
          fontSize: "0.875rem",
          fontWeight: "600",
          color: "#991b1b"
        }}>
          ⚠️ 10 million LinkedIn hacking incidents occurred in 2024
        </div>

        <h1 style={{
          fontSize: "3.5rem",
          fontWeight: "bold",
          lineHeight: "1.2",
          marginBottom: "1.5rem",
          color: "#1e293b"
        }}>
          Your LinkedIn Network is Worth<br />
          <span style={{ color: "#ef4444" }}>£250,000+</span>
          <br />
          What If You Lost It Tomorrow?
        </h1>

        <p style={{
          fontSize: "1.25rem",
          color: "#64748b",
          maxWidth: "700px",
          margin: "0 auto 2rem"
        }}>
          Protect your most valuable asset. Instant backup, CSV export, and AI insights for recruitment professionals.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "3rem" }}>
          <Link href="/signup">
            <Button size="lg" style={{ fontSize: "1.125rem", padding: "1.25rem 2.5rem" }}>
              🛡️ Protect My Network Now
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="outline" size="lg" style={{ fontSize: "1.125rem", padding: "1.25rem 2.5rem" }}>
              See How It Works
            </Button>
          </a>
        </div>

        {/* Social Proof */}
        <div style={{
          display: "flex",
          gap: "2rem",
          justifyContent: "center",
          alignItems: "center",
          color: "#64748b",
          fontSize: "0.875rem"
        }}>
          <div>✅ 2-minute setup</div>
          <div>✅ GDPR compliant</div>
          <div>✅ Instant CSV export</div>
        </div>
      </section>

      {/* The Problem Section */}
      <section style={{
        padding: "4rem 2rem",
        background: "#f8fafc"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "3rem",
            color: "#1e293b"
          }}>
            Every Recruiter Knows Someone This Happened To
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem"
          }}>
            {[
              {
                icon: "🚫",
                title: "Account Hacked",
                desc: "10 years of connections. Gone overnight. Recovery? Impossible.",
                stat: "~10M incidents in 2024"
              },
              {
                icon: "⚠️",
                title: "Unexpected Ban",
                desc: "LinkedIn flags your account for 'unusual activity'. No warning. No appeal.",
                stat: "Data scraping & fraud"
              },
              {
                icon: "🏢",
                title: "Agency Switch",
                desc: "Moving to a competitor? Your network stays behind. Start from zero.",
                stat: "Every job change"
              }
            ].map((problem, i) => (
              <Card key={i} style={{
                padding: "2rem",
                background: "white",
                border: "2px solid #fee2e2",
                borderRadius: "12px"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{problem.icon}</div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.75rem", color: "#1e293b" }}>
                  {problem.title}
                </h3>
                <p style={{ color: "#64748b", marginBottom: "1rem", lineHeight: "1.6" }}>
                  {problem.desc}
                </p>
                <div style={{
                  background: "#fef2f2",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#991b1b"
                }}>
                  {problem.stat}
                </div>
              </Card>
            ))}
          </div>

          <div style={{
            marginTop: "3rem",
            padding: "2rem",
            background: "white",
            borderRadius: "12px",
            border: "2px solid #fef3c7",
            textAlign: "center"
          }}>
            <p style={{ fontSize: "1.25rem", fontWeight: "600", color: "#92400e", marginBottom: "0.5rem" }}>
              💰 Lost Network = Lost Placements
            </p>
            <p style={{ color: "#64748b" }}>
              Average recruiter makes 8-12 placements per year. Lose your network? Lose 6-9 months of income while rebuilding.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="how-it-works" style={{
        padding: "4rem 2rem",
        background: "white"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "1rem",
            color: "#1e293b"
          }}>
            Network Insurance for Recruiters
          </h2>
          <p style={{
            textAlign: "center",
            fontSize: "1.125rem",
            color: "#64748b",
            marginBottom: "3rem",
            maxWidth: "700px",
            margin: "0 auto 3rem"
          }}>
            Upload once. Protected forever. Access your contacts anywhere, anytime.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            marginBottom: "3rem"
          }}>
            {[
              {
                step: "1",
                icon: "⬇️",
                title: "Download Your LinkedIn Data",
                desc: "Request your data export from LinkedIn (takes 10 minutes)"
              },
              {
                step: "2",
                icon: "⬆️",
                title: "Upload to LinkStream",
                desc: "Drag & drop your ZIP file. Fully encrypted and GDPR compliant."
              },
              {
                step: "3",
                icon: "✅",
                title: "Protected Forever",
                desc: "Access your network as CSV anytime. Switch agencies with confidence."
              }
            ].map((step, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "#dbeafe",
                  color: "#1e40af",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem"
                }}>
                  {step.step}
                </div>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{step.icon}</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.75rem", color: "#1e293b" }}>
                  {step.title}
                </h3>
                <p style={{ color: "#64748b", lineHeight: "1.6" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: "4rem 2rem",
        background: "#f8fafc"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "3rem",
            color: "#1e293b"
          }}>
            Built Specifically for Recruiters
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem"
          }}>
            {[
              {
                icon: "📊",
                title: "Instant CSV Export",
                desc: "Download your entire network as a spreadsheet. Import to your CRM, email, or ATS."
              },
              {
                icon: "🔒",
                title: "Secure Backup",
                desc: "Military-grade encryption. Your data is stored safely and privately."
              },
              {
                icon: "🤖",
                title: "AI Network Analysis",
                desc: "See which candidates you're strongest with. Identify gaps in your network."
              },
              {
                icon: "🏢",
                title: "Agency Switch Ready",
                desc: "Moving to a competitor? Take your network with you (legally)."
              },
              {
                icon: "📈",
                title: "Network Insights",
                desc: "Track growth over time. See your strongest sectors and locations."
              },
              {
                icon: "⚡",
                title: "2-Minute Setup",
                desc: "No integrations. No complexity. Just upload and you're protected."
              }
            ].map((feature, i) => (
              <Card key={i} style={{
                padding: "2rem",
                background: "white",
                borderRadius: "12px"
              }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{feature.icon}</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.75rem", color: "#1e293b" }}>
                  {feature.title}
                </h3>
                <p style={{ color: "#64748b", lineHeight: "1.6" }}>
                  {feature.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{
        padding: "4rem 2rem",
        background: "white"
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "1rem",
            color: "#1e293b"
          }}>
            Cheaper Than One Lost Placement
          </h2>
          <p style={{
            textAlign: "center",
            fontSize: "1.125rem",
            color: "#64748b",
            marginBottom: "3rem"
          }}>
            Average recruiter commission: £5,000-£20,000 per placement
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem"
          }}>
            <Card style={{
              padding: "2rem",
              border: "2px solid #e5e7eb",
              borderRadius: "12px",
              background: "white"
            }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Pro</h3>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#3b82f6" }}>
                £10<span style={{ fontSize: "1rem", color: "#64748b" }}>/month</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}>
                {["4 backups per month", "CSV export", "AI network insights", "Enhanced analytics"].map((item, i) => (
                  <li key={i} style={{ marginBottom: "0.75rem", color: "#64748b" }}>
                    ✅ {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=pro">
                <Button variant="outline" fullWidth>Get Started</Button>
              </Link>
            </Card>

            <Card style={{
              padding: "2rem",
              border: "3px solid #3b82f6",
              borderRadius: "12px",
              background: "white",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#3b82f6",
                color: "white",
                padding: "0.25rem 1rem",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: "bold"
              }}>
                MOST POPULAR
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Business</h3>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#3b82f6" }}>
                £75<span style={{ fontSize: "1rem", color: "#64748b" }}>/month</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}>
                {["Everything in Pro", "Unlimited backups", "Up to 10 team users", "Shared team analytics", "Audit logs & compliance"].map((item, i) => (
                  <li key={i} style={{ marginBottom: "0.75rem", color: "#64748b" }}>
                    ✅ {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=business">
                <Button variant="primary" fullWidth>Get Started</Button>
              </Link>
            </Card>

            <Card style={{
              padding: "2rem",
              border: "2px solid #e5e7eb",
              borderRadius: "12px",
              background: "white"
            }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Enterprise</h3>
              <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#3b82f6" }}>
                Custom<span style={{ fontSize: "1rem", color: "#64748b" }}> pricing</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}>
                {["Everything in Business", "Unlimited team members", "SSO integration", "API access", "Dedicated security consultant", "Priority incident response"].map((item, i) => (
                  <li key={i} style={{ marginBottom: "0.75rem", color: "#64748b" }}>
                    ✅ {item}
                  </li>
                ))}
              </ul>
              <Link href="/contact">
                <Button variant="outline" fullWidth>Contact Sales</Button>
              </Link>
            </Card>
          </div>

          <p style={{
            textAlign: "center",
            marginTop: "2rem",
            color: "#64748b",
            fontSize: "0.875rem"
          }}>
            💰 One placement (avg. £5k-£20k commission) pays for years of protection
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: "4rem 2rem",
        background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
        color: "white",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "1.5rem"
          }}>
            Don't Wait Until It's Too Late
          </h2>
          <p style={{
            fontSize: "1.25rem",
            marginBottom: "2rem",
            opacity: 0.9
          }}>
            Join hundreds of recruiters protecting their most valuable asset
          </p>
          <Link href="/signup">
            <Button size="lg" style={{
              background: "white",
              color: "#3b82f6",
              fontSize: "1.125rem",
              padding: "1.25rem 2.5rem"
            }}>
              🛡️ Protect My Network Now
            </Button>
          </Link>
          <p style={{ marginTop: "1rem", fontSize: "0.875rem", opacity: 0.8 }}>
            2-minute setup • No credit card required for trial
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "2rem",
        background: "#1e293b",
        color: "#94a3b8",
        textAlign: "center"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>© 2026 LinkStream. All rights reserved.</div>
          <div style={{ display: "flex", gap: "2rem" }}>
            <Link href="/privacy" style={{ color: "#94a3b8", textDecoration: "none" }}>Privacy</Link>
            <Link href="/terms" style={{ color: "#94a3b8", textDecoration: "none" }}>Terms</Link>
            <Link href="/contact" style={{ color: "#94a3b8", textDecoration: "none" }}>Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
