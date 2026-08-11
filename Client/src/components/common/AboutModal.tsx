import React from 'react';
import { Package, Zap, Shield, Users, Globe } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="about-overlay" onClick={onClose} />
      <div className="about-card">
        {/* Header */}
        <div className="about-header">
          <div className="about-logo">
            <Package size={22} />
          </div>
          <div>
            <h3 className="about-title">One8 CRM</h3>
            <p className="about-version">Version 1.0.0 · Enterprise Edition</p>
          </div>
        </div>

        <p className="about-desc">
          A full-featured Mini ERP + CRM operations portal designed for sales teams,
          warehouse managers, and business owners to manage customers, track inventory,
          and process sales challans — all in one place.
        </p>

        <div className="about-features">
          <div className="about-feature">
            <Users size={14} />
            <span>Customer & Lead Management</span>
          </div>
          <div className="about-feature">
            <Package size={14} />
            <span>Inventory & Stock Control</span>
          </div>
          <div className="about-feature">
            <Zap size={14} />
            <span>Sales Challan Processing</span>
          </div>
          <div className="about-feature">
            <Shield size={14} />
            <span>Role-Based Access Control</span>
          </div>
          <div className="about-feature">
            <Globe size={14} />
            <span>Cloud-Synced via Supabase</span>
          </div>
        </div>

        <div className="about-footer">
          <span>Designed & Developed by Sangam Singh</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
};

export default AboutModal;
