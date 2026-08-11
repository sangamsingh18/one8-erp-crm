import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotifications, NotificationType } from '../../context/NotificationContext';

interface Props {
  message: string;
  type?: NotificationType;
  onClose: () => void;
}

const config: Record<NotificationType, { icon: React.ReactNode; bg: string; border: string; color: string; iconColor: string }> = {
  success: {
    icon: <CheckCircle size={18} />,
    bg: '#f0fdf4',
    border: '#bbf7d0',
    color: '#14532d',
    iconColor: '#16a34a',
  },
  error: {
    icon: <XCircle size={18} />,
    bg: '#fef2f2',
    border: '#fecaca',
    color: '#7f1d1d',
    iconColor: '#dc2626',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    bg: '#fffbeb',
    border: '#fde68a',
    color: '#78350f',
    iconColor: '#d97706',
  },
  info: {
    icon: <Info size={18} />,
    bg: '#eff6ff',
    border: '#bfdbfe',
    color: '#1e3a5f',
    iconColor: '#2563eb',
  },
};

const Toast = ({ message, type = 'success', onClose }: Props) => {
  const { addNotification } = useNotifications();
  const addedRef = useRef(false);

  useEffect(() => {
    if (!addedRef.current) {
      addNotification(message, type);
      addedRef.current = true;
    }
  }, [message, type, addNotification]);

  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  const cfg = config[type];

  const toastEl = (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `4px solid ${cfg.iconColor}`,
        borderRadius: '10px',
        padding: '14px 16px',
        minWidth: '300px',
        maxWidth: '420px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.08)',
        animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        color: cfg.color,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <span style={{ color: cfg.iconColor, flexShrink: 0, marginTop: '1px' }}>{cfg.icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{
          fontWeight: 600,
          fontSize: '13.5px',
          lineHeight: '1.4',
          color: cfg.color,
          margin: 0,
        }}>
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: cfg.iconColor,
          display: 'flex',
          alignItems: 'center',
          padding: '0',
          opacity: 0.6,
          flexShrink: 0,
          marginTop: '1px',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );

  return ReactDOM.createPortal(toastEl, document.body);
};

export default Toast;
