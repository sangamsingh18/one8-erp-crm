import React from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  loading?: boolean;
  confirmVariant?: 'danger' | 'primary' | 'success';
  onClose: () => void;
  onConfirm: () => void;
}

const config = {
  danger: {
    bg: '#FBEAEA',
    color: '#C94C4C',
    btnBg: '#C94C4C',
    btnHover: '#A13D3D',
    icon: <AlertTriangle size={20} />,
  },
  primary: {
    bg: '#E8EEF5',
    color: '#1E3A5F',
    btnBg: '#1E3A5F',
    btnHover: '#16324F',
    icon: <HelpCircle size={20} />,
  },
  success: {
    bg: '#E7F4EC',
    color: '#2E7D5B',
    btnBg: '#2E7D5B',
    btnHover: '#235F45',
    icon: <CheckCircle size={20} />,
  },
};

const DeleteModal = ({ 
  isOpen, 
  title, 
  message, 
  confirmLabel, 
  loading = false, 
  confirmVariant = 'danger',
  onClose, 
  onConfirm 
}: Props) => {
  if (!isOpen) return null;

  const cfg = config[confirmVariant];

  const modalEl = (
    <>
      <div 
        className="modal-overlay" 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(1px)',
          zIndex: 99990,
        }}
      />
      <div 
        className="delete-modal-card"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '440px',
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          zIndex: 99991,
          fontFamily: 'Inter, sans-serif',
          animation: 'modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div 
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: cfg.bg,
              color: cfg.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {cfg.icon}
          </div>
          <div>
            <h3 
              style={{ 
                margin: '0 0 8px', 
                fontSize: '16px', 
                fontWeight: 700, 
                color: '#1F2937' 
              }}
            >
              {title}
            </h3>
            <p 
              style={{ 
                margin: 0, 
                fontSize: '13.5px', 
                lineHeight: '1.5', 
                color: '#6B7280' 
              }}
            >
              {message}
            </p>
          </div>
        </div>

        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px', 
            borderTop: '1px solid #E5E7EB',
            paddingTop: '16px' 
          }}
        >
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
            style={{
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              color: '#374151',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer',
              height: '38px',
            }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            disabled={loading}
            style={{
              background: cfg.btnBg,
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = cfg.btnHover;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = cfg.btnBg;
            }}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(modalEl, document.body);
};

export default DeleteModal;
