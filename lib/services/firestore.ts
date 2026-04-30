import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/config/firebase';
import type { Tenant } from '@/types/tenant';
import type { MagazineIssue, ArticleIndex } from '@/types/magazine';

// ── Tenants ──────────────────────────────────────────────

export async function createTenant(tenant: Tenant): Promise<void> {
  await setDoc(doc(getFirebaseDb(), 'tenants', tenant.id), {
    ...tenant,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function getTenant(tenantId: string): Promise<Tenant | null> {
  const snap = await getDoc(doc(getFirebaseDb(), 'tenants', tenantId));
  return snap.exists() ? (snap.data() as Tenant) : null;
}

export async function updateTenant(
  tenantId: string,
  data: Partial<Tenant>
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), 'tenants', tenantId), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

// ── Issues ───────────────────────────────────────────────

/** Check if an issue already exists for a given month (monthly guard) */
export async function issueExists(
  tenantId: string,
  yearMonth: string
): Promise<boolean> {
  const snap = await getDoc(
    doc(getFirebaseDb(), 'tenants', tenantId, 'issues', yearMonth)
  );
  return snap.exists();
}

export async function createIssue(
  tenantId: string,
  issue: MagazineIssue
): Promise<void> {
  await setDoc(
    doc(getFirebaseDb(), 'tenants', tenantId, 'issues', issue.yearMonth),
    issue
  );
}

export async function getIssue(
  tenantId: string,
  yearMonth: string
): Promise<MagazineIssue | null> {
  const snap = await getDoc(
    doc(getFirebaseDb(), 'tenants', tenantId, 'issues', yearMonth)
  );
  return snap.exists() ? (snap.data() as MagazineIssue) : null;
}

export async function updateIssue(
  tenantId: string,
  yearMonth: string,
  data: Partial<MagazineIssue>
): Promise<void> {
  await updateDoc(
    doc(getFirebaseDb(), 'tenants', tenantId, 'issues', yearMonth),
    data
  );
}

export async function listIssues(
  tenantId: string,
  maxResults = 12
): Promise<MagazineIssue[]> {
  const q = query(
    collection(getFirebaseDb(), 'tenants', tenantId, 'issues'),
    orderBy('yearMonth', 'desc'),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as MagazineIssue);
}

/** Fetch previous article indices for dedup (last N months) */
export async function getPreviousArticleIndices(
  tenantId: string,
  months = 6
): Promise<ArticleIndex[]> {
  const issues = await listIssues(tenantId, months);
  return issues.flatMap((issue) => issue.articleIndex ?? []);
}