import React from 'react';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { UIProvider } from './contexts/UIContext';
import './App.css'; // Main application styles

const App = () => {
  return (
    // Wrap the entire application with all necessary Context Providers
    <UIProvider>
      <AuthProvider>
        {/* TenantProvider depends on AuthProvider (to get the user ID) */}
        <TenantProvider>
          <div className="app-main-layout">
            {/* Placeholder for a global navigation bar/sidebar */}
            <header className="global-header">
              {/* Navigation components will go here */}
              <nav>
                {/* Links to Home, Pricing, Login/Logout */}
              </nav>
            </header>

            <main className="app-content-area">
              <AppRoutes />
            </main>

            <footer className="global-footer">
              {/* Footer content */}
            </footer>
          </div>
        </TenantProvider>
      </AuthProvider>
    </UIProvider>
  );
};

export default App;
