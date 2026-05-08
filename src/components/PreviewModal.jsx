import React from 'react';
import useAuditStore from '../store/useAuditStore';
import { X, Check } from 'lucide-react';

const PreviewModal = () => {
  const { tempImage, currentStep, retakeImage, confirmImage } = useAuditStore();

  if (!tempImage) return null;

  return (
    <div className="preview-overlay" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
      backgroundColor: 'rgba(10, 22, 40, 0.8)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end'
    }}>
      <div className="preview-modal" style={{
        backgroundColor: 'var(--white)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '24px',
        animation: 'slideUp 0.3s ease-out',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="font-syne" style={{ fontSize: '18px' }}>Confirm Capture</h3>
          <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-3)' }}>
            STEP: {currentStep}
          </span>
        </div>

        <div style={{ 
          width: '100%', 
          aspectRatio: '3/4', 
          backgroundColor: 'var(--navy)', 
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img src={tempImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button 
            onClick={retakeImage}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--white)',
              color: 'var(--text-1)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <X size={18} />
            DISCARD
          </button>
          <button 
            onClick={confirmImage}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'var(--electric)',
              color: 'var(--white)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Check size={18} />
            CONFIRM
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default PreviewModal;
