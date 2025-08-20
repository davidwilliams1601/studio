import { doc, updateDoc, getDoc } from 'firebase/firestore';

export interface SubscriptionData {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled';
  stripeCustomerId?: string;
  sessionId?: string;
  upgradeDate?: string;
  monthlyUsage: number;
}

export class SubscriptionService {
  static async updateUserSubscription(userId: string, subscriptionData: Partial<SubscriptionData>) {
    try {
      // Update Firebase
      const { db } = await import('@/lib/firebase');
      if (db) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          ...subscriptionData,
          lastUpdated: new Date().toISOString()
        });
        console.log('✅ Firebase subscription updated');
      }

      // Update localStorage
      const existingData = this.getLocalSubscription();
      const newData = { ...existingData, ...subscriptionData };
      localStorage.setItem('userSubscription', JSON.stringify(newData));
      console.log('✅ localStorage subscription updated');

      return true;
    } catch (error) {
      console.error('❌ Error updating subscription:', error);
      return false;
    }
  }

  static getLocalSubscription(): SubscriptionData | null {
    try {
      const data = localStorage.getItem('userSubscription');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static async getFirebaseSubscription(userId: string): Promise<SubscriptionData | null> {
    try {
      const { db } = await import('@/lib/firebase');
      if (!db) return null;

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          plan: userData.plan || 'free',
          status: userData.status || 'active',
          stripeCustomerId: userData.stripeCustomerId,
          sessionId: userData.sessionId,
          upgradeDate: userData.upgradeDate,
          monthlyUsage: userData.monthlyUsage || 0
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting Firebase subscription:', error);
      return null;
    }
  }

  static async syncSubscription(userId: string): Promise<SubscriptionData> {
    // Try Firebase first, then localStorage, then default
    const firebaseData = await this.getFirebaseSubscription(userId);
    const localData = this.getLocalSubscription();
    
    const subscription: SubscriptionData = {
      plan: firebaseData?.plan || localData?.plan || 'free',
      status: firebaseData?.status || localData?.status || 'active',
      stripeCustomerId: firebaseData?.stripeCustomerId || localData?.stripeCustomerId,
      sessionId: firebaseData?.sessionId || localData?.sessionId,
      upgradeDate: firebaseData?.upgradeDate || localData?.upgradeDate,
      monthlyUsage: firebaseData?.monthlyUsage || localData?.monthlyUsage || 0
    };

    // Update localStorage with synced data
    localStorage.setItem('userSubscription', JSON.stringify(subscription));
    
    return subscription;
  }

  static clearSubscription() {
    localStorage.removeItem('userSubscription');
  }
}
