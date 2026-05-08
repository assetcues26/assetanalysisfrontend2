import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const NotificationModal = ({ isOpen, message, onClose, onConfirm, type = 'info' }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 22, 40, 0.8)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center',
        position: 'relative',
        animation: 'modalFadeIn 0.3s ease-out'
      }}>
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '50%', background: type === 'confirm' ? 'var(--danger-bg)' : 'var(--warning-bg)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
        }}>
          <AlertCircle size={32} color={type === 'confirm' ? 'var(--danger)' : 'var(--warning)'} />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'var(--navy)', fontFamily: 'Sora' }}>
          {type === 'confirm' ? 'Are you sure?' : 'System Notification'}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: '1.6', marginBottom: '32px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          {type === 'confirm' && (
            <button 
              className="btn-secondary" 
              onClick={onClose}
              style={{ flex: 1, height: '56px' }}
            >
              CANCEL
            </button>
          )}
          <button 
            className="btn-primary" 
            onClick={type === 'confirm' ? onConfirm : onClose}
            style={{ 
              flex: 1, 
              height: '56px',
              background: type === 'confirm' ? 'var(--danger)' : 'var(--electric)',
              border: 'none'
            }}
          >
            {type === 'confirm' ? 'DISCARD' : 'UNDERSTOOD'}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
};

export default NotificationModal;
