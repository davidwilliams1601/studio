import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface UserSubscription {
  userId: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  analysesUsed: number;
  analysesLimit: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export class SubscriptionService {
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const docRef = doc(db, 'subscriptions', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserSubscription;
      }
      
      const defaultSub: UserSubscription = {
        userId,
        plan: 'free',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        analysesUsed: 0,
        analysesLimit: 2
      };
      
      await setDoc(docRef, defaultSub);
      return defaultSub;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }

  static async updateUsage(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return false;
      
      // Allow unlimited usage for Pro and Enterprise plans
      if (subscription.analysesLimit === -1) {
        // Still increment counter for tracking, but don't enforce limit
        const docRef = doc(db, 'subscriptions', userId);
        await updateDoc(docRef, {
          analysesUsed: subscription.analysesUsed + 1
        });
        return true;
      }
      
      // For free plan, enforce the limit
      if (subscription.analysesUsed >= subscription.analysesLimit) {
        return false;
      }
      
      const docRef = doc(db, 'subscriptions', userId);
      await updateDoc(docRef, {
        analysesUsed: subscription.analysesUsed + 1
      });
      
      return true;
    } catch (error) {
      console.error('Error updating usage:', error);
      return false;
    }
  }

  static async upgradeToPro(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<void> {
    const docRef = doc(db, 'subscriptions', userId);
    await updateDoc(docRef, {
      plan: 'pro',
      analysesLimit: -1,
      stripeCustomerId,
      stripeSubscriptionId
    });
  }
}
