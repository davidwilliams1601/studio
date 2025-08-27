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
  insights: string[];
}

export class AnalysisStorageService {
  static async saveAnalysis(data: AnalysisData): Promise<string> {
    try {
      console.log('Attempting to save analysis for user:', data.userId);
      console.log('Database instance:', db);
      console.log('Data to save:', data);
      const docRef = await addDoc(collection(db, 'analyses'), data);
      console.log('Analysis saved successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Database save error details:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      throw error;
    }
  }

  static async getLatestAnalysis(userId: string): Promise<AnalysisData | null> {
    const q = query(
      collection(db, 'analyses'),
      where('userId', '==', userId),
      orderBy('processedAt', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    return docs.length > 0 ? { id: docs[0].id, ...docs[0].data() } as AnalysisData : null;
  }
}
