'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Subscription() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);

  async function handleUpgrade(plan: { name: string; priceId?: string }) {
    if (!plan.priceId) return;
    setUpgradeLoading(plan.name);
    try {
      const token = await (user as any)?.getIdToken?.();
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ priceId: plan.priceId }),
      });
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
      else alert(data?.error || 'Unable to start checkout.');
    } finally {
      setUpgradeLoading(null);
    }
  }

  const plans = [
    { name: 'Free', price: '$0', interval: 'forever', features: ['1 backup/mo'], current: true },
    { name: 'Pro', price: '$19', interval: 'month', priceId: 'price_pro_monthly', features: ['Unlimited + AI'] },
    { name: 'Business', price: '$99', interval: 'month', priceId: 'price_business_monthly', features: ['Teams + API'] },
  ];

  if (loading) return <div>Loading...</div>;
  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/dashboard">← Back to Dashboard</Link>
      </div>
      <h1 className="mb-4 text-2xl font-bold">Choose your plan</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name} className="rounded-md border p-4">
            <div className="mb-2 text-xl font-semibold">{p.name}</div>
            <div className="mb-4 text-muted-foreground">{p.price}/{p.interval}</div>
            <ul className="mb-4 list-disc pl-5 text-sm text-muted-foreground">
              {p.features.map((f) => (<li key={f}>{f}</li>))}
            </ul>
            {p.priceId ? (
              <button
                className="rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
                disabled={upgradeLoading === p.name}
                onClick={() => handleUpgrade(p)}
              >
                {upgradeLoading === p.name ? 'Loading…' : 'Upgrade'}
              </button>
            ) : (
              <span className="text-sm">Current plan</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
