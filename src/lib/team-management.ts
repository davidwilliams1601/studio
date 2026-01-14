// Team Management Types and Utilities

export interface TeamInvite {
  email: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  invitedAt: Date;
  invitedBy: string;
}

export interface Team {
  id: string;
  ownerId: string;
  ownerEmail: string;
  subscriptionId?: string;
  maxSeats: number;
  memberIds: string[];
  invites: TeamInvite[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  uid: string;
  email: string;
  displayName: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}

/**
 * Generate a secure random token for team invites
 */
export function generateInviteToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Check if a team has available seats
 */
export function hasAvailableSeats(team: Team): boolean {
  const usedSeats = team.memberIds.length + team.invites.filter(i => i.status === 'pending').length;
  return usedSeats < team.maxSeats;
}

/**
 * Get the number of seats used (members + pending invites)
 */
export function getUsedSeats(team: Team): number {
  return team.memberIds.length + team.invites.filter(i => i.status === 'pending').length;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
