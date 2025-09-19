import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, dbService } from '../database/firebase.js';

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
  const [userProfile, setUserProfile] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Fetch user profile from Firestore
          try {
            const profile = await dbService.users.getById(firebaseUser.uid);
            setUserProfile(profile);
            
            // Fetch tenant information
            if (profile.tenantId) {
              const tenantData = await dbService.tenants.getById(profile.tenantId);
              setTenant(tenantData);
            }
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            // User exists in Firebase Auth but not in Firestore
            // This might happen during the signup process
            setUserProfile(null);
            setTenant(null);
          }
        } else {
          setUser(null);
          setUserProfile(null);
          setTenant(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const firebaseUser = await authService.signUp(email, password, userData);
      
      // The user profile will be set by the auth state change listener
      return firebaseUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const firebaseUser = await authService.signIn(email, password);
      return firebaseUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateProfile = async (updates) => {
    try {
      setError(null);
      
      if (userProfile?.id) {
        const updatedProfile = await dbService.users.update(userProfile.id, updates);
        setUserProfile(updatedProfile);
        return updatedProfile;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTenant = async (updates) => {
    try {
      setError(null);
      
      if (tenant?.id) {
        const updatedTenant = await dbService.tenants.update(tenant.id, updates);
        setTenant(updatedTenant);
        return updatedTenant;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    // Auth state
    user,
    userProfile,
    tenant,
    loading,
    error,
    
    // Auth methods
    signUp,
    signIn,
    signOut,
    updateProfile,
    updateTenant,
    
    // Helper methods
    isAuthenticated: !!user,
    isProfileComplete: !!userProfile,
    hasTenant: !!tenant,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
