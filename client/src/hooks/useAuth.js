import { useAuth as useAuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to access the authentication context.
 * Provides the current user, loading state, and auth functions (login, logout, etc.).
 *
 * Assumes the AuthProvider is set up in the application root.
 *
 * @returns {{
 *   currentUser: object | null,
 *   loading: boolean,
 *   signup: (email, password) => Promise<void>,
 *   login: (email, password) => Promise<void>,
 *   logout: () => Promise<void>,
 *   resetPassword: (email) => Promise<void>
 * }}
 */
export const useAuth = () => {
  const context = useAuthContext();

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
