"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  firebaseReady: boolean;
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    monthlyUsage: number;
    upgradeDate?: string;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [subscription, setSubscription] = useState<{
    plan: 'free' | 'pro' | 'enterprise';
    monthlyUsage: number;
    upgradeDate?: string;
  } | null>(null);

  useEffect(() => {
    // Only initialize on client-side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        const { auth } = await import('@/firebase/config');
        
        if (auth) {
          console.log('✅ Firebase Auth available');
          setFirebaseReady(true);
          
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('🔄 Auth state changed:', user?.email || 'No user');
            setUser(user);
            setLoading(false);
            
            if (user) {
              loadSubscriptionData(user.uid);
            } else {
              setSubscription(null);
            }
          });

          return unsubscribe;
        } else {
          console.log('🔄 Firebase unavailable, using localStorage mode');
          setFirebaseReady(false);
          setLoading(false);
          
          // Load localStorage subscription for demo mode
          const demoUser = { uid: 'demo123' };
          loadSubscriptionData(demoUser.uid);
        }
      } catch (error) {
        console.log('🔄 Firebase initialization error, using localStorage mode');
        setFirebaseReady(false);
        setLoading(false);
        
        // Load localStorage subscription for demo mode
        const demoUser = { uid: 'demo123' };
        loadSubscriptionData(demoUser.uid);
      }
    };

    initializeAuth();
  }, []);

  const loadSubscriptionData = (userId: string) => {
    try {
      const saved = localStorage.getItem(`subscription_${userId}`);
      if (saved) {
        const sub = JSON.parse(saved);
        console.log('✅ Subscription loaded:', sub);
        setSubscription(sub);
      } else {
        const defaultSubscription = {
          plan: 'free' as const,
          monthlyUsage: 0
        };
        setSubscription(defaultSubscription);
        localStorage.setItem(`subscription_${userId}`, JSON.stringify(defaultSubscription));
        console.log('✅ Default subscription created');
      }
    } catch (error) {
      console.error('❌ Error loading subscription:', error);
      setSubscription({ plan: 'free', monthlyUsage: 0 });
    }
  };

  const createMockUser = (email: string): User => {
    return {
      uid: 'demo123',
      email: email,
      emailVerified: true,
      isAnonymous: false,
      displayName: null,
      phoneNumber: null,
      photoURL: null,
      providerId: 'firebase',
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      },
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({})
    } as User;
  };

  const login = async (email: string, password: string) => {
    if (!firebaseReady) {
      // Demo mode login
      console.log('🔄 Demo login for:', email);
      setUser(createMockUser(email));
      loadSubscriptionData('demo123');
      return;
    }
    
    const { auth } = await import('@/firebase/config');
    if (!auth) {
      throw new Error('Authentication not available');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    if (!firebaseReady) {
      // Demo mode signup
      console.log('🔄 Demo signup for:', email);
      setUser(createMockUser(email));
      loadSubscriptionData('demo123');
      
      // Send welcome email
      try {
        await fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: email,
            name: email.split('@')[0] || 'User'
          })
        });
      } catch (emailError) {
        console.error('Welcome email error:', emailError);
      }
      return;
    }
    
    const { auth } = await import('@/firebase/config');
    if (!auth) {
      throw new Error('Authentication not available');
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send welcome email
    if (userCredential.user) {
      try {
        await fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: userCredential.user.email,
            name: userCredential.user.email?.split('@')[0] || 'User'
          })
        });
      } catch (emailError) {
        console.error('Welcome email error:', emailError);
      }
    }
  };

  const loginWithGoogle = async () => {
    if (!firebaseReady) {
      throw new Error('Google login not available in demo mode');
    }
    const { auth } = await import('@/firebase/config');
    if (!auth) {
      throw new Error('Authentication not available');
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    if (!firebaseReady) {
      setUser(null);
      setSubscription(null);
      return;
    }
    const { auth } = await import('@/firebase/config');
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      firebaseReady,
      subscription,
      login,
      signup,
      loginWithGoogle,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
