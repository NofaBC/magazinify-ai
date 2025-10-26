import React, { createContext, useContext, useState, useEffect } from 'react';
// Assuming Firebase Auth or similar service is used for the backend

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create a custom hook to use the context
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Create the Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock authentication functions
  const signup = (email, password) => {
    console.log(`Simulating signup for: ${email}`);
    // In a real app, this would be a Firebase/API call
    return new Promise(resolve => setTimeout(() => {
      setCurrentUser({ uid: 'mock-uid-123', email });
      resolve();
    }, 1000));
  };

  const login = (email, password) => {
    console.log(`Simulating login for: ${email}`);
    // In a real app, this would be a Firebase/API call
    return new Promise((resolve, reject) => setTimeout(() => {
      if (email === 'test@example.com' && password === 'password') {
        setCurrentUser({ uid: 'mock-uid-123', email });
        resolve();
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000));
  };

  const logout = () => {
    console.log('Simulating logout');
    // In a real app, this would be a Firebase/API call
    return new Promise(resolve => setTimeout(() => {
      setCurrentUser(null);
      resolve();
    }, 500));
  };

  const resetPassword = (email) => {
    console.log(`Simulating password reset for: ${email}`);
    // In a real app, this would be a Firebase/API call
    return Promise.resolve();
  };

  // Effect to handle initial auth state (e.g., checking local storage or Firebase listener)
  useEffect(() => {
    // Simulate checking for an existing session
    setTimeout(() => {
      // If a session exists, set the user
      // setCurrentUser({ uid: 'mock-uid-123', email: 'test@example.com' });
      setLoading(false);
    }, 1500);

    // Cleanup function for listeners if using a real auth service
    return () => {
      // unsubscribe from auth listener
    };
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Only render children when loading is false */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
