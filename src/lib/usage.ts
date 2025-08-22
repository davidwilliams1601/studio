// Simple usage tracking (client-side only)
export class UsageTracker {
  static getMonthlyUsage(userId: string): number {
    if (typeof window === 'undefined') return 0; // Server-side safety
    const key = `usage_${userId}_${new Date().getMonth()}_${new Date().getFullYear()}`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored) : 0;
  }

  static incrementUsage(userId: string): number {
    if (typeof window === 'undefined') return 0; // Server-side safety
    const key = `usage_${userId}_${new Date().getMonth()}_${new Date().getFullYear()}`;
    const current = this.getMonthlyUsage(userId);
    const newCount = current + 1;
    localStorage.setItem(key, newCount.toString());
    return newCount;
  }

  static canUseFeature(userId: string, plan: string, feature: string): boolean {
    if (typeof window === 'undefined') return false; // Server-side safety
    const usage = this.getMonthlyUsage(userId);
    
    switch (plan) {
      case 'free':
        if (feature === 'analysis') return usage < 1;
        if (feature === 'ai_insights') return false;
        if (feature === 'pdf_generation') return false;
        return false;
      
      case 'pro':
        return true; // Unlimited for pro users
      
      case 'enterprise':
        return true; // Unlimited for enterprise users
      
      default:
        return false;
    }
  }

  static getUsageLimits(plan: string) {
    switch (plan) {
      case 'free':
        return {
          analyses: 1,
          ai_insights: 0,
          pdf_reports: 0
        };
      case 'pro':
        return {
          analyses: 'unlimited',
          ai_insights: 'unlimited',
          pdf_reports: 'unlimited'
        };
      case 'enterprise':
        return {
          analyses: 'unlimited',
          ai_insights: 'unlimited', 
          pdf_reports: 'unlimited',
          team_features: true
        };
      default:
        return { analyses: 0, ai_insights: 0, pdf_reports: 0 };
    }
  }
}
