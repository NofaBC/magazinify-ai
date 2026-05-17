'use client';

import { useState, useEffect } from 'react';
import type { MagazineIssue } from '@/types/magazine';

export function useMagazineIssue(tenantId: string, yearMonth: string) {
  const [issue, setIssue] = useState<MagazineIssue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId || !yearMonth) return;
    fetch(`/api/issues?tenantId=${tenantId}&yearMonth=${yearMonth}`)
      .then((res) => res.json())
      .then((data) => setIssue(data.issue ?? null))
      .catch(() => setIssue(null))
      .finally(() => setLoading(false));
  }, [tenantId, yearMonth]);

  return { issue, loading };
}

export function useMagazineList(tenantId: string) {
  const [issues, setIssues] = useState<MagazineIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    fetch(`/api/issues?tenantId=${tenantId}`)
      .then((res) => res.json())
      .then((data) => setIssues(data.issues ?? []))
      .catch(() => setIssues([]))
      .finally(() => setLoading(false));
  }, [tenantId]);

  return { issues, loading };
}
