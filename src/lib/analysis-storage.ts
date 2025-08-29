import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export interface AnalysisData {
  id?: string;
  userId: string;
  fileName: string;
  processedAt: string;
  stats: {
    connections: number;
    messages: number;
    posts: number;
    companies: number;
  };
  analytics: {
    industries: Record<string, number>;
    locations: Record<string, number>;
    topCompanies: Record<string, number>;
    skillsCount: number;
    networkQuality: {
      diversityScore: number;
      topSeniorityLevels: Record<string, number>;
    };
  };
  insights: string[];
  aiInsights?: {
    type: string;
    title: string;
    content: string;
    confidence: number;
  }[];
}

export class AnalysisStorageService {
  static async saveAnalysis(data: AnalysisData): Promise<string> {
    try {
      console.log('Attempting to save analysis for user:', data.userId);
      const docRef = await addDoc(collection(db, 'analyses'), data);
      console.log('Analysis saved successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Database save error details:', error);
      throw error;
    }
  }

  static async getUserAnalyses(userId: string): Promise<AnalysisData[]> {
    try {
      const q = query(
        collection(db, 'analyses'),
        where('userId', '==', userId),
        orderBy('processedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnalysisData));
    } catch (error) {
      console.error('Error loading user analyses:', error);
      throw error;
    }
  }

  static async getLatestAnalysis(userId: string): Promise<AnalysisData | null> {
    try {
      const q = query(
        collection(db, 'analyses'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.docs.length === 0) {
        return null;
      }
      
      const docs = querySnapshot.docs.sort((a, b) => 
        b.data().processedAt.localeCompare(a.data().processedAt)
      );
      
      return { id: docs[0].id, ...docs[0].data() } as AnalysisData;
    } catch (error) {
      console.error('Error loading analysis:', error);
      throw error;
    }
  }
}
