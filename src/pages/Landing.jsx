// src/pages/Landing.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../landing.css'; 

export default function Landing() {
  return (
    <div>
      <nav>
        <div className="logo">Money<span>Sense</span></div>
        <div className="nav-buttons">
          <Link to="/login" className="btn-outline">Sign In</Link>
          <Link to="/login" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      <section className="hero">
        <h1>Your finances,<br/><span>brilliantly simple</span></h1>
        <p>All your accounts, budgets and goals in one elegant dashboard.</p>
        <div className="hero-buttons">
          <Link to="/login" className="btn-primary">Start for Free</Link>
        </div>
      </section>

      <section className="stats">
        <div><h2>50K+</h2><p>Active Users</p></div>
        <div><h2>$2.4B</h2><p>Tracked Assets</p></div>
        <div><h2>99.9%</h2><p>Uptime</p></div>
        <div><h2>4.9★</h2><p>App Rating</p></div>
      </section>

      <section className="features-section">
        <div className="features-header">
          <h2>Everything you need to <span>take control</span></h2>
        </div>
        
        <div className="features-grid">
          {/* Row 1 */}
          <div className="feature-card">
            <div className="icon-box">📊</div>
            <h3>Smart Analytics</h3>
            <p>AI-powered insights that decode your spending patterns and forecast your financial future.</p>
          </div>
          <div className="feature-card">
            <div className="icon-box">🛡️</div>
            <h3>Bank-Grade Security</h3>
            <p>256-bit encryption and multi-factor authentication keep your financial data locked down tight.</p>
          </div>
          <div className="feature-card">
            <div className="icon-box">⚡</div>
            <h3>Real-Time Sync</h3>
            <p>Instant transaction updates across all your accounts — no manual entry needed.</p>
          </div>

          {/* Row 2 */}
          <div className="feature-card">
            <div className="icon-box">📈</div>
            <h3>Budget Mastery</h3>
            <p>Set smart budgets that adapt to your lifestyle and alert you before you overspend.</p>
          </div>
          <div className="feature-card">
            <div className="icon-box">💳</div>
            <h3>Multi-Account</h3>
            <p>Connect checking, savings, credit cards, and investments in one unified view.</p>
          </div>
          <div className="feature-card">
            <div className="icon-box">🔔</div>
            <h3>Smart Alerts</h3>
            <p>Get notified about unusual spending, bill due dates, and savings opportunities.</p>
          </div>
        </div>
      </section>

      <footer>© 2026 MoneySense. All rights reserved.</footer>
    </div>
  );
}