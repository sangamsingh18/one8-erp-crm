import React from 'react';

interface Props {
  status: string;
}

interface BadgeStyle {
  bg: string;
  color: string;
}

const styleMap: Record<string, BadgeStyle> = {
  lead: { bg: '#fef3c7', color: '#d97706' },
  active: { bg: '#d1fae5', color: '#059669' },
  inactive: { bg: '#f3f4f6', color: '#4b5563' },
  draft: { bg: '#dbeafe', color: '#2563eb' },
  confirmed: { bg: '#d1fae5', color: '#059669' },
  cancelled: { bg: '#fee2e2', color: '#dc2626' },
  IN: { bg: '#d1fae5', color: '#059669' },
  OUT: { bg: '#fee2e2', color: '#dc2626' },
  retail: { bg: '#f3e8ff', color: '#7c3aed' },
  wholesale: { bg: '#dbeafe', color: '#2563eb' },
  distributor: { bg: '#ffedd5', color: '#ea580c' },
};

const StatusBadge = ({ status }: Props) => {
  const badgeStyle = styleMap[status] ?? { bg: '#f3f4f6', color: '#4b5563' };
  
  return (
    <span style={{
      display: 'inline-inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: 600,
      background: badgeStyle.bg,
      color: badgeStyle.color,
      textTransform: 'capitalize',
      letterSpacing: '0.01em',
    }}>
      {status}
    </span>
  );
};

export default StatusBadge;
