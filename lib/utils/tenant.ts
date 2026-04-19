/** Tenant utility helpers */

/** Generate a unique issue ID from tenant + year-month */
export function issueDocId(tenantId: string, yearMonth: string): string {
  return `${tenantId}_${yearMonth}`;
}

/** Build a shareable magazine URL */
export function shareableUrl(tenantId: string, yearMonth: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://magazinify.ai';
  return `${base}/magazine/${tenantId}?issue=${yearMonth}`;
}

/** Check if a year-month string is the current month */
export function isCurrentMonth(yearMonth: string): boolean {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return yearMonth === current;
}