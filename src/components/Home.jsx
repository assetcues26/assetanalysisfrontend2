import React from 'react';
import useAuditStore from '../store/useAuditStore';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import logo from '../assets/AssetCues-Logo 1.png';
import { Camera, Package, Activity, Clock, Wifi, WifiOff, Trash2, Play } from 'lucide-react';

const Home = () => {
  const { 
    startSession, recentSessions, pairs, deleteSession, viewSessionResults, 
    clearCurrentSession, setNotification, hideNotification 
  } = useAuditStore();
  const isOnline = useOnlineStatus();

  const totalAssets = recentSessions.reduce((acc, s) => acc + s.assetsCount, 0);
  const lastRun = recentSessions[0] ? new Date(recentSessions[0].date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Never';

  const handleResume = () => {
    useAuditStore.setState({ sessionState: 'CAPTURING' });
  };

  const handleDiscardClick = () => {
    setNotification({
      open: true,
      type: 'confirm',
      message: 'Discard this saved session and all captured images? This action cannot be undone.',
      onConfirm: () => {
        clearCurrentSession();
        hideNotification();
      }
    });
  };

  return (
    <div className="home-screen" style={{ paddingBottom: '60px' }}>
      <header style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1000, 
        padding: '16px 20px', 
        background: 'rgba(255, 255, 255, 0.75)', 
        backdropFilter: 'blur(15px)', 
        WebkitBackdropFilter: 'blur(15px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <img src={logo} alt="AssetCues" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ 
            background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
            color: isOnline ? '#10B981' : '#EF4444', 
            padding: '6px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: 800,
            display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid currentColor'
          }}>
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isOnline ? 'LIVE CONNECTED' : 'OFFLINE MODE'}
          </div>
        </div>
      </header>

      <section className="hero" style={{ 
        background: 'var(--navy)', 
        padding: '120px 24px 100px', 
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Background Glow */}
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(45, 125, 210, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <h2 className="display-text" style={{ fontSize: '40px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.1 }}>
          Technical Asset<br /><span style={{ color: 'var(--electric)' }}>Audit Pipeline</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', fontWeight: 500 }}>AI-Powered Verification & Inventory Management</p>
      </section>

      <div className="content" style={{ padding: '0 20px', marginTop: '-40px', maxWidth: '600px', margin: '-40px auto 0', position: 'relative', zIndex: 10 }}>
        <div className="card" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1.2fr', 
          padding: '20px',
          marginBottom: '24px',
          background: 'var(--white)',
          border: '1px solid var(--border)',
          alignItems: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div className="stat-item" style={{ textAlign: 'center' }}>
            <label style={{ fontSize: '9px', color: 'var(--slate)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Audit</label>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--navy)', lineHeight: 1 }}>{recentSessions.length}</span>
          </div>
          <div className="stat-item" style={{ borderLeft: '1px solid var(--border)', textAlign: 'center' }}>
            <label style={{ fontSize: '9px', color: 'var(--slate)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Assets</label>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--navy)', lineHeight: 1 }}>{totalAssets}</span>
          </div>
          <div className="stat-item" style={{ borderLeft: '1px solid var(--border)', textAlign: 'center' }}>
            <label style={{ fontSize: '9px', color: 'var(--slate)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Last Run</label>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)', lineHeight: 1.2, display: 'block', padding: '0 8px' }}>{lastRun}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
          {pairs.length > 0 && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn-primary hover-card" 
                onClick={handleResume}
                style={{ 
                  flex: 1, height: '64px', background: 'var(--success)', fontSize: '15px'
                }}
              >
                <Play size={20} />
                RESUME ACTIVE SESSION ({pairs.length})
              </button>
              <button 
                onClick={handleDiscardClick}
                className="hover-card"
                style={{ 
                  width: '64px', height: '64px', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)',
                  background: 'var(--danger-bg)', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <Trash2 size={24} />
              </button>
            </div>
          )}
          <button 
            className="btn-primary hover-card" 
            onClick={startSession}
            style={{ height: '64px', fontSize: '16px' }}
          >
            <Camera size={22} />
            INITIALIZE NEW SCAN
          </button>
        </div>

        <div className="recent-sessions">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy)' }}>Audit History</h3>
            <span style={{ fontSize: '12px', color: 'var(--electric)', fontWeight: 700, cursor: 'pointer' }}>BROWSE ALL</span>
          </div>

          <div className="session-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentSessions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(0,0,0,0.02)', borderStyle: 'dashed' }}>
                <Activity size={40} style={{ margin: '0 auto 16px', opacity: 0.1 }} />
                <p style={{ fontSize: '14px', color: 'var(--slate)', fontWeight: 500 }}>Ready for initial sequence</p>
              </div>
            ) : (
              recentSessions.map((session) => (
                <div key={session.id} className="card hover-card" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '20px',
                  background: 'var(--white)',
                  cursor: 'pointer'
                }}>
                  <div onClick={() => viewSessionResults(session)} style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)' }}>ID_{session.id.slice(0, 8).toUpperCase()}</span>
                      <span className={`badge ${session.status === 'Complete' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '9px' }}>
                        {session.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--slate)', fontSize: '12px', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={14} /> {session.assetsCount} Units</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                    style={{ background: 'none', border: 'none', color: 'var(--border)', padding: '10px', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--border)'}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .hover-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(10, 22, 40, 0.1) !important;
          border-color: var(--electric) !important;
        }
      `}} />
    </div>
  );
};

export default Home;
