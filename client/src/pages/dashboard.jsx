import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTenant } from '../hooks/useTenant';
import { useAnalytics } from '../hooks/useAnalytics';
import MagazineList from '../components/dashboard/MagazineList'; // Assuming MagazineList is in components/dashboard
import './Dashboard.css'; // Assuming a corresponding CSS file

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView('Dashboard');
  }, [trackPageView]);

  if (tenantLoading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome back, {tenant?.name || currentUser?.email}!</h1>
        <div className="status-widgets">
          <div className="widget">
            <h3>Plan</h3>
            <p className="widget-value">{tenant?.subscriptionPlan || 'Free'}</p>
          </div>
          <div className="widget">
            <h3>Magazines Used</h3>
            <p className="widget-value">{tenant?.magazinesCreated || 0} / {tenant?.magazineQuota || '∞'}</p>
          </div>
          <div className="widget">
            <h3>Next Billing</h3>
            <p className="widget-value">2025-11-26</p>
          </div>
        </div>
      </header>

      <section className="magazine-list-section">
        <MagazineList />
      </section>

      <section className="quick-actions-section">
        <h2>Quick Actions</h2>
        {/* Placeholder for quick action buttons */}
        <div className="action-buttons">
          <button className="action-button primary">Create New Magazine</button>
          <button className="action-button secondary">View Analytics Reports</button>
          <button className="action-button tertiary">Manage Brand Assets</button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
