"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionService } from '@/lib/subscription-storage';

export default function SubscriptionCard() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user) return;
      
      const sub = await SubscriptionService.getUserSubscription(user.uid);
      setSubscription(sub);
      setLoading(false);
    };

    loadSubscription();
  }, [user]);

  if (loading) return <div>Loading subscription...</div>;
  if (!subscription) return null;

  const isUnlimited = subscription.analysesLimit === -1;
  const usagePercentage = isUnlimited ? 0 : (subscription.analysesUsed / subscription.analysesLimit) * 100;

  return (
    <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", textTransform: "capitalize" }}>
          {subscription.plan} Plan
        </h3>
        {subscription.plan === 'free' && (
          <button 
            style={{ 
              background: "#3b82f6", 
              color: "white", 
              padding: "0.5rem 1rem", 
              border: "none", 
              borderRadius: "4px", 
              fontWeight: "bold" 
            }}
          >
            Upgrade to Pro
          </button>
        )}
      </div>
      
      <div style={{ marginBottom: "1rem" }}>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          Analyses Used: {subscription.analysesUsed} / {isUnlimited ? "Unlimited" : subscription.analysesLimit}
        </p>
        
        {!isUnlimited && (
          <div style={{ 
            width: "100%", 
            background: "#e5e7eb", 
            borderRadius: "4px", 
            height: "8px", 
            marginTop: "0.5rem" 
          }}>
            <div 
              style={{ 
                width: `${Math.min(usagePercentage, 100)}%`, 
                background: usagePercentage > 80 ? "#ef4444" : "#3b82f6", 
                height: "100%", 
                borderRadius: "4px" 
              }}
            />
          </div>
        )}
      </div>
      
      {subscription.plan === 'free' && subscription.analysesUsed >= subscription.analysesLimit && (
        <div style={{ 
          background: "#fef2f2", 
          border: "1px solid #fecaca", 
          padding: "1rem", 
          borderRadius: "4px",
          color: "#dc2626"
        }}>
          You've reached your monthly limit. Upgrade to Pro for unlimited analyses.
        </div>
      )}
    </div>
  );
}
