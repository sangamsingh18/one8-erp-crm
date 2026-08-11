import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  dividerBefore?: boolean;
}

interface Props {
  items: ActionMenuItem[];
  /** Stop row click from triggering when the ⋮ is clicked */
  stopPropagation?: boolean;
}

const ActionMenu = ({ items, stopPropagation = true }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className="action-menu-wrapper"
      ref={ref}
      onClick={e => { if (stopPropagation) e.stopPropagation(); }}
    >
      <button
        className={`action-menu-trigger${open ? ' open' : ''}`}
        onClick={e => { e.stopPropagation(); setOpen(prev => !prev); }}
        aria-label="Actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="action-menu-dropdown">
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              {item.dividerBefore && <div className="action-menu-divider" />}
              <button
                className={`action-menu-item${item.variant === 'danger' ? ' danger' : ''}${item.disabled ? ' disabled' : ''}`}
                onClick={e => {
                  e.stopPropagation();
                  if (!item.disabled) { item.onClick(); setOpen(false); }
                }}
                disabled={item.disabled}
              >
                <span className="action-menu-icon">{item.icon}</span>
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
