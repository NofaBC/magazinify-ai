'use client';

import { useState, useEffect } from 'react';
import { onAuth } from '@/lib/services/auth';
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
        try {
          const res = await fetch(`/api/tenant?tenantId=${u.uid}`);
          if (res.ok) {
            const data = await res.json();
            setTenant(data.tenant);
          } else {
            setTenant(null);
          }
        } catch {
          setTenant(null);
        }
      } else {
        setTenant(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, tenant, loading };
}
