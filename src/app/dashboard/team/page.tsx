"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { colors, spacing, typography } from "@/styles/design-tokens";

interface TeamMember {
  uid: string;
  email: string;
  displayName: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}

interface TeamInvite {
  email: string;
  token: string;
  status: string;
  invitedAt: Date;
}

interface Team {
  id: string;
  ownerId: string;
  maxSeats: number;
  memberIds: string[];
  invites: TeamInvite[];
  members: TeamMember[];
}

export default function TeamPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      fetchTeam();
    }
  }, [user]);

  const fetchTeam = async () => {
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/team', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (data.success && data.team) {
        setTeam(data.team);
        setIsOwner(data.isOwner);
      }
    } catch (err) {
      console.error('Failed to fetch team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError("");
    setSuccess("");

    try {
      const idToken = await user?.getIdToken();
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Invitation sent to ${inviteEmail}`);
        setInviteEmail("");
        fetchTeam();
      } else {
        setError(data.error || 'Failed to send invitation');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Remove ${memberEmail} from the team?`)) return;

    try {
      const idToken = await user?.getIdToken();
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Removed ${memberEmail} from team`);
        fetchTeam();
      } else {
        setError(data.error || 'Failed to remove member');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: spacing[6], textAlign: "center" }}>
        <h3>Loading team...</h3>
      </div>
    );
  }

  if (!team) {
    return (
      <div style={{ padding: spacing[6] }}>
        <Card variant="bordered" padding="lg">
          <CardContent>
            <div style={{ textAlign: "center", padding: spacing[8] }}>
              <h2 style={{ marginBottom: spacing[2] }}>No Team Yet</h2>
              <p style={{ color: colors.text.secondary, marginBottom: spacing[6] }}>
                Upgrade to Business tier to create a team.
              </p>
              <Button variant="primary" size="lg" onClick={() => router.push('/dashboard/subscription')}>
                Upgrade to Business
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCancelInvite = async (token: string, email: string) => {
    if (!confirm(`Cancel invitation for ${email}?`)) return;

    try {
      const idToken = await user?.getIdToken();
      const response = await fetch(`/api/team/members/${token}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Invitation cancelled for ${email}`);
        fetchTeam();
      } else {
        setError(data.error || 'Failed to cancel invitation');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel invitation');
    }
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/signup?team=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setSuccess('Invite link copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const usedSeats = team.memberIds.length + team.invites.filter(i => i.status === 'pending').length;
  const availableSeats = team.maxSeats - usedSeats;
  const pendingInvites = team.invites.filter(i => i.status === 'pending');

  return (
    <div style={{ padding: spacing[6], maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: spacing[6] }}>
        <Link href="/dashboard" style={{ color: colors.primary[600], textDecoration: "none", fontSize: typography.fontSize.base }}>
          ← Back to Dashboard
        </Link>
      </div>
      <h1 style={{ marginBottom: spacing[2], fontSize: typography.fontSize["2xl"], fontWeight: typography.fontWeight.bold }}>Team Management</h1>
      <p style={{ color: colors.text.secondary, marginBottom: spacing[6] }}>
        Manage your team members and invitations for Business tier access.
      </p>

      {error && (
        <div style={{
          background: colors.danger[50],
          color: colors.danger[700],
          padding: spacing[4],
          marginBottom: spacing[4],
          borderRadius: "8px",
          border: `1px solid ${colors.danger[200]}`
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          background: colors.success[50],
          color: colors.success[700],
          padding: spacing[4],
          marginBottom: spacing[4],
          borderRadius: "8px",
          border: `1px solid ${colors.success[200]}`
        }}>
          {success}
        </div>
      )}

      <Card variant="elevated" padding="lg" style={{ marginBottom: spacing[6] }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[1] }}>
              Team Capacity
            </h3>
            <p style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
              {usedSeats} of {team.maxSeats} seats used
            </p>
          </div>
          <div style={{
            fontSize: typography.fontSize["2xl"],
            fontWeight: typography.fontWeight.bold,
            color: availableSeats > 0 ? colors.success[600] : colors.danger[600]
          }}>
            {availableSeats} available
          </div>
        </div>
        <div style={{ marginTop: spacing[4], background: colors.gray[100], borderRadius: "8px", overflow: "hidden" }}>
          <div style={{
            width: `${(usedSeats / team.maxSeats) * 100}%`,
            height: "8px",
            background: usedSeats >= team.maxSeats ? colors.danger[500] : colors.primary[500],
            transition: "width 0.3s ease"
          }}></div>
        </div>
      </Card>

      {isOwner && availableSeats > 0 && (
        <Card variant="bordered" padding="lg" style={{ marginBottom: spacing[6] }}>
          <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[3] }}>
            Invite Team Member
          </h3>
          <form onSubmit={handleInvite} style={{ display: "flex", gap: spacing[3], alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: spacing[2], fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="teammate@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: spacing[3],
                  border: `1px solid ${colors.border.default}`,
                  borderRadius: "6px",
                  fontSize: typography.fontSize.base,
                  boxSizing: "border-box"
                }}
              />
            </div>
            <Button type="submit" variant="primary" disabled={inviting} size="lg">
              {inviting ? 'Sending...' : 'Send Invite'}
            </Button>
          </form>
        </Card>
      )}

      {isOwner && availableSeats === 0 && (
        <Card variant="bordered" padding="lg" style={{ marginBottom: spacing[6], border: `2px solid ${colors.warning[300]}`, background: colors.warning[50] }}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing[3] }}>
            <span style={{ fontSize: "2rem" }}>⚠️</span>
            <div>
              <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[1], color: colors.warning[800] }}>
                Team is Full
              </h3>
              <p style={{ color: colors.warning[700], fontSize: typography.fontSize.sm }}>
                You've reached the maximum of {team.maxSeats} seats. Remove a member or cancel an invite to add someone new.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card variant="elevated" padding="lg" style={{ marginBottom: spacing[6] }}>
        <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[4] }}>
          Team Members ({team.members.length})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: spacing[2] }}>
          {team.members.map((member, index) => (
            <div
              key={member.uid}
              style={{
                padding: spacing[4],
                borderBottom: index < team.members.length - 1 ? `1px solid ${colors.border.light}` : "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: spacing[2], marginBottom: spacing[1] }}>
                  <span style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold }}>
                    {member.displayName || member.email}
                  </span>
                  {member.role === 'owner' && (
                    <span style={{
                      background: colors.primary[100],
                      color: colors.primary[700],
                      padding: `${spacing[1]} ${spacing[2]}`,
                      borderRadius: "4px",
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.semibold
                    }}>
                      OWNER
                    </span>
                  )}
                </div>
                <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                  {member.email}
                </div>
              </div>
              {isOwner && member.role !== 'owner' && (
                <Button variant="danger" size="sm" onClick={() => handleRemoveMember(member.uid, member.email)}>
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {pendingInvites.length > 0 && (
        <Card variant="elevated" padding="lg">
          <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[4] }}>
            Pending Invitations ({pendingInvites.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing[2] }}>
            {pendingInvites.map((invite, index) => (
              <div
                key={invite.token}
                style={{
                  padding: spacing[4],
                  borderBottom: index < pendingInvites.length - 1 ? `1px solid ${colors.border.light}` : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[1] }}>
                    {invite.email}
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    Invited {new Date(invite.invitedAt).toLocaleDateString()}
                  </div>
                </div>
                {isOwner && (
                  <div style={{ display: "flex", gap: spacing[2] }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyInviteLink(invite.token)}
                    >
                      Copy Link
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelInvite(invite.token, invite.email)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Footer Links */}
      <div style={{
        display: "flex",
        gap: spacing[4],
        justifyContent: "center",
        marginTop: spacing[8],
        padding: spacing[4],
        borderTop: `1px solid ${colors.border.light}`
      }}>
        <Link href="/privacy" style={{
          color: colors.text.secondary,
          textDecoration: "none",
          fontSize: typography.fontSize.sm
        }}>
          Privacy Policy
        </Link>
        <span style={{ color: colors.border.default }}>•</span>
        <Link href="/terms" style={{
          color: colors.text.secondary,
          textDecoration: "none",
          fontSize: typography.fontSize.sm
        }}>
          Terms of Service
        </Link>
        <span style={{ color: colors.border.default }}>•</span>
        <Link href="/contact" style={{
          color: colors.text.secondary,
          textDecoration: "none",
          fontSize: typography.fontSize.sm
        }}>
          Contact Us
        </Link>
      </div>
    </div>
  );
}
