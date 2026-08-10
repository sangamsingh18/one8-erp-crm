import React from 'react';

interface Props {
  status: string;
}

const colorMap: Record<string, string> = {
  lead: '#f59e0b',
  active: '#10b981',
  inactive: '#6b7280',
  draft: '#3b82f6',
  confirmed: '#10b981',
  cancelled: '#ef4444',
  IN: '#10b981',
  OUT: '#ef4444',
  retail: '#8b5cf6',
  wholesale: '#3b82f6',
  distributor: '#f59e0b',
};

const StatusBadge = ({ status }: Props) => (
  <span style={{
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    background: colorMap[status] ?? '#6b7280',
    color: '#fff',
    textTransform: 'capitalize',
  }}>
    {status}
  </span>
);

export default StatusBadge;
