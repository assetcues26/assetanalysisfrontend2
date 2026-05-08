import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, Cpu } from 'lucide-react';

const Processing = () => {
  const [step, setStep] = useState(0);
  const pipeline = [
    "Uploading images",
    "YOLO Object Detection",
    "Gemini VLM Analysis",
    "Result Generation"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev < pipeline.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="processing-screen" style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px',
      backgroundColor: 'var(--off-white)',
      color: 'var(--navy)',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Glow */}
      <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(45, 125, 210, 0.05) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />

      <div className="scanner-container" style={{ 
        position: 'relative', 
        width: '200px', 
        height: '200px', 
        border: '1px solid var(--border)',
        borderRadius: '24px',
        background: 'white',
        overflow: 'hidden',
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Holographic Scanner Line */}
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ 
            position: 'absolute', 
            left: 0, 
            right: 0, 
            height: '2px', 
            background: 'var(--electric)',
            boxShadow: '0 0 15px var(--electric), 0 0 30px var(--electric)',
            zIndex: 10
          }}
        />
        
        {/* Interior Grid Effect */}
        <div style={{ 
          position: 'absolute', inset: 0, 
          backgroundImage: 'linear-gradient(rgba(45, 125, 210, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 125, 210, 0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />

        <Cpu size={60} color="var(--electric)" style={{ opacity: 0.3 }} />
      </div>

      <h2 className="display-text" style={{ fontSize: '22px', fontWeight: 700, marginBottom: '48px', color: 'var(--navy)', letterSpacing: '0.05em' }}>
        AI PROCESSING...
      </h2>

      <div className="pipeline" style={{ width: '100%', maxWidth: '240px' }}>
        {pipeline.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '16px',
            opacity: index <= step ? 1 : 0.3,
            transition: 'opacity 0.3s'
          }}>
            {index < step ? (
              <Check size={16} color="var(--success)" />
            ) : index === step ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ width: '16px', height: '16px', border: '2px solid var(--electric)', borderTopColor: 'transparent', borderRadius: '50%' }}
              />
            ) : (
              <Circle size={16} color="var(--border)" />
            )}
            <span className="display-text" style={{ fontSize: '13px', fontWeight: 600, color: index <= step ? 'var(--navy)' : 'var(--slate)' }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Processing;
