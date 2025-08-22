import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface StoredAnalysis {
  id: string;
  userId: string;
  fileName: string;
  uploadDate: Date;
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
    analysisData: Omit<StoredAnalysis, 'id' | 'userId'>
  ): Promise<string> {
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const analysisDoc: StoredAnalysis = {
      id: analysisId,
      userId,
      ...analysisData,
      uploadDate: new Date()
    };

    await setDoc(doc(db, 'analyses', analysisId), analysisDoc);
    return analysisId;
  }

  // Get analysis by ID
  static async getAnalysis(analysisId: string): Promise<StoredAnalysis | null> {
    const docRef = doc(db, 'analyses', analysisId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as StoredAnalysis;
    }
    return null;
  }

  // Get user's analysis history
  static async getUserAnalyses(userId: string): Promise<StoredAnalysis[]> {
    const q = query(
      collection(db, 'analyses'),
      where('userId', '==', userId),
      orderBy('uploadDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as StoredAnalysis);
  }

  // Get user's latest analysis
  static async getLatestAnalysis(userId: string): Promise<StoredAnalysis | null> {
    const analyses = await this.getUserAnalyses(userId);
    return analyses.length > 0 ? analyses[0] : null;
  }

  // Update analysis with AI insights
  static async updateWithInsights(analysisId: string, insights: any): Promise<void> {
    const docRef = doc(db, 'analyses', analysisId);
    await setDoc(docRef, { insights }, { merge: true });
  }
}
