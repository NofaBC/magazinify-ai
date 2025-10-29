import React from 'react';
import { Link } from 'react-router-dom';
import './Pricing.css'; // Assuming a corresponding CSS file

const pricingPlans = [
  {
    name: 'Starter',
    price: 29,
    features: [
      '1 Magazine per month',
      'Basic AI Content Curation',
      'Standard Templates',
      'PDF Download',
      'Email Support',
    ],
    isPopular: false,
  },
  {
    name: 'Pro',
    price: 99,
    features: [
      '10 Magazines per month',
      'Advanced AI Curation & Editing',
      'Premium Templates',
      'Interactive Flipbook Viewer',
      'Priority Support',
      'Brand Asset Management',
    ],
    isPopular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Unlimited Magazines',
      'Dedicated Content Team',
      'Custom Design & Integration',
      'Advanced Analytics & Reporting',
      'SLA & 24/7 Support',
      'Multi-Tenant Management',
    ],
    isPopular: false,
  },
];

const Pricing = () => {
  return (
    <div className="pricing-page-container">
      <header className="pricing-header">
        <h1>Simple, Transparent Pricing</h1>
        <p>Choose the plan that fits your content and publishing needs. No hidden fees, cancel anytime.</p>
      </header>

      <section className="pricing-plans-grid">
        {pricingPlans.map((plan) => (
          <div key={plan.name} className={`pricing-card ${plan.isPopular ? 'popular' : ''}`}>
            {plan.isPopular && <div className="popular-badge">Most Popular</div>}
            <h2>{plan.name}</h2>
            <div className="price-section">
              {plan.price === 'Custom' ? (
                <span className="price-custom">Contact Us</span>
              ) : (
                <>
                  <span className="price-currency">$</span>
                  <span className="price-value">{plan.price}</span>
                  <span className="price-period">/month</span>
                </>
              )}
            </div>
            <ul className="features-list">
              {plan.features.map((feature, index) => (
                <li key={index}>✓ {feature}</li>
              ))}
            </ul>
            <Link to="/register" className="plan-cta-button">
              {plan.price === 'Custom' ? 'Get a Quote' : 'Start Free Trial'}
            </Link>
          </div>
        ))}
      </section>

      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-item">
          <h3>Can I change my plan later?</h3>
          <p>Yes, you can upgrade or downgrade your plan at any time from your billing settings page. Changes take effect immediately or at the start of your next billing cycle, depending on the change.</p>
        </div>
        <div className="faq-item">
          <h3>Is there a free trial?</h3>
          <p>We offer a 14-day free trial on our Starter and Pro plans, which includes full access to all features of the selected plan. No credit card required to start.</p>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
