'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';
import { useMagazineIssue } from '@/hooks/useMagazine';

const FlipbookViewer = dynamic(
  () => import('@/components/magazine/FlipbookViewer'),
  { ssr: false }
);

export default function MagazineViewPage() {
  const params = useParams();
  const { tenant } = useTenant();
  const yearMonth = params.magazineId as string;
  const { issue, loading } = useMagazineIssue(tenant?.id ?? '', yearMonth);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-2">Issue Not Found</h2>
        <p className="text-zinc-500 mb-4">This issue hasn&apos;t been created yet.</p>
        <Link href="/magazines" className="text-sm font-medium text-zinc-900 hover:underline">
          ← Back to Magazines
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/magazines" className="text-zinc-400 hover:text-zinc-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">
              {new Date(yearMonth + '-01').toLocaleString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </h1>
            <p className="text-xs text-zinc-400">
              {issue.pageCount} pages · {issue.articleIndex?.length ?? 0} articles
            </p>
          </div>
        </div>
        {issue.shareableUrl && (
          <a
            href={issue.shareableUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-zinc-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Share Link
          </a>
        )}
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <FlipbookViewer pages={issue.pages} businessName={issue.businessName} />
      </div>
    </div>
  );
}
