import { NextRequest, NextResponse } from 'next/server';
import { updateTenantAdmin, getTenantAdmin } from '@/lib/services/firestore-admin';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, businessName, businessUrl, brandPreferences } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
    }

    // Verify tenant exists
    const tenant = await getTenantAdmin(tenantId);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    await updateTenantAdmin(tenantId, {
      ...(businessName !== undefined && { businessName }),
      ...(businessUrl !== undefined && { businessUrl }),
      ...(brandPreferences !== undefined && { brandPreferences }),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
