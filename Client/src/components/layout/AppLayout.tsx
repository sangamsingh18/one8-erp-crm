import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AboutModal from '../common/AboutModal';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Overlay background for mobile sidebar drawer */}
      {mobileOpen && (
        <div 
          className="mobile-nav-overlay" 
          onClick={() => setMobileOpen(false)}
          style={{ zIndex: 95 }}
        />
      )}

      {/* Sidebar navigation */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
      />

      <div className="main-wrapper">
        {/* Topbar header */}
        <Navbar 
          mobileSidebarOpen={mobileOpen}
          onToggleMobileSidebar={() => setMobileOpen(prev => !prev)}
        />

        {/* Main Content Page */}
        <main className="main-content">
          {children}
        </main>
      </div>

      <button
        className="about-fab"
        onClick={() => setAboutOpen(true)}
        aria-label="About One8 CRM"
        title="About One8 CRM"
      >
        <span>About</span>
      </button>

      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
};

export default AppLayout;
