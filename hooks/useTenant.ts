'use client';

import { useState, useEffect } from 'react';
import { onAuth } from '@/lib/services/auth';
import { getTenant } from '@/lib/services/firestore';
import type { Tenant } from '@/types/tenant';
import type { User } from 'firebase/auth';

export function useTenant() {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuth(async (u) => {
      setUser(u);
      if (u) {
        const t = await getTenant(u.uid);
        setTenant(t);
      } else {
        setTenant(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, tenant, loading };
}