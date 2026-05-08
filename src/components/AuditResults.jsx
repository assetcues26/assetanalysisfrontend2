import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAuditStore from '../store/useAuditStore';
import ResultCard from './ResultCard';
import { ChevronLeft, Filter, CheckCircle2, AlertTriangle } from 'lucide-react';

const AuditResults = () => {
  const { results, reset } = useAuditStore();
  const [activeTab, setActiveTab] = useState('ALL');

  const matchedCount = results.filter(r => r.vlm_result.match_successful && !r.vlm_result.is_swapped).length;
  const flaggedCount = results.filter(r => r.vlm_result.is_swapped || !r.vlm_result.match_successful).length;

  const filteredResults = results.filter(res => {
    if (activeTab === 'MATCHED') return res.vlm_result.match_successful && !res.vlm_result.is_swapped;
    if (activeTab === 'FLAGGED') return res.vlm_result.is_swapped || !res.vlm_result.match_successful;
    return true;
  });

  return (
    <div className="results-screen" style={{ backgroundColor: 'var(--off-white)', minHeight: '100vh', paddingBottom: '40px' }}>
      <header className="header-navy" style={{ padding: '24px 20px', flexDirection: 'column', alignItems: 'flex-start', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={reset} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={20} />
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Audit Results</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="badge" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'none', padding: '6px 14px' }}>
            <CheckCircle2 size={12} /> {matchedCount} Verified
          </div>
          <div className="badge" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'none', padding: '6px 14px' }}>
            <AlertTriangle size={12} /> {flaggedCount} Flagged
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'white', padding: '0 20px' }}>
        {['ALL', 'MATCHED', 'FLAGGED'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              flex: 1, padding: '18px 0', border: 'none', background: 'none',
              fontSize: '12px', fontWeight: 700, color: activeTab === tab ? 'var(--electric)' : 'var(--slate)',
              borderBottom: activeTab === tab ? '3px solid var(--electric)' : '3px solid transparent',
              transition: 'all 0.2s',
              fontFamily: 'Sora'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="results-list" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        {filteredResults.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(0,0,0,0.02)', borderStyle: 'dashed' }}>
            <Filter size={48} style={{ margin: '0 auto 16px', opacity: 0.1 }} />
            <p style={{ color: 'var(--slate)', fontWeight: 500 }}>No results in this category</p>
          </div>
        ) : (
          filteredResults.map((res, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <ResultCard result={res} />
            </motion.div>
          ))
        )}
      </div>

      <div style={{ padding: '0 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <button className="btn-primary" onClick={reset} style={{ height: '60px', width: '100%', fontSize: '15px' }}>
          INITIALIZE NEW AUDIT SEQUENCE
        </button>
      </div>
    </div>
  );
};

export default AuditResults;
