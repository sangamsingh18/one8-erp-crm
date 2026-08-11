import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Users, Package, FileSpreadsheet, Activity, ShieldCheck } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-body">
      {/* Landing Navbar */}
      <header className="landing-nav">
        <Link to="/" className="landing-nav-logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>
          <img src="/logo.svg" alt="One8 CRM logo" style={{ height: '30px', width: '30px', marginRight: '8px', filter: 'drop-shadow(0 2px 4px rgba(79,70,229,0.25))' }} />
          One8 <span style={{ color: 'var(--primary)', fontWeight: 900, marginLeft: '3px' }}>CRM</span>
        </Link>
        <div className="landing-nav-links">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-secondary btn-sm">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Login
              </Link>
              <button onClick={handleGetStarted} className="btn btn-primary btn-sm">
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          ✨ Next-Generation CRM & ERP
        </div>
        <h1>Simplify Your Business.<br />Manage Everything in One Place.</h1>
        <p>
          Manage customers, products, inventory and sales through one simple CRM platform. Built for modern business teams.
        </p>
        <div className="landing-hero-actions">
          <button onClick={handleGetStarted} className="btn btn-primary">
            Get Started <ArrowRight size={16} />
          </button>
          {!user && (
            <Link to="/login" className="btn btn-secondary">
              Login to Account
            </Link>
          )}
        </div>
      </section>

      {/* Modern Dashboard Preview Mockup */}
      <div className="landing-preview-container">
        <div className="landing-preview-mockup">
          <div className="mockup-header">
            <span className="dot" style={{ backgroundColor: '#ef4444' }}></span>
            <span className="dot" style={{ backgroundColor: '#eab308' }}></span>
            <span className="dot" style={{ backgroundColor: '#22c55e' }}></span>
            <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '12px', fontWeight: 500 }}>one8-crm.app/dashboard</span>
          </div>
          <div className="mockup-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>One8 CRM Dashboard</h3>
              <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>Admin View</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>👥 Total Customers</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#4f46e5', marginTop: '4px' }}>124</div>
              </div>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>📦 Total Products</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>86</div>
              </div>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>🧾 Active Challans</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>245</div>
              </div>
            </div>

            <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>Recent Sales Activity</div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '8px', width: '90%' }}></div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '8px', width: '75%' }}></div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="landing-section">
        <div className="landing-section-title">
          <h2>Everything You Need to Manage Operations</h2>
          <p>Streamline your pipeline, stock, and distribution processes with One8 CRM.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
              <Users size={20} />
            </div>
            <h3>Customer Management</h3>
            <p>Keep customer profiles, notes, types (retail, wholesale, distributor), and statuses (lead, active, inactive) perfectly organized.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <Package size={20} />
            </div>
            <h3>Inventory Management</h3>
            <p>Track stock levels, product categories, minimum stock alerts, warehouse locations, and complete stock movement logs.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
              <FileSpreadsheet size={20} />
            </div>
            <h3>Sales & Challans</h3>
            <p>Create and edit sales challans with line items, automatically calculate price sums, and validate real-time stock levels.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card-icon" style={{ background: '#fdf2f8', color: '#db2777' }}>
              <Activity size={20} />
            </div>
            <h3>Business Operations</h3>
            <p>Role-based interface designed specifically for Admin, Sales, Warehouse, and Accounts teams to work concurrently.</p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="workflow-section">
        <div className="landing-section-title">
          <h2>Streamlined Business Workflow</h2>
          <p>A simple, structured lifecycle that powers your day-to-day work flows.</p>
        </div>
        <div className="workflow-container">
          <div className="workflow-step">
            <Users size={16} /> Customers
          </div>
          <span className="workflow-arrow">➔</span>
          <div className="workflow-step">
            <Package size={16} /> Products
          </div>
          <span className="workflow-arrow">➔</span>
          <div className="workflow-step">
            <FileSpreadsheet size={16} /> Sales
          </div>
          <span className="workflow-arrow">➔</span>
          <div className="workflow-step">
            <ShieldCheck size={16} /> Challans
          </div>
          <span className="workflow-arrow">➔</span>
          <div className="workflow-step">
            <Activity size={16} /> Operations
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to simplify your business?</h2>
        <p>Start using One8 CRM today. Get started for free and optimize your processes.</p>
        <button onClick={handleGetStarted} className="btn btn-primary">
          Get Started Now
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-brand">One8 CRM</div>
        <div className="landing-footer-desc">Smart CRM for modern business operations.</div>
        <div className="landing-footer-copy">© 2026 One8 CRM. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default Landing;
