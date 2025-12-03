import { Timestamp } from 'firebase/firestore';

// ============================================
// User & Authentication Types
// ============================================

export interface LinkedInProfile {
  sub: string; // OIDC subject or LinkedIn member ID
  profileSnapshot: {
    name: string;
    headline?: string;
    photoUrl?: string;
    publicProfileUrl?: string;
    email?: string;
  };
  connectedAt: Timestamp;
  accessToken?: string; // Encrypted, only if needed
  refreshToken?: string; // Encrypted, only if needed
  tokenExpiresAt?: Timestamp;
}

export type UserPlan = 'free' | 'pro' | 'team' | 'enterprise';

export interface PrivacySettings {
  dataProcessingConsent: boolean;
  consentDate: Timestamp;
  rightToErasure: boolean;
  dataExportRequested: Timestamp | null;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  linkedIn?: LinkedInProfile;
  plan: UserPlan;
  orgIds: string[];
  privacy: PrivacySettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// Organization Types
// ============================================

export interface BillingInfo {
  stripeCustomerId: string;
  subscriptionId: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodEnd?: Timestamp;
}

export interface Organization {
  orgId: string;
  name: string;
  billing: BillingInfo;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  memberCount: number;
}

export type OrgRole = 'owner' | 'admin' | 'member';

export interface OrgMember {
  uid: string;
  orgId: string;
  role: OrgRole;
  createdAt: Timestamp;
  invitedBy?: string;
}

// ============================================
// Backup Types
// ============================================

export type BackupSource = 'linkedin_export' | 'manual_upload';
export type BackupStatus = 'uploaded' | 'processing' | 'ready' | 'error';

export interface BackupContents {
  connections: boolean;
  profile: boolean;
  messages: boolean;
  positions: boolean;
  education: boolean;
  skills: boolean;
  recommendations: boolean;
}

export interface RetentionPolicy {
  rawExpiresAt: Timestamp; // Default: 30 days
  derivedExpiresAt: Timestamp; // Default: 2 years
  keepRawForever: boolean; // Premium feature
}

export interface StoragePaths {
  raw: string; // users/{uid}/linkedin-exports/{backupId}/raw.zip
  derived?: string; // users/{uid}/linkedin-exports/{backupId}/processed/
  recoveryPack?: string; // Generated downloadable ZIP
}

export interface Backup {
  backupId: string;
  uid: string;
  orgId?: string;
  source: BackupSource;
  status: BackupStatus;
  storagePaths: StoragePaths;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  processedAt?: Timestamp;
  contains: BackupContents;
  retention: RetentionPolicy;
  fileSize: number; // bytes
  errorMessage?: string;
  metadata: {
    fileName: string;
    uploadedFromIp?: string;
    userAgent?: string;
  };
}

// ============================================
// Backup Snapshot Types (Analytics)
// ============================================

export interface ConnectionByIndustry {
  industry: string;
  count: number;
}

export interface ConnectionByLocation {
  location: string;
  count: number;
}

export interface ConnectionBySeniority {
  seniority: string;
  count: number;
}

export interface ConnectionByCompany {
  company: string;
  count: number;
}

export interface ProfileCompletenessScore {
  overall: number; // 0-100
  breakdown: {
    headline: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
    recommendations: number;
  };
}

export interface Recommendation {
  recommenderName: string;
  recommenderHeadline?: string;
  relationship: string;
  text: string;
  date?: string;
}

export interface BackupSnapshot {
  snapshotId: string;
  backupId: string;
  uid: string;
  createdAt: Timestamp;

  // Time series metrics
  totalConnections: number;
  connectionsByIndustry: ConnectionByIndustry[];
  connectionsByLocation: ConnectionByLocation[];
  connectionsBySeniority: ConnectionBySeniority[];
  connectionsByCompany: ConnectionByCompany[];

  // Profile analysis
  profileCompletenessScore: ProfileCompletenessScore;
  recommendations: Recommendation[];

  // Trends (compared to previous snapshot)
  trends?: {
    connectionGrowth: number; // delta since last snapshot
    newIndustries: string[];
    newLocations: string[];
  };
}

// ============================================
// LinkedIn Export Parsed Data Types
// ============================================

export interface LinkedInConnection {
  firstName: string;
  lastName: string;
  emailAddress?: string;
  company?: string;
  position?: string;
  connectedOn?: string;
}

export interface LinkedInPosition {
  companyName: string;
  title: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
}

export interface LinkedInEducation {
  schoolName: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

export interface LinkedInSkill {
  name: string;
  endorsementCount?: number;
}

export interface LinkedInProfileData {
  firstName: string;
  lastName: string;
  headline?: string;
  summary?: string;
  industry?: string;
  location?: string;
  emailAddress?: string;
}

export interface ParsedLinkedInExport {
  profile?: LinkedInProfileData;
  connections: LinkedInConnection[];
  positions: LinkedInPosition[];
  education: LinkedInEducation[];
  skills: LinkedInSkill[];
  recommendations: Recommendation[];
  exportDate: string;
  version: 'v1' | 'v2' | 'unknown';
}

// ============================================
// API Request/Response Types
// ============================================

export interface LinkedInOAuthState {
  state: string;
  codeVerifier: string;
  redirectUrl: string;
  createdAt: number;
}

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  id_token?: string; // OIDC
}

export interface LinkedInUserInfo {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
}

// ============================================
// AI Analysis Types
// ============================================

export type AnalysisType =
  | 'profile_completeness'
  | 'headline_suggestions'
  | 'experience_improvements'
  | 'skills_gap_analysis';

export interface AIRecommendation {
  type: AnalysisType;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestion?: string;
}

export interface AIAnalysis {
  analysisId: string;
  backupId: string;
  uid: string;
  createdAt: Timestamp;
  recommendations: AIRecommendation[];
  summary: string;
}

// ============================================
// Security & Compliance Types
// ============================================

export const PROHIBITED_FEATURES = {
  outreach_automation: false,
  connection_scraping: false,
  mass_messaging: false,
  email_extraction: false,
  profile_scraping: false,
} as const;

export const MAX_EXTRACTED_SIZE = 500 * 1024 * 1024; // 500MB
export const MAX_FILE_COUNT = 10000;
export const MAX_INDIVIDUAL_FILE = 50 * 1024 * 1024; // 50MB
export const MAX_UPLOAD_SIZE = 100 * 1024 * 1024; // 100MB

export interface SecurityCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}
