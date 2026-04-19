'use client';

import { useState, useEffect } from 'react';
import { getIssue, listIssues } from '@/lib/services/firestore';
import type { MagazineIssue } from '@/types/magazine';

export function useMagazineIssue(tenantId: string, yearMonth: string) {
  const [issue, setIssue] = useState<MagazineIssue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId || !yearMonth) return;
    getIssue(tenantId, yearMonth)
      .then(setIssue)
      .finally(() => setLoading(false));
  }, [tenantId, yearMonth]);

  return { issue, loading };
}

export function useMagazineList(tenantId: string) {
  const [issues, setIssues] = useState<MagazineIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    listIssues(tenantId)
      .then(setIssues)
      .finally(() => setLoading(false));
  }, [tenantId]);

  return { issues, loading };
}