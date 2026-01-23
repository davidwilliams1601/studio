"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { validateLinkedInFile, formatFileSize } from "@/lib/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { colors, spacing, typography, containers, shadows, borderRadius } from "@/styles/design-tokens";

// Helper functions for tier display
function getTierBadge(tier: string): string {
  const tierLower = tier.toLowerCase();
  if (tierLower === 'pro') return '💎 Pro';
  if (tierLower === 'business') return '🏢 Business';
  if (tierLower === 'enterprise') return '🚀 Enterprise';
  return '🆓 Free';
}

function getTierStyle(tier: string) {
  const tierLower = tier.toLowerCase();
  if (tierLower === 'pro') return { background: '#dbeafe', color: '#1e40af' };
  if (tierLower === 'business') return { background: '#dcfce7', color: '#166534' };
  if (tierLower === 'enterprise') return { background: '#fef3c7', color: '#92400e' };
  return { background: '#f3f4f6', color: '#6b7280' };
}

interface Backup {
  id: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  stats: {
    connections: number;
    messages: number;
    posts: number;
    comments: number;
    reactions: number;
    companies: number;
    invitations: number;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(true);
  const [userTier, setUserTier] = useState<string>("free");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user needs onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user || authLoading) return;

      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/users/onboarding', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (!data.hasCompletedOnboarding) {
            // Redirect to welcome page for first-time users
            router.push('/dashboard/welcome');
            return;
          }
        }
      } catch (error) {
        console.error('Failed to check onboarding:', error);
        // Don't block user if check fails
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch user's backups and tier
  useEffect(() => {
    const fetchData = async () => {
      if (!user || authLoading) return;

      try {
        const idToken = await user.getIdToken();

        // Fetch backups
        const backupsResponse = await fetch('/api/backups', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (backupsResponse.ok) {
          const data = await backupsResponse.json();
          setBackups(data.backups || []);
        }

        // Fetch subscription status (includes tier)
        const statusResponse = await fetch('/api/subscription/status', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (statusResponse.ok) {
          const data = await statusResponse.json();
          setUserTier(data.plan || 'free');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoadingBackups(false);
      }
    };

    fetchData();
  }, [user, authLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateLinkedInFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      setSelectedFile(null);
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file
      const validation = validateLinkedInFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        setSelectedFile(null);
        return;
      }

      setError("");
      setSelectedFile(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', user.uid);

      // Send to analyze API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Refresh backups list
      try {
        const idToken = await user.getIdToken();
        const backupsResponse = await fetch('/api/backups', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
        if (backupsResponse.ok) {
          const backupsData = await backupsResponse.json();
          setBackups(backupsData.backups || []);
        }
      } catch (backupError) {
        console.error('Failed to refresh backups:', backupError);
      }

      // Store results and redirect to results page
      sessionStorage.setItem('analysisResults', JSON.stringify(data.data));
      router.push('/dashboard/results');

    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || checkingOnboarding) {
    return (
      <div style={{ minHeight: "100vh", background: colors.surface }}>
        <SkeletonDashboard />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.surface,
      padding: spacing[4]
    }}>
      <div style={{ maxWidth: containers.md, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: spacing[8] }}>
          <h1 style={{
            ...typography.heading.h1,
            marginBottom: spacing[3]
          }}>
            🛡️ LinkStream Dashboard
          </h1>
          <p style={{
            fontSize: typography.fontSize.lg,
            color: colors.text.secondary,
            marginBottom: spacing[3]
          }}>
            Welcome, {user.email}!
          </p>
          <div style={{
            display: "inline-block",
            padding: `${spacing[1]} ${spacing[4]}`,
            borderRadius: borderRadius.full,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            ...getTierStyle(userTier)
          }}>
            {getTierBadge(userTier)}
          </div>
        </div>

        {/* Help Banner */}
        {!selectedFile && !uploading && (
          <Card
            variant="bordered"
            padding="md"
            style={{
              background: colors.primary[50],
              borderColor: colors.primary[200],
              marginBottom: spacing[6]
            }}
          >
            <div style={{ display: "flex", alignItems: "start", gap: spacing[3] }}>
              <span style={{ fontSize: "1.5rem" }}>💡</span>
              <div>
                <p style={{
                  margin: `0 0 ${spacing[2]} 0`,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.primary[700]
                }}>
                  Need to get your LinkedIn data?
                </p>
                <p style={{
                  margin: `0 0 ${spacing[4]} 0`,
                  fontSize: typography.fontSize.sm,
                  color: colors.primary[700]
                }}>
                  Follow our step-by-step guide to export your data from LinkedIn. It takes about 10 minutes.
                </p>
                <Link href="/dashboard/guide" passHref legacyBehavior>
                  <a style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="sm">
                      📖 View Export Guide
                    </Button>
                  </a>
                </Link>
              </div>
            </div>
          </Card>
        )}

        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle as="h2">Upload Your LinkedIn Data</CardTitle>
            <p style={{
              color: colors.text.secondary,
              marginTop: spacing[2],
              fontSize: typography.fontSize.base
            }}>
              Upload your LinkedIn data export to analyze your network and create a secure backup.
            </p>
          </CardHeader>

          <CardContent>
            {error && (
              <div style={{
                background: colors.danger[50],
                border: `1px solid ${colors.danger[200]}`,
                color: colors.danger[700],
                padding: spacing[3],
                borderRadius: borderRadius.lg,
                marginBottom: spacing[4],
                fontSize: typography.fontSize.sm
              }}>
                {error}
              </div>
            )}

            {uploading ? (
              <div style={{ padding: spacing[8], textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: spacing[4] }}>⚙️</div>
                <h3 style={{ ...typography.heading.h3, marginBottom: spacing[2] }}>
                  Analyzing Your LinkedIn Data...
                </h3>
                <p style={{ color: colors.text.secondary, marginTop: spacing[2] }}>
                  This may take a few moments depending on your network size.
                </p>
                <div style={{
                  width: "100%",
                  height: "8px",
                  background: colors.gray[200],
                  borderRadius: borderRadius.md,
                  marginTop: spacing[4],
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: "50%",
                    height: "100%",
                    background: colors.success[500],
                    animation: "pulse 1.5s ease-in-out infinite"
                  }} />
                </div>
              </div>
            ) : (
              <>
                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleBrowseClick}
                  style={{
                    border: `2px dashed ${isDragging ? colors.primary[500] : colors.border.default}`,
                    borderRadius: borderRadius.xl,
                    padding: spacing[12],
                    textAlign: "center",
                    cursor: "pointer",
                    background: isDragging ? colors.primary[50] : colors.surface,
                    transition: "all 0.2s",
                    marginBottom: spacing[4]
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: spacing[4] }}>
                    {isDragging ? "📂" : "📁"}
                  </div>
                  <h3 style={{ ...typography.heading.h4, marginBottom: spacing[2] }}>
                    {isDragging ? "Drop your file here" : "Drag & drop your LinkedIn export"}
                  </h3>
                  <p style={{
                    color: colors.text.secondary,
                    fontSize: typography.fontSize.sm,
                    marginBottom: spacing[4]
                  }}>
                    or click to browse for a file
                  </p>
                  <p style={{
                    color: colors.text.secondary,
                    fontSize: typography.fontSize.xs
                  }}>
                    Accepts: .zip files only
                  </p>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  disabled={uploading}
                  style={{ display: "none" }}
                />

                {selectedFile && (
                  <div style={{
                    background: colors.success[50],
                    border: `1px solid ${colors.success[200]}`,
                    padding: spacing[4],
                    borderRadius: borderRadius.lg,
                    marginBottom: spacing[4],
                    fontSize: typography.fontSize.sm,
                    display: "flex",
                    alignItems: "center",
                    gap: spacing[2]
                  }}>
                    <span style={{ fontSize: "1.5rem" }}>✓</span>
                    <div>
                      <div style={{ fontWeight: typography.fontWeight.semibold }}>
                        {selectedFile.name}
                      </div>
                      <div style={{ color: colors.text.secondary }}>
                        {formatFileSize(selectedFile.size)}
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || uploading}
                  variant="primary"
                  size="lg"
                  fullWidth
                  style={{
                    background: selectedFile ? undefined : colors.gray[400]
                  }}
                >
                  🛡️ Analyze & Protect
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Team Management Card - Business Tier Only */}
        {userTier === 'business' && (
          <Card
            variant="elevated"
            padding="lg"
            style={{
              marginTop: spacing[8],
              background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.success[50]} 100%)`,
              border: `2px solid ${colors.primary[200]}`
            }}
          >
            <CardHeader>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: spacing[4] }}>
                <div>
                  <CardTitle as="h2">👥 Team Management</CardTitle>
                  <p style={{
                    color: colors.text.secondary,
                    marginTop: spacing[2],
                    fontSize: typography.fontSize.sm
                  }}>
                    Invite team members and manage your Business tier seats
                  </p>
                </div>
                <Link href="/dashboard/team" passHref legacyBehavior>
                  <a style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="lg">
                      Manage Team →
                    </Button>
                  </a>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: spacing[4],
                marginTop: spacing[4]
              }}>
                <div style={{
                  background: "white",
                  padding: spacing[4],
                  borderRadius: borderRadius.lg,
                  textAlign: "center"
                }}>
                  <div style={{
                    fontSize: typography.fontSize["2xl"],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.primary[600],
                    marginBottom: spacing[1]
                  }}>
                    10
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    Available Seats
                  </div>
                </div>
                <div style={{
                  background: "white",
                  padding: spacing[4],
                  borderRadius: borderRadius.lg,
                  textAlign: "center"
                }}>
                  <div style={{
                    fontSize: typography.fontSize["2xl"],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.success[600],
                    marginBottom: spacing[1]
                  }}>
                    ✓
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    Team Benefits Active
                  </div>
                </div>
                <div style={{
                  background: "white",
                  padding: spacing[4],
                  borderRadius: borderRadius.lg,
                  textAlign: "center"
                }}>
                  <div style={{
                    fontSize: typography.fontSize["2xl"],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.primary[600],
                    marginBottom: spacing[1]
                  }}>
                    📧
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    Email Invitations
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Previous Backups */}
        {!loadingBackups && backups.length > 0 && (
          <Card
            variant="elevated"
            padding="lg"
            style={{ marginTop: spacing[8] }}
          >
            <CardHeader>
              <CardTitle as="h2">📁 Your Backups</CardTitle>
              <p style={{
                color: colors.text.secondary,
                marginTop: spacing[2],
                fontSize: typography.fontSize.sm
              }}>
                Click on any backup to view its analysis
              </p>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
                {backups.map((backup) => (
                  <Card
                    key={backup.id}
                    variant="interactive"
                    padding="md"
                    onClick={() => {
                      // Store backup data and redirect to results
                      sessionStorage.setItem('analysisResults', JSON.stringify(backup));
                      router.push('/dashboard/results');
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      gap: spacing[4],
                      flexWrap: "wrap"
                    }}>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <div style={{
                          fontWeight: typography.fontWeight.semibold,
                          marginBottom: spacing[1]
                        }}>
                          {backup.fileName}
                        </div>
                        <div style={{
                          fontSize: typography.fontSize.sm,
                          color: colors.text.secondary
                        }}>
                          {new Date(backup.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div style={{
                        display: "flex",
                        gap: spacing[6],
                        fontSize: typography.fontSize.sm,
                        color: colors.text.secondary
                      }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.primary[600]
                          }}>
                            {backup.stats.connections}
                          </div>
                          <div>Connections</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.primary[600]
                          }}>
                            {backup.stats.messages}
                          </div>
                          <div>Messages</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.primary[600]
                          }}>
                            {backup.stats.posts}
                          </div>
                          <div>Posts</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div style={{
          display: "flex",
          gap: spacing[4],
          justifyContent: "center",
          marginTop: spacing[8],
          flexWrap: "wrap",
          padding: spacing[4]
        }}>
          <Link href="/dashboard/guide" passHref legacyBehavior>
            <a style={{
              color: colors.primary[600],
              textDecoration: "none",
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium
            }}>
              📖 Export Guide
            </a>
          </Link>
          {userTier === 'business' && (
            <>
              <span style={{ color: colors.border.default }}>•</span>
              <Link href="/dashboard/team" passHref legacyBehavior>
                <a style={{
                  color: colors.primary[600],
                  textDecoration: "none",
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium
                }}>
                  👥 Team Management
                </a>
              </Link>
            </>
          )}
          <span style={{ color: colors.border.default }}>•</span>
          <Link href="/dashboard/settings" passHref legacyBehavior>
            <a style={{
              color: colors.primary[600],
              textDecoration: "none",
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium
            }}>
              ⚙️ Settings
            </a>
          </Link>
          <span style={{ color: colors.border.default }}>•</span>
          <Link href="/dashboard/subscription" passHref legacyBehavior>
            <a style={{
              color: colors.primary[600],
              textDecoration: "none",
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium
            }}>
              💎 Upgrade Plan
            </a>
          </Link>
          <span style={{ color: colors.border.default }}>•</span>
          <Link href="/" passHref legacyBehavior>
            <a style={{
              color: colors.primary[600],
              textDecoration: "none",
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium
            }}>
              ← Home
            </a>
          </Link>
        </div>

        {/* Footer Links */}
        <div style={{
          display: "flex",
          gap: spacing[4],
          justifyContent: "center",
          padding: spacing[4],
          borderTop: `1px solid ${colors.border.light}`,
          marginTop: spacing[4]
        }}>
          <Link href="/privacy" passHref legacyBehavior>
            <a style={{
              color: colors.text.secondary,
              textDecoration: "none",
              fontSize: typography.fontSize.sm
            }}>
              Privacy Policy
            </a>
          </Link>
          <span style={{ color: colors.border.default }}>•</span>
          <Link href="/terms" passHref legacyBehavior>
            <a style={{
              color: colors.text.secondary,
              textDecoration: "none",
              fontSize: typography.fontSize.sm
            }}>
              Terms of Service
            </a>
          </Link>
          <span style={{ color: colors.border.default }}>•</span>
          <Link href="/contact" passHref legacyBehavior>
            <a style={{
              color: colors.text.secondary,
              textDecoration: "none",
              fontSize: typography.fontSize.sm
            }}>
              Contact Us
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
