import React, { useState } from 'react';
import './Billing.css'; // Assuming a corresponding CSS file

const mockSubscription = {
  plan: 'Pro Monthly',
  price: 99.99,
  currency: 'USD',
  nextBillingDate: '2025-11-26',
  paymentMethod: 'Visa ending in 4242',
  status: 'Active',
};

const mockInvoices = [
  { id: 1, date: '2025-10-26', amount: 99.99, status: 'Paid', downloadLink: '#' },
  { id: 2, date: '2025-09-26', amount: 99.99, status: 'Paid', downloadLink: '#' },
  { id: 3, date: '2025-08-26', amount: 99.99, status: 'Paid', downloadLink: '#' },
];

const Billing = () => {
  const [subscription, setSubscription] = useState(mockSubscription);
  const [invoices, setInvoices] = useState(mockInvoices);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? This will take effect on your next billing date.')) {
      // In a real app, this would be an API call to cancel the subscription
      setSubscription(prev => ({ ...prev, status: 'Canceled (Pending)', plan: 'Free' }));
      alert('Subscription cancellation initiated.');
    }
  };

  const handleUpdatePayment = () => {
    // In a real app, this would redirect to a Stripe/payment provider portal
    alert('Redirecting to secure payment portal to update card details. (Simulated)');
  };

  const handleDownloadInvoice = (id) => {
    // In a real app, this would trigger an API call to download the PDF
    console.log(`Downloading invoice ${id}`);
    alert(`Invoice ${id} download initiated. (Simulated)`);
  };

  return (
    <div className="billing-settings-container">
      <header className="settings-header">
        <h1>Billing & Subscription</h1>
        <p>Manage your plan, payment method, and view past invoices.</p>
      </header>

      <section className="subscription-status-card">
        <h2>Current Subscription</h2>
        <div className="subscription-details">
          <div className="detail-item">
            <strong>Plan:</strong>
            <span className="plan-name">{subscription.plan}</span>
          </div>
          <div className="detail-item">
            <strong>Status:</strong>
            <span className={`status-badge ${subscription.status.toLowerCase().includes('active') ? 'active' : 'inactive'}`}>
              {subscription.status}
            </span>
          </div>
          <div className="detail-item">
            <strong>Price:</strong>
            <span>{subscription.currency} {subscription.price.toFixed(2)} / month</span>
          </div>
          <div className="detail-item">
            <strong>Next Billing:</strong>
            <span>{subscription.nextBillingDate}</span>
          </div>
          <div className="detail-item">
            <strong>Payment Method:</strong>
            <span>{subscription.paymentMethod}</span>
          </div>
        </div>

        <div className="subscription-actions">
          <button className="action-button primary" onClick={() => setIsChangingPlan(true)}>Change Plan</button>
          <button className="action-button secondary" onClick={handleUpdatePayment}>Update Payment Info</button>
          <button className="action-button danger" onClick={handleCancelSubscription}>Cancel Subscription</button>
        </div>
      </section>

      {isChangingPlan && (
        <section className="plan-change-form">
          {/* Simplified plan change UI - in a real app this would be more complex */}
          <h3>Select a New Plan</h3>
          <p>This is a placeholder for a plan selection component.</p>
          <button className="action-button primary" onClick={() => setIsChangingPlan(false)}>Close Plan Selector</button>
        </section>
      )}

      <section className="invoice-history-card">
        <h2>Invoice History</h2>
        <table>
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id}>
                <td>#{invoice.id}</td>
                <td>{invoice.date}</td>
                <td>{subscription.currency} {invoice.amount.toFixed(2)}</td>
                <td><span className={`status-badge ${invoice.status.toLowerCase()}`}>{invoice.status}</span></td>
                <td>
                  <button className="download-button" onClick={() => handleDownloadInvoice(invoice.id)}>Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
