'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getCurrentYearMonth } from '@/lib/utils/validation';
import FlipbookViewer from '@/components/magazine/FlipbookViewer';
import type { MagazineIssue } from '@/types/magazine';

export default function PublicMagazinePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tenantId = params.tenantId as string;
  const issueParam = searchParams.get('issue');

  const [issue, setIssue] = useState<MagazineIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadIssue() {
      try {
        let yearMonth = issueParam;

        // If no specific issue requested, get the latest published one
        if (!yearMonth) {
          const res = await fetch(`/api/issues?tenantId=${tenantId}`);
          const data = await res.json();
          const latest = (data.issues ?? []).find((i: MagazineIssue) => i.status === 'published');
          yearMonth = latest?.yearMonth ?? getCurrentYearMonth();
        }

        const res = await fetch(`/api/issues?tenantId=${tenantId}&yearMonth=${yearMonth}`);
        const data = await res.json();
        if (data.issue && data.issue.status === 'published') {
          setIssue(data.issue);
        } else {
          setError('This issue is not available yet.');
        }
      } catch {
        setError('Could not load the magazine.');
      } finally {
        setLoading(false);
      }
    }

    if (tenantId) loadIssue();
  }, [tenantId, issueParam]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-zinc-500">Loading magazine...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Magazine Not Found</h1>
          <p className="text-zinc-500">{error || 'This magazine issue is not available.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{issue.businessName}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {new Date(issue.yearMonth + '-01').toLocaleString('en-US', {
            month: 'long',
            year: 'numeric',
          })}{' '}
          Edition
        </p>
      </div>

      {/* Flipbook */}
      <FlipbookViewer pages={issue.pages} businessName={issue.businessName} />

      {/* Footer */}
      <div className="text-center mt-8 text-xs text-zinc-400">
        Powered by Magazinify AI™ — A NOFA AI Factory™ Product
      </div>
    </div>
  );
}
