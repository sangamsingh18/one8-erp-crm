import React, { useEffect } from 'react';

interface Props {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

const Toast = ({ message, type = 'success', onClose }: Props) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      {message}
      <button onClick={onClose}>×</button>
    </div>
  );
};

export default Toast;
