'use client';

import Link from 'next/link';
import { Plus, BookOpen, ExternalLink } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';
import { useMagazineList } from '@/hooks/useMagazine';

export default function MagazinesPage() {
  const { tenant } = useTenant();
  const { issues, loading } = useMagazineList(tenant?.id ?? '');

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Magazines</h1>
          <p className="text-zinc-500 text-sm mt-1">All your published issues</p>
        </div>
        <Link
          href="/magazines/new"
          className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Issue
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-400">Loading...</div>
      ) : issues.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
          <BookOpen className="w-10 h-10 text-zinc-300 mx-auto mb-4" />
          <h2 className="font-semibold mb-1">No issues yet</h2>
          <p className="text-sm text-zinc-500 mb-4">Create your first AI-generated magazine.</p>
          <Link
            href="/magazines/new"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800"
          >
            <Plus className="w-4 h-4" />
            Create First Issue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <div
              key={issue.yearMonth}
              className="bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">
                    {new Date(issue.yearMonth + '-01').toLocaleString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {issue.pageCount} pages · {issue.articleIndex?.length ?? 0} articles
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    issue.status === 'published'
                      ? 'bg-green-50 text-green-700'
                      : issue.status === 'generating'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {issue.status}
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/magazines/${issue.yearMonth}`}
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50"
                >
                  View
                </Link>
                {issue.shareableUrl && (
                  <a
                    href={issue.shareableUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Share
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
