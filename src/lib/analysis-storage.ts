import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface StoredAnalysis {
  id: string;
  userId: string;
  fileName: string;
  uploadDate: any; // Can be Timestamp or Date
  stats: {
    connections: number;
    messages: number;
    posts: number;
    comments: number;
    companies: number;
  };
  analytics: {
    industries: Record<string, number>;
    locations: Record<string, number>;
    skillsCount: number;
  };
  insights?: any;
  userPlan: string;
  storagePath: string;
}

export class AnalysisStorageService {
  
  // Save analysis results to Firestore
  static async saveAnalysis(
    userId: string, 
    analysisData: Omit<StoredAnalysis, 'id' | 'userId' | 'uploadDate'>
  ): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firebase database not initialized');
      }

      const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const analysisDoc: StoredAnalysis = {
        id: analysisId,
        userId,
        ...analysisData,
        uploadDate: Timestamp.now()
      };

      await setDoc(doc(db, 'analyses', analysisId), analysisDoc);
      return analysisId;
    } catch (error) {
      console.error('Error saving analysis:', error);
      throw error;
    }
  }

  // Get user's analysis history
  static async getUserAnalyses(userId: string): Promise<StoredAnalysis[]> {
    try {
      if (!db) {
        console.warn('Firebase database not initialized');
        return [];
      }

      const q = query(
        collection(db, 'analyses'),
        where('userId', '==', userId),
        orderBy('uploadDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as StoredAnalysis);
    } catch (error) {
      console.error('Error getting user analyses:', error);
      return [];
    }
  }

  // Update analysis with AI insights
  static async updateWithInsights(analysisId: string, insights: any): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firebase database not initialized');
      }

      const docRef = doc(db, 'analyses', analysisId);
      await setDoc(docRef, { insights }, { merge: true });
    } catch (error) {
      console.error('Error updating insights:', error);
      throw error;
    }
  }
}
