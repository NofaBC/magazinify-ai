'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuth } from '@/lib/services/auth';
import { createTenant } from '@/lib/services/firestore';
import { uploadTenantAsset } from '@/lib/services/storage';
import type { Tenant } from '@/types/tenant';
import type { User } from 'firebase/auth';

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [businessUrl, setBusinessUrl] = useState('');
  const [email, setEmail] = useState('');
  const [tagline, setTagline] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'friendly' | 'authoritative'>('professional');
  const [primaryColor, setPrimaryColor] = useState('#171717');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const unsub = onAuth((u) => {
      if (!u) {
        router.push('/login');
      } else {
        setUser(u);
        setEmail(u.email ?? '');
      }
    });
    return unsub;
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);

    try {
      let logoUrl: string | undefined;
      if (logoFile) {
        const uploaded = await uploadTenantAsset(user.uid, logoFile, 'logo');
        logoUrl = uploaded.url;
      }

      const tenant: Tenant = {
        id: user.uid,
        ownerId: user.uid,
        businessName,
        businessUrl,
        email,
        plan: 'basic', // Will be updated from Stripe session metadata
        frequency: 'monthly',
        subscriptionStatus: 'active',
        brandPreferences: {
          primaryColor,
          tagline,
          tone,
          logoUrl,
        },
        logoUrl,
        isInternal: false,
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createTenant(tenant);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Magazinify AI™
          </Link>
          <h1 className="text-2xl font-bold mt-4">Set Up Your Magazine</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Tell us about your business so we can create your first issue.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Business Name *</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                placeholder="Acme Egg Farm"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Business Website URL *</label>
              <input
                type="url"
                value={businessUrl}
                onChange={(e) => setBusinessUrl(e.target.value)}
                required
                placeholder="https://www.example.com"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contact Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Business Tagline (optional)</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Fresh eggs from our family farm to your table"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Brand Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as typeof tone)}
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

            <div>
              <label className="block text-sm font-medium mb-1">Logo (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-zinc-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating your magazine...' : 'Launch My Magazine'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
