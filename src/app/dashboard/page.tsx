'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setUploading(true);
    
    try {
      const token = await (user as any)?.getIdToken?.();
      const bucketPath = `backups/${user.uid}/${Date.now()}.zip`;
      
      // Process the LinkedIn ZIP file
      const processResponse = await fetch('/api/process-zip', {
        method: 'POST',
        headers: { 
          'content-type': 'application/json', 
          authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ bucketPath }),
      });
      
      const processData = await processResponse.json();
      
      if (processData.success && processData.results) {
        // Store the processed results for the results page
        sessionStorage.setItem("analysisResults", JSON.stringify(processData.results));
        
        // Record usage
        await fetch('/api/usage/record', { 
          method: 'POST', 
          headers: { authorization: `Bearer ${token}` } 
        });
        
        // Redirect to results page to show the analysis
        router.push('/dashboard/results');
      } else {
        throw new Error(processData.error || 'Processing failed');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error processing file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

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
        <h3 className="mb-1 text-lg font-semibold">
          {allowed ? 'Ready to Analyze Your LinkedIn Data' : 'Upgrade Required'}
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          {allowed 
            ? "Upload your LinkedIn export ZIP for comprehensive analysis and professional insights." 
            : "You've reached your free limit. Upgrade for unlimited LinkedIn analysis."
          }
        </p>
        
        {allowed ? (
          <label className="inline-block cursor-pointer rounded bg-emerald-600 px-4 py-2 font-medium text-white">
            <input 
              type="file" 
              accept=".zip" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Processing LinkedIn Data...
              </span>
            ) : (
              '🛡️ Upload & Analyze'
            )}
          </label>
        ) : (
          <Link 
            href="/dashboard/subscription" 
            className="inline-block rounded bg-red-600 px-4 py-2 font-semibold text-white"
          >
            🚀 Upgrade Now
          </Link>
        )}
      </div>

      {uploading && (
        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-4">
          <h4 className="font-semibold text-blue-800">Processing Your LinkedIn Data</h4>
          <p className="text-sm text-blue-600 mt-1">
            Analyzing connections, messages, posts, and generating professional insights...
          </p>
          <div className="mt-2 bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse w-2/3"></div>
          </div>
        </div>
      )}
    </div>
  );
}
