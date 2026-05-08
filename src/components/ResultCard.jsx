import React from 'react';
import { Package, Fingerprint, MapPin, AlertCircle, CheckCircle2, Info } from 'lucide-react';

const ResultCard = ({ result, index }) => {
  const { vlm_result, yolo_bbox, asset_image, barcode_image } = result;
  const { asset_details, barcode_details, mapping_confidence, match_successful, is_swapped } = vlm_result;

  const confidencePercent = Math.round((mapping_confidence || 0) * 100);

  return (
    <div className="card fade-in" style={{ marginBottom: '20px', border: '1px solid var(--border)' }}>
      {/* Media Strip */}
      {(asset_image || barcode_image) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px', background: 'var(--off-white)' }}>
          <div style={{ position: 'relative', height: '140px', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--navy)' }}>
            {asset_image ? (
              <img src={asset_image} alt="Asset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}><Package size={24} color="white" /></div>}
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', color: 'white', fontSize: '10px', fontWeight: 600 }}>OBJECT</div>
          </div>
          <div style={{ position: 'relative', height: '140px', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--navy)' }}>
            {barcode_image ? (
              <img src={barcode_image} alt="Barcode" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}><Fingerprint size={24} color="white" /></div>}
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', color: 'white', fontSize: '10px', fontWeight: 600 }}>BARCODE</div>
          </div>
        </div>
      )}

      {/* Two Column Grid */}
      <div style={{ position: 'relative' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 1fr', 
          gap: '24px', 
          padding: '24px',
          borderTop: '1px solid var(--border)'
        }}>
        {/* Left Column: Asset Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SectionHeader icon={<Package size={14} color="var(--electric)" />} title="Asset Details" />
          
          <DataPoint label="Object Name" value={asset_details.name} isBold />
          <DataPoint label="Description" value={asset_details.description} />
          
          <div>
            <label style={labelStyle}>Condition</label>
            <div style={{ marginTop: '8px' }}>
              <span className="badge badge-success" style={{ fontSize: '10px', display: 'inline-block', marginBottom: '8px' }}>
                {asset_details.condition_rating}
              </span>
              <p style={{ fontSize: '15px', color: 'var(--navy)', fontWeight: 500, margin: 0 }}>{asset_details.condition}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Identification */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SectionHeader icon={<Fingerprint size={14} color="var(--electric)" />} title="Identification" />
          
          <DataPoint label="Barcode Value" value={barcode_details.value} isBold />
          
          <div>
            <label style={labelStyle}>Read Status</label>
            <div style={{ fontSize: '15px', color: 'var(--navy)', fontWeight: 500, marginTop: '4px' }}>
              {barcode_details.value ? 'Readable' : 'Unreadable'}
            </div>
          </div>

          <DataPoint 
            label="Location on Asset" 
            value={barcode_details.position} 
            icon={<MapPin size={12} color="var(--slate)" style={{ marginRight: '4px' }} />}
          />

          <div>
            <label style={labelStyle}>Barcode Condition</label>
            <div style={{ marginTop: '8px' }}>
              <span className="badge badge-success" style={{ fontSize: '10px', display: 'inline-block', marginBottom: '8px' }}>
                {barcode_details.condition_rating}
              </span>
              <p style={{ fontSize: '15px', color: 'var(--navy)', fontWeight: 500, margin: 0 }}>{barcode_details.condition}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Merged Footer Box: Reasoning + Confidence */}
      <div style={{ background: 'rgba(45, 125, 210, 0.02)', borderTop: '1px solid var(--border)' }}>
        {/* Verification Reasoning */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            {match_successful ? (
              <CheckCircle2 size={14} color="var(--success)" />
            ) : (
              <AlertCircle size={14} color="var(--danger)" />
            )}
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Verification Reasoning</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--slate)', lineHeight: '1.5', fontStyle: 'italic', margin: 0 }}>
            "{vlm_result.verification_reason || 'No specific reasoning provided by analysis engine.'}"
          </p>
        </div>

        {/* Confidence Bar Sub-section */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={14} color="var(--slate)" />
              <span style={{ fontSize: '11px', color: 'var(--slate)', fontWeight: 600 }}>AI ANALYSIS CONFIDENCE</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy)' }}>{confidencePercent}%</span>
          </div>
          <div style={{ height: '6px', background: 'var(--border)', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${confidencePercent}%`, 
              background: confidencePercent > 80 ? 'var(--success)' : confidencePercent > 50 ? 'var(--warning)' : 'var(--danger)',
              transition: 'width 1s ease-out'
            }} />
          </div>
        </div>
      </div>

      {/* Status Alert Overlay if swapped or unmatched */}
      {(is_swapped || !match_successful) && (
        <div style={{ 
          padding: '10px 24px', 
          background: is_swapped ? 'var(--warning-bg)' : 'var(--danger-bg)',
          color: is_swapped ? 'var(--warning)' : 'var(--danger)',
          fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px',
          letterSpacing: '0.02em'
        }}>
          <AlertCircle size={14} />
          {is_swapped ? 'SWAP DETECTED: ASSET AND BARCODE IMAGES REVERSED' : 'MATCH FAILED: VERIFICATION UNSUCCESSFUL'}
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
    {icon}
    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
  </div>
);

const DataPoint = ({ label, value, isBold, icon }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <div style={{ 
      fontSize: '15px', 
      color: 'var(--navy)', 
      fontWeight: isBold ? 700 : 500,
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center'
    }}>
      {icon}
      {value || 'N/A'}
    </div>
  </div>
);

const labelStyle = {
  fontSize: '10px',
  fontWeight: 700,
  color: 'var(--slate)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  display: 'block'
};

export default ResultCard;
