import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, limit, query, where } from 'firebase/firestore';
import { db } from '../lib/database/firebase.js';

/**
 * Hook to fetch published issues for a specific tenant and magazine
 */
export function usePublishedIssues({ tenantSlug, magazineSlug, pageSize = 6 }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    
    async function fetchIssues() {
      try {
        setLoading(true);
        setError(null);

        if (!tenantSlug || !magazineSlug) {
          throw new Error('tenantSlug and magazineSlug are required');
        }

        // Build the collection path: /tenants/{t}/magazines/{m}/issues
        const issuesRef = collection(
          db,
          'tenants',
          tenantSlug,
          'magazines',
          magazineSlug,
          'issues'
        );

        // Query for published issues only, ordered by publishedAt desc
        // Note: Firestore security rules will automatically filter to published issues for public users
        const q = query(
          issuesRef,
          where('status', '==', 'published'),
          orderBy('publishedAt', 'desc'),
          limit(pageSize)
        );

        const snapshot = await getDocs(q);
        const issuesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to Date if needed
          publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt
        }));

        if (alive) {
          setIssues(issuesData);
        }
      } catch (err) {
        console.error('Error fetching published issues:', err);
        if (alive) {
          setError(err);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    fetchIssues();
    
    return () => {
      alive = false;
    };
  }, [tenantSlug, magazineSlug, pageSize]);

  return { issues, loading, error };
}

/**
 * Hook to fetch a single published issue
 */
export function usePublishedIssue({ tenantSlug, magazineSlug, issueSlug }) {
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    
    async function fetchIssue() {
      try {
        setLoading(true);
        setError(null);

        if (!tenantSlug || !magazineSlug || !issueSlug) {
          throw new Error('tenantSlug, magazineSlug, and issueSlug are required');
        }

        // For a single issue, we can use the API endpoint which handles security
        const response = await fetch(
          `/api/public/issue?tenantSlug=${tenantSlug}&magazineSlug=${magazineSlug}&issueSlug=${issueSlug}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch issue: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.ok) {
          throw new Error(data.error?.message || 'Failed to fetch issue');
        }

        if (alive) {
          setIssue(data);
        }
      } catch (err) {
        console.error('Error fetching published issue:', err);
        if (alive) {
          setError(err);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    fetchIssue();
    
    return () => {
      alive = false;
    };
  }, [tenantSlug, magazineSlug, issueSlug]);

  return { issue, loading, error };
}

/**
 * Hook to fetch issue archive (list of all published issues)
 */
export function useIssueArchive({ tenantSlug, magazineSlug, limit = 24 }) {
  const [archive, setArchive] = useState({ magazine: null, issues: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    
    async function fetchArchive() {
      try {
        setLoading(true);
        setError(null);

        if (!tenantSlug || !magazineSlug) {
          throw new Error('tenantSlug and magazineSlug are required');
        }

        const response = await fetch(
          `/api/public/archive?tenantSlug=${tenantSlug}&magazineSlug=${magazineSlug}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch archive: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.ok) {
          throw new Error(data.error?.message || 'Failed to fetch archive');
        }

        if (alive) {
          setArchive({
            magazine: data.magazine,
            issues: data.issues,
            total: data.total
          });
        }
      } catch (err) {
        console.error('Error fetching issue archive:', err);
        if (alive) {
          setError(err);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    fetchArchive();
    
    return () => {
      alive = false;
    };
  }, [tenantSlug, magazineSlug, limit]);

  return { archive, loading, error };
}

export default {
  usePublishedIssues,
  usePublishedIssue,
  useIssueArchive
};
