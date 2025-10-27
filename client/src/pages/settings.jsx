import React, { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Profile from '../components/settings/Profile'; // Assuming components/settings/
import Billing from '../components/settings/Billing';
import BrandAssets from '../components/settings/BrandAssets';
import './Settings.css'; // Assuming a corresponding CSS file

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  // Helper to get the current path segment for the active tab (simplified)
  const getActiveTab = () => {
    const path = window.location.pathname.split('/').pop();
    if (path === 'billing') return 'billing';
    if (path === 'brand-assets') return 'brand-assets';
    return 'profile';
  };

  return (
    <div className="settings-page-container">
      <header className="settings-main-header">
        <h1>Account Settings</h1>
        <p>Manage your account, subscription, and brand identity.</p>
      </header>

      <div className="settings-content-wrapper">
        <nav className="settings-sidebar">
          <Link
            to="profile"
            className={`sidebar-link ${getActiveTab() === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </Link>
          <Link
            to="billing"
            className={`sidebar-link ${getActiveTab() === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            Billing & Subscription
          </Link>
          <Link
            to="brand-assets"
            className={`sidebar-link ${getActiveTab() === 'brand-assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('brand-assets')}
          >
            Brand Assets
          </Link>
        </nav>

        <main className="settings-main-content">
          <Routes>
            {/* Redirect /settings to /settings/profile */}
            <Route path="/" element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="billing" element={<Billing />} />
            <Route path="brand-assets" element={<BrandAssets />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};
