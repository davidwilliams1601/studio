'use client';
import Link from 'next/link';

export default function SuccessPage() {
  // Minimal example, assumes querystring status handling in your original page
  const status = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('status') : null;
  const success = status === 'success';
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-xl rounded-lg bg-white p-8 shadow">
        {success ? (
          <>
            <div className="mb-4 text-4xl">✅</div>
            <h1 className="mb-2 text-2xl font-bold text-emerald-700">Payment Successful</h1>
            <p className="mb-6 text-slate-600">You're now protected with Pro features.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard" className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white">🚀 Start Using Pro Features</Link>
              <Link href="/dashboard/subscription" className="rounded border px-4 py-2 font-semibold text-slate-600">View Subscription</Link>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 text-4xl">❌</div>
            <h1 className="mb-2 text-2xl font-bold text-red-600">Payment Failed</h1>
            <p className="mb-6 text-slate-600">There was an issue processing your payment. Please try again.</p>
            <div className="flex justify-center">
              <Link href="/dashboard/subscription" className="rounded bg-red-600 px-4 py-2 font-semibold text-white">Try Again</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
