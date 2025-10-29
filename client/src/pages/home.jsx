import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Assuming a corresponding CSS file

const Home = () => {
  // NOTE: This component is a placeholder for the main application landing page.
  // The user previously mentioned creating a detailed index.html.
  // This component would typically contain the main marketing content, features, and CTAs.

  return (
    <div className="home-page-container">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Magazinify-AI: Turn Your Content into a Professional Magazine Instantly</h1>
          <p className="tagline">Leverage AI to automatically generate, design, and publish stunning digital magazines from your existing website content.</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-primary">Start Your Free Trial</Link>
            <Link to="/pricing" className="cta-secondary">View Pricing</Link>
          </div>
        </div>
      </header>

      <section className="features-section">
        <h2>Features Designed for Growth</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>AI Content Curation</h3>
            <p>Our AI analyzes your website, selects the best articles, and summarizes them into magazine-ready content.</p>
          </div>
          <div className="feature-card">
            <h3>One-Click Design</h3>
            <p>Choose from professional templates and let Magazinify-AI handle the layout, typography, and image placement.</p>
          </div>
          <div className="feature-card">
            <h3>Interactive Flipbooks</h3>
            <p>Generate stunning, embeddable flipbook viewers for your website and social media channels.</p>
          </div>
        </div>
      </section>

      <section className="testimonial-section">
        <h2>What Our Clients Say</h2>
        <blockquote>
          "Magazinify-AI cut our content production time by 80%. It's a game-changer for our quarterly reports!" - Jane Doe, CMO
        </blockquote>
      </section>

      <footer className="home-footer">
        <p>&copy; {new Date().getFullYear()} Magazinify-AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
