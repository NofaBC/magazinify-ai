'use client';

import { useState } from 'react';
import { useTenant } from '@/hooks/useTenant';
import { updateTenant } from '@/lib/services/firestore';

export default function SettingsPage() {
  const { tenant } = useTenant();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [businessName, setBusinessName] = useState(tenant?.businessName ?? '');
  const [businessUrl, setBusinessUrl] = useState(tenant?.businessUrl ?? '');
  const [tagline, setTagline] = useState(tenant?.brandPreferences?.tagline ?? '');
  const [tone, setTone] = useState(tenant?.brandPreferences?.tone ?? 'professional');
  const [primaryColor, setPrimaryColor] = useState(
    tenant?.brandPreferences?.primaryColor ?? '#171717'
  );

  // Sync state when tenant loads
  if (tenant && !businessName && tenant.businessName) {
    setBusinessName(tenant.businessName);
    setBusinessUrl(tenant.businessUrl);
    setTagline(tenant.brandPreferences?.tagline ?? '');
    setTone(tenant.brandPreferences?.tone ?? 'professional');
    setPrimaryColor(tenant.brandPreferences?.primaryColor ?? '#171717');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant) return;
    setSaving(true);
    setSaved(false);

    await updateTenant(tenant.id, {
      businessName,
      businessUrl,
      brandPreferences: {
        ...tenant.brandPreferences,
        tagline,
        tone: tone as 'professional' | 'casual' | 'friendly' | 'authoritative',
        primaryColor,
      },
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Update your business profile</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-zinc-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Business Name</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Business URL</label>
          <input
            type="url"
            value={businessUrl}
            onChange={(e) => setBusinessUrl(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Brand Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as 'professional' | 'casual' | 'friendly' | 'authoritative')}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
            <option value="authoritative">Authoritative</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Brand Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-10 rounded border border-zinc-200 cursor-pointer"
            />
            <span className="text-sm text-zinc-500">{primaryColor}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </form>
    </div>
  );
}
