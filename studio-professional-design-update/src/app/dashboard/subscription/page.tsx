"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for trying out LinkStream',
      features: [
        '1 LinkedIn analysis per month',
        'Basic network insights',
        'Standard export formats',
        'Email support',
        'Secure data processing'
      ],
      limitations: [
        'Limited to 1 analysis/month',
        'Basic insights only'
      ],
      cta: 'Current Plan',
      popular: false
    },
    {
      name: 'Pro',
      price: { monthly: 19, yearly: 190 },
      description: 'For professionals who want unlimited insights',
      features: [
        'Unlimited LinkedIn analyses',
        'Advanced AI-powered insights',
        'All export formats (PDF, Excel, JSON)',
        'Priority email & chat support',
        'Advanced network analytics',
        'Custom reporting',
        'API access',
        'Data retention (12 months)'
      ],
      limitations: [],
      cta: 'Upgrade to Pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: { monthly: 99, yearly: 990 },
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team collaboration tools',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantees',
        'Custom data retention',
        'White-label options',
        'Advanced security features'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const handlePlanSelect = async (planName: string) => {
    if (planName === 'Free') {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
      return;
    }

    if (planName === 'Enterprise') {
      window.location.href = 'mailto:sales@linkstream.app?subject=Enterprise Plan Inquiry';
      return;
    }

    if (planName === 'Pro') {
      if (!user) {
        router.push('/login');
        return;
      }

      setLoading(planName);

      try {
        // Call your existing API route
        const response = await fetch('/api/subscription/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan: 'pro',
            userId: user.uid,
            userEmail: user.email,
            billingCycle
          }),
        });

        const data = await response.json();

        if (data.success && data.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Failed to create checkout session');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        alert('Failed to start checkout process. Please try again.');
      } finally {
        setLoading(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
                <span className="text-white font-bold text-lg">🛡️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">LinkStream</h1>
                <p className="text-xs text-blue-200 hidden sm:block">Choose Your Plan</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/')}
                className="text-white/80 hover:text-white transition-colors"
              >
                Home
              </button>
              {user ? (
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Dashboard
                </button>
              ) : (
                <button 
                  onClick={() => router.push('/login')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Protection Plan</span>
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Secure your professional network and unlock powerful insights with our flexible pricing options
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-white/20">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 px-2 py-1 bg-emerald-500 text-white text-xs rounded-full">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-white/10 backdrop-blur-sm rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                plan.popular
                  ? 'border-blue-400 shadow-lg shadow-blue-500/20 scale-105'
                  : 'border-white/20 hover:border-white/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-blue-200 text-sm mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">
                    ${plan.price[billingCycle]}
                  </span>
                  <span className="text-blue-200 ml-2">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                  {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                    <p className="text-emerald-400 text-sm mt-2">
                      ${Math.round((plan.price.yearly / 12) * 100) / 100}/month billed annually
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-blue-100 text-sm">{feature}</span>
                  </div>
                ))}
                
                {plan.limitations.map((limitation, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <span className="text-orange-200 text-sm">{limitation}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePlanSelect(plan.name)}
                disabled={(plan.name === 'Free' && !!user) || loading === plan.name}
                className={`w-full py-4 px-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800'
                    : plan.name === 'Free'
                    ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                } ${((plan.name === 'Free' && !!user) || loading === plan.name) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading === plan.name ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (plan.name === 'Free' && !!user) ? 'Current Plan' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-blue-200 text-sm">
            All plans include bank-level security, GDPR compliance, and data privacy protection
          </p>
          <div className="flex justify-center items-center space-x-8 mt-4">
            <span className="flex items-center text-blue-300 text-xs">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
              30-day money back guarantee
            </span>
            <span className="flex items-center text-blue-300 text-xs">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              Cancel anytime
            </span>
            <span className="flex items-center text-blue-300 text-xs">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
              24/7 support
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
