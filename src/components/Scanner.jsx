import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import useAuditStore from '../store/useAuditStore';
import useCamera from '../hooks/useCamera';
import PreviewModal from './PreviewModal';
import NotificationModal from './NotificationModal';
import { ChevronLeft, Camera, Upload, Check, WifiOff } from 'lucide-react';

const Scanner = () => {
  const { 
    sessionState, currentStep, pairs, currentPairIndex,
    captureImage, skipBarcode, submitSession, pauseSession, setNotification 
  } = useAuditStore();
  
  const handleFinish = async () => {
    await submitSession();
  };
  
  const { webcamRef, capture } = useCamera();
  const [mode, setMode] = useState('CAMERA'); // 'CAMERA' or 'UPLOAD'
  const fileInputRef = useRef(null);

  const handleCapture = () => {
    const img = capture();
    if (img) captureImage(img);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => captureImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="scanner-screen" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--navy)' }}>
      {/* Sub-header */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '20px', color: 'white', background: 'rgba(0,0,0,0.2)' }}>
        <button onClick={pauseSession} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Asset Scanner</h2>
          <div className="font-mono" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
            SEQUENCE_{String(currentPairIndex + 1).padStart(2, '0')}
          </div>
        </div>
        {pairs.length > 0 && currentStep === 'ASSET' && (
          <button 
            onClick={handleFinish}
            className="finish-btn-glow btn-primary"
            style={{ 
              height: '40px', padding: '0 20px', borderRadius: '12px', fontSize: '13px'
            }}
          >
            FINISH AUDIT
          </button>
        )}
      </div>

      {/* Step Indicator Strip */}
      <div style={{ display: 'flex', padding: '0 20px 24px', gap: '12px', background: 'rgba(0,0,0,0.2)' }}>
        <StepIndicator label="OBJECT" isActive={currentStep === 'ASSET'} isComplete={currentStep === 'BARCODE'} />
        <StepIndicator label="BARCODE" isActive={currentStep === 'BARCODE'} isComplete={false} />
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '14px', display: 'flex', gap: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <ModeButton active={mode === 'CAMERA'} onClick={() => setMode('CAMERA')} icon={<Camera size={16} />} label="CAMERA" />
          <ModeButton active={mode === 'UPLOAD'} onClick={() => setMode('UPLOAD')} icon={<Upload size={16} />} label="UPLOAD" />
        </div>
      </div>

      {/* Viewport */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', margin: '0 20px 20px', borderRadius: '24px', background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Step Guidance Overlay */}
        <div style={{ position: 'absolute', top: '24px', left: '0', right: '0', zIndex: 10, display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            background: 'rgba(10, 22, 40, 0.7)', backdropFilter: 'blur(12px)', padding: '10px 20px', borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--electric)', boxShadow: '0 0 10px var(--electric)' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>
              CAPTURE {currentStep === 'ASSET' ? 'ASSET OBJECT' : 'ASSET BARCODE'}
            </span>
          </div>
        </div>

        {mode === 'CAMERA' ? (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/webp"
            videoConstraints={{ facingMode: 'environment', aspectRatio: 16/9 }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div 
            onClick={() => fileInputRef.current.click()}
            style={{ 
              height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              color: 'white', cursor: 'pointer', background: 'linear-gradient(180deg, #111 0%, #000 100%)' 
            }}
          >
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(255,255,255,0.05)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Upload size={32} color="var(--electric)" />
            </div>
            <p style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Sora' }}>Select Image File</p>
            <p style={{ fontSize: '13px', opacity: 0.5, marginTop: '8px' }}>Tap to browse internal storage</p>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
          </div>
        )}

        {/* Capture Button Overlay */}
        {mode === 'CAMERA' && (
          <div style={{ position: 'absolute', bottom: '30px', left: '0', right: '0', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={handleCapture}
              style={{ 
                width: '84px', height: '84px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '0',
                boxShadow: '0 0 30px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Camera size={24} color="var(--navy)" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Image Buffer Bar */}
      {pairs.length > 0 && (
        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '16px 20px', 
          display: 'flex', 
          gap: '12px', 
          overflowX: 'auto',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          {pairs.map((pair, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              gap: '6px',
              padding: '6px',
              borderRadius: '14px',
              background: idx === currentPairIndex ? 'rgba(45, 125, 210, 0.2)' : 'transparent',
              border: idx === currentPairIndex ? '1px solid var(--electric)' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s'
            }}>
              <BufferThumb src={pair.asset} label="OBJ" />
              <BufferThumb src={pair.barcode} isSkipped={pair.barcode_skipped} label="BAR" />
            </div>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div style={{ padding: '24px 20px', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
        {currentStep === 'BARCODE' && (
          <button 
            className="btn-secondary" 
            onClick={skipBarcode}
            style={{ 
              width: '100%', maxWidth: '300px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', height: '56px'
            }}
          >
            SKIP BARCODE CAPTURE
          </button>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .finish-btn-glow {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
          animation: pulse-glow 2s infinite;
        }
        .finish-btn-glow::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
          transform: scale(0);
          transition: transform 0.6s ease-out;
          pointer-events: none;
          z-index: -1;
        }
        .finish-btn-glow:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 10px 30px rgba(45, 125, 210, 0.6) !important;
          background-color: var(--electric-lt) !important;
        }
        .finish-btn-glow:hover::before {
          transform: scale(1);
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 10px rgba(45, 125, 210, 0.4); }
          50% { box-shadow: 0 0 25px rgba(45, 125, 210, 0.7); }
          100% { box-shadow: 0 0 10px rgba(45, 125, 210, 0.4); }
        }
      `}} />

      {sessionState === 'PREVIEW' && <PreviewModal />}
    </div>
  );
};

const StepIndicator = ({ label, isActive, isComplete }) => (
  <div style={{ 
    flex: 1, height: '4px', borderRadius: '100px', 
    background: isComplete ? 'var(--success)' : isActive ? 'var(--electric)' : 'rgba(255,255,255,0.1)',
    position: 'relative'
  }}>
    <span style={{ 
      position: 'absolute', top: '10px', left: '0', fontSize: '10px', fontWeight: 800, 
      color: isComplete ? 'var(--success)' : isActive ? 'white' : 'rgba(255,255,255,0.3)',
      letterSpacing: '0.05em'
    }}>{label}</span>
  </div>
);

const ModeButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    style={{ 
      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px',
      border: 'none', background: active ? 'rgba(255,255,255,0.1)' : 'transparent', color: 'white',
      cursor: 'pointer', fontSize: '12px', fontWeight: 700, transition: 'all 0.2s'
    }}
  >
    {icon} {label}
  </button>
);

const BufferThumb = ({ src, label, isSkipped }) => (
  <div style={{ position: 'relative', width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
    {src ? (
      <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : isSkipped ? (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}><WifiOff size={16} color="white" /></div>
    ) : (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2, fontSize: '10px', fontWeight: 800, color: 'white' }}>{label}</div>
    )}
  </div>
);

export default Scanner;
