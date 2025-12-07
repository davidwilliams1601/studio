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
  loginWithLinkedIn: () => void;
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

      // Create session cookie for middleware authentication
      console.log('Getting ID token...');
      const idToken = await auth.currentUser?.getIdToken();
      console.log('ID token obtained, creating session cookie...');

      if (idToken) {
        const sessionResponse = await fetch('/api/auth/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
          credentials: 'include', // Required for cookies to be set
        });

        if (!sessionResponse.ok) {
          const errorData = await sessionResponse.json();
          console.error('Session cookie creation failed:', errorData);
          throw new Error(`Failed to create session: ${errorData.error || 'Unknown error'}`);
        }

        console.log('Session cookie created successfully');

        // Wait a moment for the cookie to be committed by the browser
        await new Promise(resolve => setTimeout(resolve, 500));
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

      // Create session cookie for middleware authentication
      if (userCredential.user) {
        const idToken = await userCredential.user.getIdToken();
        if (idToken) {
          const sessionResponse = await fetch('/api/auth/create-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
            credentials: 'include', // Required for cookies to be set
          });

          if (!sessionResponse.ok) {
            const errorData = await sessionResponse.json();
            console.error('Session cookie creation failed:', errorData);
            throw new Error(`Failed to create session: ${errorData.error || 'Unknown error'}`);
          }

          console.log('Session cookie created successfully');

          // Wait a moment for the cookie to be committed by the browser
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

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
      console.log('Signing in with Google popup...');
      const userCredential = await signInWithPopup(auth, provider);
      console.log('Google sign in successful, user:', userCredential.user.uid);

      // Create session cookie for middleware authentication
      if (userCredential.user) {
        console.log('Getting ID token...');
        const idToken = await userCredential.user.getIdToken();
        console.log('ID token obtained, creating session cookie...');

        if (idToken) {
          const sessionResponse = await fetch('/api/auth/create-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
            credentials: 'include', // Required for cookies to be set
          });

          if (!sessionResponse.ok) {
            const errorData = await sessionResponse.json();
            console.error('Session cookie creation failed:', errorData);
            console.error('Error code:', errorData.code);
            console.error('Error message:', errorData.message);
            console.error('Error details:', errorData.details);
            throw new Error(
              `Failed to create session: ${errorData.error || 'Unknown error'}\n` +
              `Code: ${errorData.code || 'none'}\n` +
              `Details: ${errorData.message || errorData.details || 'none'}`
            );
          }

          console.log('Session cookie created successfully');

          // Wait a moment for the cookie to be committed by the browser
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

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
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  };

  const loginWithLinkedIn = () => {
    // Redirect to LinkedIn OAuth start endpoint
    window.location.href = '/api/auth/linkedin/start';
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

  const value = {
    user,
    loading,
    firebaseReady,
    subscription,
    login,
    signup,
    loginWithGoogle,
    loginWithLinkedIn,
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
