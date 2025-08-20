"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [upgrading, setUpgrading] = useState(true);
  
  const session_id = searchParams.get('session_id');
  const plan = searchParams.get('plan');
  const user_id = searchParams.get('user_id');

  useEffect(() => {
    // Simulate upgrade process and update subscription
    const processUpgrade = async () => {
      console.log('🔄 Processing upgrade...', { session_id, plan, user_id });
      
      try {
        // Update subscription in localStorage (in production, you'd update your database)
        const currentUser = user || { uid: user_id };
        const newSubscription = {
          plan: plan || 'pro',
          monthlyUsage: 0,
          upgradeDate: new Date().toISOString(),
          sessionId: session_id
        };
        
        localStorage.setItem(`subscription_${currentUser.uid}`, JSON.stringify(newSubscription));
        
        console.log('✅ Subscription updated:', newSubscription);
        
        // Send upgrade confirmation email
        if (currentUser.uid && plan) {
          try {
            await fetch('/api/email/welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: user?.email || 'user@example.com',
                name: user?.email?.split('@')[0] || 'Pro User',
                isUpgrade: true,
                plan: plan
              })
            });
            console.log('✅ Upgrade email sent');
          } catch (emailError) {
            console.error('⚠️ Email error:', emailError);
          }
        }
        
        setUpgrading(false);
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
        
      } catch (error) {
        console.error('❌ Upgrade processing error:', error);
        setUpgrading(false);
      }
    };

    if (session_id && plan) {
      processUpgrade();
    } else {
      setUpgrading(false);
    }
  }, [session_id, plan, user_id, user, router]);

  if (upgrading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "#f0fdf4" 
      }}>
        <div style={{ 
          background: "white", 
          padding: "3rem", 
          borderRadius: "12px", 
          textAlign: "center",
          maxWidth: "500px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔄</div>
          <h1 style={{ 
            fontSize: "2rem", 
            fontWeight: "bold", 
            color: "#15803d", 
            marginBottom: "1rem" 
          }}>
            Activating Your Pro Account...
          </h1>
          <p style={{ 
            color: "#374151", 
            marginBottom: "2rem",
            lineHeight: "1.6"
          }}>
            We're setting up your LinkStream Pro features including unlimited analyses and AI insights.
          </p>
          <div style={{ 
            background: "#f0fdf4", 
            padding: "1rem", 
            borderRadius: "8px",
            border: "1px solid #10b981"
          }}>
            <p style={{ color: "#15803d", margin: 0, fontSize: "0.875rem" }}>
              ⚡ This usually takes just a few seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "#f0fdf4" 
    }}>
      <div style={{ 
        background: "white", 
        padding: "3rem", 
        borderRadius: "12px", 
        textAlign: "center",
        maxWidth: "600px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
        <h1 style={{ 
          fontSize: "2rem", 
          fontWeight: "bold", 
          color: "#15803d", 
          marginBottom: "1rem" 
        }}>
          Welcome to LinkStream Pro!
        </h1>
        <p style={{ 
          color: "#374151", 
          marginBottom: "2rem",
          lineHeight: "1.6"
        }}>
          Your subscription has been activated successfully. You now have unlimited LinkedIn analyses with enhanced AI insights.
        </p>
        
        <div style={{ 
          background: "#f0fdf4", 
          padding: "1.5rem", 
          borderRadius: "8px",
          border: "1px solid #10b981",
          marginBottom: "2rem"
        }}>
          <h3 style={{ color: "#15803d", marginBottom: "1rem" }}>🚀 Your Pro Benefits Are Now Active:</h3>
          <ul style={{ textAlign: "left", color: "#065f46", paddingLeft: "1.5rem", margin: 0 }}>
            <li>✅ Unlimited LinkedIn data analyses</li>
            <li>✅ Enhanced AI insights and recommendations</li>
            <li>✅ Advanced competitor analysis</li>
            <li>✅ Network growth predictions</li>
          </ul>
        </div>
        
        {session_id && (
          <p style={{ 
            fontSize: "0.875rem", 
            color: "#6b7280", 
            marginBottom: "2rem" 
          }}>
            Payment ID: {session_id}
          </p>
        )}
        
        <a 
          href="/dashboard"
          style={{ 
            background: "#10b981", 
            color: "white", 
            padding: "1rem 2rem", 
            borderRadius: "8px", 
            textDecoration: "none", 
            fontWeight: "bold",
            display: "inline-block",
            fontSize: "1.1rem"
          }}
        >
          🛡️ Start Using Pro Features
        </a>
        
        <p style={{ 
          fontSize: "0.875rem", 
          color: "#6b7280", 
          marginTop: "1rem" 
        }}>
          Redirecting automatically in a few seconds...
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔄</div>
          <h3>Loading...</h3>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
