import React, { createContext, useContext, useState } from 'react';

// 1. Create the Context
const UIContext = createContext(null);

// 2. Create a custom hook to use the context
export const useUI = () => {
  return useContext(UIContext);
};

// 3. Create the Provider component
export const UIProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notification, setNotification] = useState(null); // { message: string, type: 'success' | 'error' | 'info' }

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const showNotification = (message, type = 'info', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const value = {
    isSidebarOpen,
    notification,
    toggleSidebar,
    showNotification,
    closeNotification,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
      {/* Global Notification Component (to be implemented) */}
      {notification && (
        <div className={`global-notification ${notification.type}`}>
          <p>{notification.message}</p>
          <button onClick={closeNotification}>&times;</button>
        </div>
      )}
    </UIContext.Provider>
  );
};
