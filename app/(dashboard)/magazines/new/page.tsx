'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Plus, X, ImageIcon } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';
import { uploadTenantAsset } from '@/lib/services/storage';
import { getCurrentYearMonth } from '@/lib/utils/validation';

interface AdEntry {
  file: File | null;
  uploadedUrl: string;
  linkUrl: string;
  advertiserName: string;
}

export default function NewIssuePage() {
  const { tenant } = useTenant();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [ads, setAds] = useState<AdEntry[]>([]);

  const yearMonth = getCurrentYearMonth();
  const [year, month] = yearMonth.split('-');
  const monthName = new Date(Number(year), Number(month) - 1).toLocaleString(
    'en-US',
    { month: 'long' }
  );

  const maxAds = (tenant?.plan === 'pro' ? 24 : 12) - 3; // Reserve cover + TOC + back

  function addAd() {
    if (ads.length >= maxAds) return;
    setAds([...ads, { file: null, uploadedUrl: '', linkUrl: '', advertiserName: '' }]);
  }

  function removeAd(index: number) {
    setAds(ads.filter((_, i) => i !== index));
  }

  function updateAd(index: number, field: keyof AdEntry, value: string | File | null) {
    const updated = [...ads];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[index] as any)[field] = value;
    setAds(updated);
  }

  async function handleGenerate() {
    if (!tenant) return;
    setLoading(true);
    setError('');

    try {
      // Upload ad images first
      const adsWithFiles = ads.filter((ad) => ad.file);
      let adSlots: { imageUrl: string; linkUrl?: string; advertiserName?: string }[] = [];

      if (adsWithFiles.length > 0) {
        setStatus(`Uploading ${adsWithFiles.length} ad image(s)...`);
        adSlots = await Promise.all(
          adsWithFiles.map(async (ad) => {
            const uploaded = await uploadTenantAsset(tenant.id, ad.file!, 'ads');
            return {
              imageUrl: uploaded.url,
              linkUrl: ad.linkUrl || undefined,
              advertiserName: ad.advertiserName || undefined,
            };
          })
        );
      }

      setStatus('Generating your magazine... This may take a few minutes.');

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.id,
          adSlots,
        }),
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

        {/* Ad Upload Section */}
        <div className="mb-6 border-t border-zinc-100 pt-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-sm">Advertisements (optional)</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upload ad images for your clients or your own business. Each ad takes one full page.
              </p>
            </div>
          </div>

          {ads.map((ad, index) => (
            <div key={index} className="mb-3 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-500">Ad {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeAd(index)}
                  className="text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Ad Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => updateAd(index, 'file', e.target.files?.[0] ?? null)}
                    className="w-full text-xs text-zinc-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Click-through URL (optional)</label>
                  <input
                    type="url"
                    value={ad.linkUrl}
                    onChange={(e) => updateAd(index, 'linkUrl', e.target.value)}
                    placeholder="https://advertiser-website.com"
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Advertiser Name (optional)</label>
                  <input
                    type="text"
                    value={ad.advertiserName}
                    onChange={(e) => updateAd(index, 'advertiserName', e.target.value)}
                    placeholder="Advertiser Inc."
                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addAd}
            disabled={ads.length >= maxAds}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors disabled:opacity-30"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Advertisement
            {ads.length > 0 && <span className="text-zinc-400">({ads.length}/{maxAds} max)</span>}
          </button>
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
          {ads.filter((a) => a.file).length > 0 && ` Includes ${ads.filter((a) => a.file).length} ad page(s).`}
        </p>
      </div>
    </div>
  );
}
