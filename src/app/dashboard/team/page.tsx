"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
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

  const usedSeats = team.memberIds.length + team.invites.filter(i => i.status === 'pending').length;
  const availableSeats = team.maxSeats - usedSeats;

  return (
    <div style={{ padding: spacing[6], maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: spacing[2] }}>Team Management</h1>

      {error && <div style={{ background: colors.danger[50], padding: spacing[3], marginBottom: spacing[4] }}>{error}</div>}
      {success && <div style={{ background: colors.success[50], padding: spacing[3], marginBottom: spacing[4] }}>{success}</div>}

      <Card variant="elevated" padding="lg" style={{ marginBottom: spacing[6] }}>
        <div>Seats: {usedSeats} / {team.maxSeats} used</div>
      </Card>

      {isOwner && availableSeats > 0 && (
        <Card variant="bordered" padding="lg" style={{ marginBottom: spacing[6] }}>
          <h3>Invite Team Member</h3>
          <form onSubmit={handleInvite} style={{ display: "flex", gap: spacing[3] }}>
            <input
              type="email"
              placeholder="teammate@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              style={{ flex: 1, padding: spacing[3] }}
            />
            <Button type="submit" variant="primary" disabled={inviting}>
              {inviting ? 'Sending...' : 'Send Invite'}
            </Button>
          </form>
        </Card>
      )}

      <Card variant="elevated" padding="lg">
        <h3>Team Members ({team.members.length})</h3>
        {team.members.map((member) => (
          <div key={member.uid} style={{ padding: spacing[4], borderBottom: `1px solid ${colors.border.light}` }}>
            <div>{member.displayName || member.email} {member.role === 'owner' && '(Owner)'}</div>
            <div style={{ fontSize: '0.875rem', color: colors.text.secondary }}>{member.email}</div>
            {isOwner && member.role !== 'owner' && (
              <Button variant="danger" size="sm" onClick={() => handleRemoveMember(member.uid, member.email)}>Remove</Button>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}
