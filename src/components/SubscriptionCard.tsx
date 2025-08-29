"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionService } from '@/lib/subscription-storage';
import { UpgradeService } from '@/lib/upgrade-service';

export default function SubscriptionCard() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user) return;
      
      try {
        const sub = await SubscriptionService.getUserSubscription(user.uid);
        setSubscription(sub);
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [user]);

  const handleUpgrade = async (targetPlan: 'pro' | 'enterprise') => {
    if (!user || upgrading) return;
    
    const confirmed = confirm(`Upgrade to ${targetPlan.toUpperCase()} plan? This is a demo - no payment required.`);
    if (!confirmed) return;

    setUpgrading(true);
    try {
      if (targetPlan === 'pro') {
        await UpgradeService.upgradeToPro(user.uid);
      } else {
        await UpgradeService.upgradeToEnterprise(user.uid);
      }
      
      // Reload subscription data
      const updatedSub = await SubscriptionService.getUserSubscription(user.uid);
      setSubscription(updatedSub);
      
      alert(`Successfully upgraded to ${targetPlan.toUpperCase()}! You now have unlimited analyses with AI insights.`);
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const handleDowngrade = async () => {
    if (!user || upgrading) return;
    
    const confirmed = confirm('Downgrade to FREE plan? You will lose unlimited analyses and AI insights.');
    if (!confirmed) return;

    setUpgrading(true);
    try {
      await UpgradeService.downgradeToFree(user.uid);
      
      const updatedSub = await SubscriptionService.getUserSubscription(user.uid);
      setSubscription(updatedSub);
      
      alert('Downgraded to Free plan. You now have 2 analyses per month.');
    } catch (error) {
      console.error('Downgrade failed:', error);
      alert('Downgrade failed. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) return <div>Loading subscription...</div>;
  if (!subscription) return null;

  const isUnlimited = subscription.analysesLimit === -1;
  const usagePercentage = isUnlimited ? 0 : (subscription.analysesUsed / subscription.analysesLimit) * 100;

  return (
    <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", textTransform: "capitalize" }}>
          {subscription.plan} Plan
          {subscription.plan === 'pro' && ' ($19/month)'}
          {subscription.plan === 'enterprise' && ' ($99/month)'}
        </h3>
        
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {subscription.plan === 'free' && (
            <>
              <button 
                onClick={() => handleUpgrade('pro')}
                disabled={upgrading}
                style={{ 
                  background: "#3b82f6", 
                  color: "white", 
                  padding: "0.5rem 1rem", 
                  border: "none", 
                  borderRadius: "4px", 
                  fontWeight: "bold",
                  opacity: upgrading ? 0.5 : 1
                }}
              >
                {upgrading ? 'Processing...' : 'Upgrade to Pro'}
              </button>
              <button 
                onClick={() => handleUpgrade('enterprise')}
                disabled={upgrading}
                style={{ 
                  background: "#7c3aed", 
                  color: "white", 
                  padding: "0.5rem 1rem", 
                  border: "none", 
                  borderRadius: "4px", 
                  fontWeight: "bold",
                  opacity: upgrading ? 0.5 : 1
                }}
              >
                {upgrading ? 'Processing...' : 'Upgrade to Enterprise'}
              </button>
            </>
          )}
          
          {subscription.plan === 'pro' && (
            <>
              <button 
                onClick={() => handleUpgrade('enterprise')}
                disabled={upgrading}
                style={{ 
                  background: "#7c3aed", 
                  color: "white", 
                  padding: "0.5rem 1rem", 
                  border: "none", 
                  borderRadius: "4px", 
                  fontWeight: "bold",
                  opacity: upgrading ? 0.5 : 1
                }}
              >
                {upgrading ? 'Processing...' : 'Upgrade to Enterprise'}
              </button>
              <button 
                onClick={handleDowngrade}
                disabled={upgrading}
                style={{ 
                  background: "#6b7280", 
                  color: "white", 
                  padding: "0.5rem 1rem", 
                  border: "none", 
                  borderRadius: "4px", 
                  fontSize: "0.875rem",
                  opacity: upgrading ? 0.5 : 1
                }}
              >
                Downgrade
              </button>
            </>
          )}
          
          {subscription.plan === 'enterprise' && (
            <button 
              onClick={handleDowngrade}
              disabled={upgrading}
              style={{ 
                background: "#6b7280", 
                color: "white", 
                padding: "0.5rem 1rem", 
                border: "none", 
                borderRadius: "4px", 
                fontSize: "0.875rem",
                opacity: upgrading ? 0.5 : 1
              }}
            >
              Downgrade
            </button>
          )}
        </div>
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

      {subscription.plan === 'free' && (
        <div style={{ 
          background: "#fef3c7", 
          border: "1px solid #fbbf24", 
          padding: "1rem", 
          borderRadius: "4px",
          color: "#92400e",
          fontSize: "0.875rem"
        }}>
          <strong>Pro benefits:</strong> Unlimited analyses, AI-powered insights, advanced networking recommendations
          <br />
          <strong>Enterprise benefits:</strong> All Pro features + custom AI prompts, competitive intelligence, strategic analysis
        </div>
      )}
      
      {subscription.plan === 'free' && subscription.analysesUsed >= subscription.analysesLimit && (
        <div style={{ 
          background: "#fef2f2", 
          border: "1px solid #fecaca", 
          padding: "1rem", 
          borderRadius: "4px",
          color: "#dc2626",
          marginTop: "1rem"
        }}>
          You have reached your monthly limit. Upgrade for unlimited analyses with AI insights.
        </div>
      )}
    </div>
  );
}
