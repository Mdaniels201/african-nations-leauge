import React from 'react';

const Notification = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  return (
    <div className={`notification ${type}`}>
      <div className="notification-content">
        {type === 'success' && '✅'}
        {type === 'error' && '❌'}
        {type === 'warning' && '⚠️'}
        {type === 'info' && 'ℹ️'}
        <span>{message}</span>
      </div>
      <button 
        onClick={onClose}
        className="notification-close"
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: 0,
          marginLeft: 'auto'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Notification;