'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    async function check() {
      if (!user) return;
      const token = await (user as any)?.getIdToken?.();
      const res = await fetch('/api/usage/can-create', { headers: { authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAllowed(Boolean(data.allowed));
    }
    if (!loading && user) check();
  }, [user, loading]);

  if (loading) return <div>Loading…</div>;
  if (!user) return null;

  return (
    <div className="p-6">
      <header className="mb-4 flex items-center justify-between border-b pb-3">
        <h1 className="text-xl font-bold">🛡️ LinkStream</h1>
        <nav className="flex gap-4">
          <Link href="/dashboard">📊 Dashboard</Link>
          <Link href="/dashboard/subscription">💳 Pricing</Link>
        </nav>
      </header>

      <div className="rounded-md border p-4">
        <h3 className="mb-1 text-lg font-semibold">{allowed ? 'Ready to Protect Your LinkedIn' : 'Upgrade Required'}</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          {allowed ? "Upload your LinkedIn export ZIP for secure backup and AI insights." : "You've reached your free limit. Upgrade for unlimited protection."}
        </p>
        {allowed ? (
          <label className="inline-block cursor-pointer rounded bg-emerald-600 px-4 py-2 font-medium text-white">
            <input type="file" accept=".zip" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !user) return;
              const token = await (user as any)?.getIdToken?.();
              const bucketPath = `backups/${user.uid}/${Date.now()}.zip`; // ensure client upload matches this
              await fetch('/api/process-zip', {
                method: 'POST',
                headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
                body: JSON.stringify({ bucketPath }),
              });
              await fetch('/api/usage/record', { method: 'POST', headers: { authorization: `Bearer ${token}` } });
              alert('Backup processed!');
            }} />
            🛡️ Upload & Secure
          </label>
        ) : (
          <Link href="/dashboard/subscription" className="inline-block rounded bg-red-600 px-4 py-2 font-semibold text-white">🚀 Upgrade Now</Link>
        )}
      </div>
    </div>
  );
}
