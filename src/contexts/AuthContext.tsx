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
  const [auth, setAuth] = useState<any>(null);
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

    // Dynamic import Firebase to avoid SSR issues
    const initializeAuth = async () => {
      try {
        const { auth: firebaseAuth } = await import('@/firebase/config');
        
        if (firebaseAuth) {
          setAuth(firebaseAuth);
          setFirebaseReady(true);
          
          // Listen for auth state changes
          const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            setUser(user);
            setLoading(false);
            
            // Load subscription data for the user
            if (user) {
              loadSubscriptionData(user.uid);
            } else {
              setSubscription(null);
            }
          });

          return unsubscribe;
        } else {
          // Firebase not available - set demo mode
          setFirebaseReady(false);
          setLoading(false);
          setSubscription({ plan: 'free', monthlyUsage: 0 });
        }
      } catch (error) {
        console.error('Firebase initialization error:', error);
        setFirebaseReady(false);
        setLoading(false);
        setSubscription({ plan: 'free', monthlyUsage: 0 });
      }
    };

    initializeAuth();
  }, []);

  const loadSubscriptionData = (userId: string) => {
    try {
      // Try to load subscription from localStorage or set default
      const savedSubscription = localStorage.getItem(`subscription_${userId}`);
      if (savedSubscription) {
        setSubscription(JSON.parse(savedSubscription));
      } else {
        // Default free plan
        const defaultSubscription = {
          plan: 'free' as const,
          monthlyUsage: 0
        };
        setSubscription(defaultSubscription);
        localStorage.setItem(`subscription_${userId}`, JSON.stringify(defaultSubscription));
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscription({ plan: 'free', monthlyUsage: 0 });
    }
  };

  const login = async (email: string, password: string) => {
    if (!auth || !firebaseReady) {
      throw new Error('Authentication not available');
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (email: string, password: string) => {
    if (!auth || !firebaseReady) {
      throw new Error('Authentication not available');
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send welcome email
      if (userCredential.user) {
        try {
          const response = await fetch('/api/email/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: userCredential.user.email,
              name: userCredential.user.email?.split('@')[0] || 'User'
            })
          });
          
          if (response.ok) {
            console.log('✅ Welcome email sent successfully');
          } else {
            console.log('⚠️ Welcome email failed, but signup successful');
          }
        } catch (emailError) {
          console.error('Welcome email error:', emailError);
          // Don't throw - signup was successful even if email failed
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  };

  const loginWithGoogle = async () => {
    if (!auth || !firebaseReady) {
      throw new Error('Authentication not available');
    }
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Send welcome email for new Google users
      if (userCredential.user) {
        try {
          const response = await fetch('/api/email/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: userCredential.user.email,
              name: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User'
            })
          });
          
          if (response.ok) {
            console.log('✅ Welcome email sent successfully');
          }
        } catch (emailError) {
          console.error('Welcome email error:', emailError);
          // Don't throw - login was successful
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  };

  const logout = async () => {
    if (!auth || !firebaseReady) {
      // Just clear local state if Firebase not available
      setUser(null);
      setSubscription(null);
      return;
    }
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  };

  const value = {
    user,
    loading,
    firebaseReady,
    subscription,
    login,
    signup,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
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
