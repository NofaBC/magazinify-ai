import { NextRequest, NextResponse } from 'next/server';
import { getTenant, getIssue } from '@/lib/services/firestore';
import { sendIssueEmail } from '@/lib/services/email';
import { cleanupTempAssets } from '@/lib/services/storage';

/**
 * Post-generation callback webhook.
 * Called after a magazine issue is generated and stored.
 * Handles: email delivery + temp asset cleanup.
 */
export async function POST(req: NextRequest) {
  try {
    const { tenantId, yearMonth } = await req.json();

    if (!tenantId || !yearMonth) {
      return NextResponse.json(
        { error: 'tenantId and yearMonth required' },
        { status: 400 }
      );
    }

    // Get tenant and issue data
    const [tenant, issue] = await Promise.all([
      getTenant(tenantId),
      getIssue(tenantId, yearMonth),
    ]);

    if (!tenant || !issue) {
      return NextResponse.json(
        { error: 'Tenant or issue not found' },
        { status: 404 }
      );
    }

    // 1. Send email with shareable link
    let emailSent = false;
    if (issue.shareableUrl) {
      emailSent = await sendIssueEmail({
        to: tenant.email,
        businessName: tenant.businessName,
        yearMonth,
        shareableUrl: issue.shareableUrl,
      });
    }

    // 2. Cleanup temporary assets
    await cleanupTempAssets(tenantId, 'temp').catch(() => {
      // Non-critical — log but don't fail
      console.warn(`[Cleanup] Temp asset cleanup failed for ${tenantId}`);
    });

    return NextResponse.json({
      success: true,
      emailSent,
      tempCleaned: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Callback failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
