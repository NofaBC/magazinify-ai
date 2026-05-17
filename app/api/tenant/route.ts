import { NextRequest, NextResponse } from 'next/server';
import { getTenantAdmin } from '@/lib/services/firestore-admin';

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenantId');
  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
  }

  const tenant = await getTenantAdmin(tenantId);
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  return NextResponse.json({ tenant });
}
