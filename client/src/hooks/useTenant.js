import { useTenant as useTenantContext } from '../contexts/TenantContext';

/**
 * Custom hook to access the tenant context.
 * Provides the current tenant's data, loading state, and functions to update settings.
 *
 * Assumes the TenantProvider is set up in the application root.
 *
 * @returns {{
 *   tenant: object | null,
 *   loading: boolean,
 *   updateTenantSettings: (newSettings: object) => Promise<void>
 * }}
 */
export const useTenant = () => {
  const context = useTenantContext();

  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }

  return context;
};
