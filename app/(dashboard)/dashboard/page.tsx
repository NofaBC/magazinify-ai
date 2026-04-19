'use client';

import Link from 'next/link';
import { BookOpen, Plus, ExternalLink } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';
import { useMagazineList } from '@/hooks/useMagazine';

export default function DashboardPage() {
  const { tenant } = useTenant();
  const { issues, loading } = useMagazineList(tenant?.id ?? '');

  const latestIssue = issues[0];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome, {tenant?.businessName}</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {tenant?.plan === 'pro' ? 'Pro' : 'Basic'} Plan · Monthly Publication
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Quick stats */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Issues</p>
          <p className="text-2xl font-bold mt-1">{issues.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Plan</p>
          <p className="text-2xl font-bold mt-1 capitalize">{tenant?.plan}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Pages per Issue</p>
          <p className="text-2xl font-bold mt-1">{tenant?.plan === 'pro' ? 24 : 12}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-4 mb-8">
        <Link
          href="/magazines/new"
          className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Issue
        </Link>
        {latestIssue?.shareableUrl && (
          <a
            href={latestIssue.shareableUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-zinc-200 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Latest Issue
          </a>
        )}
      </div>

      {/* Recent issues */}
      <div className="bg-white rounded-xl border border-zinc-200">
        <div className="p-5 border-b border-zinc-100">
          <h2 className="font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Recent Issues
          </h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-zinc-400 text-sm">Loading...</div>
        ) : issues.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-zinc-500 text-sm">No issues yet.</p>
            <Link
              href="/magazines/new"
              className="text-sm font-medium text-zinc-900 hover:underline mt-2 inline-block"
            >
              Create your first issue →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {issues.slice(0, 5).map((issue) => (
              <div key={issue.yearMonth} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {new Date(issue.yearMonth + '-01').toLocaleString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {issue.pageCount} pages · {issue.status}
                  </p>
                </div>
                <Link
                  href={`/magazines/${issue.yearMonth}`}
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
