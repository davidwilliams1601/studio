import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export class UpgradeService {
  static async upgradeToPro(userId: string): Promise<void> {
    try {
      const docRef = doc(db, 'subscriptions', userId);
      await updateDoc(docRef, {
        plan: 'pro',
        analysesLimit: -1, // Unlimited
        upgradedAt: new Date().toISOString()
      });
      console.log('User upgraded to Pro');
    } catch (error) {
      console.error('Error upgrading user:', error);
      throw error;
    }
  }

  static async upgradeToEnterprise(userId: string): Promise<void> {
    try {
      const docRef = doc(db, 'subscriptions', userId);
      await updateDoc(docRef, {
        plan: 'enterprise',
        analysesLimit: -1, // Unlimited
        upgradedAt: new Date().toISOString()
      });
      console.log('User upgraded to Enterprise');
    } catch (error) {
      console.error('Error upgrading user:', error);
      throw error;
    }
  }

  static async downgradeToFree(userId: string): Promise<void> {
    try {
      const docRef = doc(db, 'subscriptions', userId);
      await updateDoc(docRef, {
        plan: 'free',
        analysesLimit: 2,
        downgradedAt: new Date().toISOString()
      });
      console.log('User downgraded to Free');
    } catch (error) {
      console.error('Error downgrading user:', error);
      throw error;
    }
  }
}
