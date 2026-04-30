/**
 * Server-side Firestore operations using Firebase Admin SDK.
 * Use this in API routes — bypasses Firestore security rules.
 */
import { getAdminDb } from '@/lib/config/firebase-admin';
import type { Tenant } from '@/types/tenant';
import type { MagazineIssue, ArticleIndex } from '@/types/magazine';

// ── Tenants ──────────────────────────────────────────────

export async function getTenantAdmin(tenantId: string): Promise<Tenant | null> {
  const snap = await getAdminDb().collection('tenants').doc(tenantId).get();
  return snap.exists ? (snap.data() as Tenant) : null;
}

export async function updateTenantAdmin(
  tenantId: string,
  data: Partial<Tenant>
): Promise<void> {
  await getAdminDb().collection('tenants').doc(tenantId).update({
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

// ── Issues ───────────────────────────────────────────────

export async function issueExistsAdmin(
  tenantId: string,
  yearMonth: string
): Promise<boolean> {
  const snap = await getAdminDb()
    .collection('tenants').doc(tenantId)
    .collection('issues').doc(yearMonth)
    .get();
  return snap.exists;
}

export async function createIssueAdmin(
  tenantId: string,
  issue: MagazineIssue
): Promise<void> {
  await getAdminDb()
    .collection('tenants').doc(tenantId)
    .collection('issues').doc(issue.yearMonth)
    .set(JSON.parse(JSON.stringify(issue))); // Strip undefined values
}

export async function getIssueAdmin(
  tenantId: string,
  yearMonth: string
): Promise<MagazineIssue | null> {
  const snap = await getAdminDb()
    .collection('tenants').doc(tenantId)
    .collection('issues').doc(yearMonth)
    .get();
  return snap.exists ? (snap.data() as MagazineIssue) : null;
}

export async function updateIssueAdmin(
  tenantId: string,
  yearMonth: string,
  data: Partial<MagazineIssue>
): Promise<void> {
  await getAdminDb()
    .collection('tenants').doc(tenantId)
    .collection('issues').doc(yearMonth)
    .update(data);
}

/** Fetch previous article indices for dedup (last N months) */
export async function getPreviousArticleIndicesAdmin(
  tenantId: string,
  months = 6
): Promise<ArticleIndex[]> {
  const snap = await getAdminDb()
    .collection('tenants').doc(tenantId)
    .collection('issues')
    .orderBy('yearMonth', 'desc')
    .limit(months)
    .get();

  return snap.docs.flatMap((d) => {
    const data = d.data() as MagazineIssue;
    return data.articleIndex ?? [];
  });
}
