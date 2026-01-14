"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
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
  resetPassword: (email: string) => Promise<void>;
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
  const [popupInProgress, setPopupInProgress] = useState(false);

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

  const loadSubscriptionData = async (userId: string) => {
    try {
      // Fetch subscription from server (secure, tamper-proof)
      const user = auth?.currentUser;
      if (!user) {
        setSubscription({ plan: 'free', monthlyUsage: 0 });
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch('/api/subscription/status', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription({
          plan: data.plan,
          monthlyUsage: data.monthlyUsage,
          upgradeDate: data.upgradeDate,
        });
      } else {
        // Fallback to free plan if API fails
        setSubscription({ plan: 'free', monthlyUsage: 0 });
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
      console.log('Signing in with email/password...');
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful');

      // Get ID token and redirect through session cookie endpoint
      console.log('Getting ID token...');
      const idToken = await auth.currentUser?.getIdToken();
      console.log('ID token obtained, redirecting through session endpoint...');

      if (idToken) {
        // Use server-side redirect to set cookie reliably
        // The redirect will be handled by the GET endpoint
        const redirect = encodeURIComponent('/dashboard');
        window.location.href = `/api/auth/create-session?idToken=${encodeURIComponent(idToken)}&redirect=${redirect}`;
        // Don't continue - page will navigate
        return;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (email: string, password: string) => {
    if (!auth || !firebaseReady) {
      throw new Error('Authentication not available');
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Create user document in Firestore and send welcome email
      if (userCredential.user) {
        try {
          // Create user document in Firestore with initial settings
          const response = await fetch('/api/users/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userCredential.user.uid,
              email: userCredential.user.email,
              displayName: userCredential.user.email?.split('@')[0] || 'User',
              tier: 'free',
            })
          });

          if (!response.ok) {
            console.log('⚠️ Failed to create user document in Firestore');
          }

          // Send welcome email
          const emailResponse = await fetch('/api/email/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userCredential.user.email,
              name: userCredential.user.email?.split('@')[0] || 'User'
            })
          });

          if (emailResponse.ok) {
            console.log('✅ Welcome email sent successfully');
          } else {
            console.log('⚠️ Welcome email failed, but signup successful');
          }
        } catch (error) {
          console.error('Post-signup setup error:', error);
          // Don't throw - signup was successful even if setup failed
        }
      }

      // Get ID token and redirect through session cookie endpoint
      if (userCredential.user) {
        const idToken = await userCredential.user.getIdToken();
        if (idToken) {
          // Use server-side redirect to set cookie reliably
          const redirect = encodeURIComponent('/dashboard');
          window.location.href = `/api/auth/create-session?idToken=${encodeURIComponent(idToken)}&redirect=${redirect}`;
          // Don't continue - page will navigate
          return;
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

    // Prevent multiple simultaneous popup attempts
    if (popupInProgress) {
      console.log('Popup already in progress, ignoring...');
      return;
    }

    setPopupInProgress(true);

    try {
      const provider = new GoogleAuthProvider();
      console.log('Signing in with Google popup...');
      const userCredential = await signInWithPopup(auth, provider);
      console.log('Google sign in successful, user:', userCredential.user.uid);

      // Create user document and send welcome email for new Google users
      if (userCredential.user) {
        try {
          // Check if this is a new user and create document if needed
          const createResponse = await fetch('/api/users/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userCredential.user.uid,
              email: userCredential.user.email,
              displayName: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
              tier: 'free',
            })
          });

          // Only send welcome email for new users
          if (createResponse.ok) {
            const data = await createResponse.json();
            if (data.created) {
              const emailResponse = await fetch('/api/email/welcome', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: userCredential.user.email,
                  name: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User'
                })
              });

              if (emailResponse.ok) {
                console.log('✅ Welcome email sent successfully');
              }
            }
          }
        } catch (error) {
          console.error('Post-login setup error:', error);
          // Don't throw - login was successful
        }
      }

      // Get ID token and redirect through session cookie endpoint
      if (userCredential.user) {
        console.log('Getting ID token...');
        const idToken = await userCredential.user.getIdToken();
        console.log('ID token obtained, redirecting through session endpoint...');

        if (idToken) {
          // Use server-side redirect to set cookie reliably
          const redirect = encodeURIComponent('/dashboard');
          window.location.href = `/api/auth/create-session?idToken=${encodeURIComponent(idToken)}&redirect=${redirect}`;
          // Don't continue - page will navigate
          return;
        }
      }
    } catch (error: any) {
      // Special handling for popup cancellation
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log('Google login cancelled by user');
        // Give Firebase a moment to clean up internal state
        await new Promise(resolve => setTimeout(resolve, 500));
        // Throw a special error that we can catch in the UI
        const cancelError = new Error('POPUP_CANCELLED');
        (cancelError as any).code = 'auth/popup-cancelled';
        throw cancelError;
      }
      throw new Error(error.message || 'Google login failed');
    } finally {
      // Always clear the popup flag
      setPopupInProgress(false);
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
      // Clear session cookie first
      await fetch('/api/auth/logout', { method: 'POST' });

      // Then sign out from Firebase
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth || !firebaseReady) {
      throw new Error('Authentication not available');
    }
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent to:', email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
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
    logout,
    resetPassword
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
