'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';
import { getCurrentYearMonth } from '@/lib/utils/validation';

export default function NewIssuePage() {
  const { tenant } = useTenant();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const yearMonth = getCurrentYearMonth();
  const [year, month] = yearMonth.split('-');
  const monthName = new Date(Number(year), Number(month) - 1).toLocaleString(
    'en-US',
    { month: 'long' }
  );

  async function handleGenerate() {
    if (!tenant) return;
    setLoading(true);
    setError('');
    setStatus('Analyzing your website...');

    try {
      setStatus('Generating your magazine... This may take a few minutes.');

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tenant.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Generation failed');
      }

      setStatus('Done! Redirecting to your magazine...');
      router.push(`/magazines/${data.yearMonth}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
      setStatus('');
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create New Issue</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {monthName} {year} Edition
        </p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Issue Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Business</span>
              <span className="font-medium">{tenant?.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Website</span>
              <span className="font-medium">{tenant?.businessUrl}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Plan</span>
              <span className="font-medium capitalize">{tenant?.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Pages</span>
              <span className="font-medium">{tenant?.plan === 'pro' ? 24 : 12}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Period</span>
              <span className="font-medium">{monthName} {year}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {status && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-700 text-sm flex items-center gap-2">
            {loading && (
              <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-700 rounded-full animate-spin shrink-0" />
            )}
            {status}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {loading ? 'Generating...' : 'Generate Magazine Issue'}
        </button>

        <p className="text-xs text-zinc-400 text-center mt-3">
          AI will analyze your website and generate a complete magazine issue. This typically takes 2-4 minutes.
        </p>
      </div>
    </div>
  );
}
