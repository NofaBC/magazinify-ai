import { NextRequest, NextResponse } from 'next/server';
import { getIssueAdmin, getPreviousArticleIndicesAdmin } from '@/lib/services/firestore-admin';
import { getAdminDb } from '@/lib/config/firebase-admin';
import type { MagazineIssue } from '@/types/magazine';

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenantId');
  const yearMonth = req.nextUrl.searchParams.get('yearMonth');

  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
  }

  // If yearMonth provided, return single issue
  if (yearMonth) {
    const issue = await getIssueAdmin(tenantId, yearMonth);
    return NextResponse.json({ issue });
  }

  // Otherwise return list of issues
  const snap = await getAdminDb()
    .collection('tenants').doc(tenantId)
    .collection('issues')
    .orderBy('yearMonth', 'desc')
    .limit(12)
    .get();

  const issues = snap.docs.map((d) => d.data() as MagazineIssue);
  return NextResponse.json({ issues });
}
