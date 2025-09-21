import React, { createContext, useContext, useEffect, useState } from 'react';
import { authHelpers, dbService } from '../database/firebase.js';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authHelpers.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Get user's tenant information
          const userTenant = await getUserTenant(firebaseUser.uid);
          setTenant(userTenant);
        } else {
          setUser(null);
          setTenant(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const getUserTenant = async (userId) => {
    try {
      // This would typically query a users collection to get tenant association
      // For now, we'll return a mock tenant
      return {
        id: 'tenant_1',
        name: 'Demo Tenant',
        plan: 'basic',
        slug: 'demo-tenant',
        customDomain: null
      };
    } catch (error) {
      console.error('Error getting user tenant:', error);
      return null;
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      setLoading(true);
      const user = await authHelpers.signUp(email, password, userData);
      return user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const user = await authHelpers.signIn(email, password);
      return user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authHelpers.signOut();
      setUser(null);
      setTenant(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    tenant,
    loading,
    signUp,
    signIn,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
