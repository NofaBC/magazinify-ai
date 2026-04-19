import { NextRequest, NextResponse } from 'next/server';
import { generateMagazineIssue } from '@/lib/services/magazine-generator';
import { issueExists, createIssue, getTenant } from '@/lib/services/firestore';
import { sendIssueEmail } from '@/lib/services/email';
import { cleanupTempAssets } from '@/lib/services/storage';
import { shareableUrl } from '@/lib/utils/tenant';
import { getCurrentYearMonth } from '@/lib/utils/validation';
import type { GenerateIssueRequest } from '@/types/magazine';

export const maxDuration = 300; // 5 minutes for Vercel Pro

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
    }

    // Get tenant data
    const tenant = await getTenant(tenantId);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const yearMonth = body.yearMonth ?? getCurrentYearMonth();

    // Monthly issue guard
    const exists = await issueExists(tenantId, yearMonth);
    if (exists) {
      return NextResponse.json(
        { error: `Issue for ${yearMonth} already exists` },
        { status: 409 }
      );
    }

    // Build generation request
    const request: GenerateIssueRequest = {
      tenantId,
      businessUrl: tenant.businessUrl,
      businessName: tenant.businessName,
      plan: tenant.plan === 'custom' ? 'pro' : tenant.plan,
      yearMonth,
      brandPreferences: tenant.brandPreferences,
    };

    // Generate the magazine
    const issue = await generateMagazineIssue(request);

    // Add shareable URL
    issue.shareableUrl = shareableUrl(tenantId, yearMonth);

    // Store in Firestore
    await createIssue(tenantId, issue);

    // Post-generation: send email + cleanup (non-blocking)
    sendIssueEmail({
      to: tenant.email,
      businessName: tenant.businessName,
      yearMonth,
      shareableUrl: issue.shareableUrl!,
    }).catch(() => {});

    cleanupTempAssets(tenantId, 'temp').catch(() => {});

    return NextResponse.json({
      success: true,
      issueId: issue.id,
      yearMonth,
      shareableUrl: issue.shareableUrl,
      pageCount: issue.pages.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    console.error('[Generate] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
