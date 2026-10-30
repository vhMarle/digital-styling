// src/components/ImageSourceModal.jsx
import React from 'react';

export default function ImageSourceModal({
  isOpen,
  onClose,
  onSelectCamera,
  onSelectGooglePhotos,
  onSelectLocal,
  webUrl,
  setWebUrl,
  onImportUrl,
  loading
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 10000, padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '24px', width: '100%', maxWidth: '380px',
        padding: '24px', boxSizing: 'border-box', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
      }}>
        
        <h3 style={{
          textAlign: 'center', margin: '0 0 20px 0', fontSize: '18px',
          fontWeight: '700', color: '#1a1a24'
        }}>
          Select Image Source
        </h3>

        {/* Top 2 Action Buttons: Camera & Google Photos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          
          {/* Camera Button */}
          <button
            type="button"
            onClick={onSelectCamera}
            style={{
              backgroundColor: '#f4f6fb', border: '1px solid #e2e8f0', borderRadius: '16px',
              padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)', marginBottom: '4px'
            }}>
              <span style={{ fontSize: '22px' }}>📷</span>
            </div>
          </button>

          {/* Corrected Google Photos Button */}
          <button
            type="button"
            onClick={onSelectGooglePhotos}
            style={{
              backgroundColor: '#fffdf5', border: '1px solid #fef3c7', borderRadius: '16px',
              padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)', marginBottom: '4px', overflow: 'hidden'
            }}>
              <img
                src="/gphotos-icon.png"
                alt="Google Photos"
                onError={(e) => {
                  // Fallback to embedded Google Photos 4-color Pinwheel SVG if file path fails
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23EA4335' d='M12 12V3a4.5 4.5 0 0 0-4.5 4.5A4.5 4.5 0 0 0 12 12z'/%3E%3Cpath fill='%234285F4' d='M12 12h9a4.5 4.5 0 0 0-4.5-4.5A4.5 4.5 0 0 0 12 12z'/%3E%3Cpath fill='%2334A853' d='M12 12v9a4.5 4.5 0 0 0 4.5-4.5A4.5 4.5 0 0 0 12 12z'/%3E%3Cpath fill='%23FBBC05' d='M12 12H3a4.5 4.5 0 0 0 4.5 4.5A4.5 4.5 0 0 0 12 12z'/%3E%3C/svg%3E";
                }}
                style={{ width: '28px', height: '28px', objectFit: 'contain' }}
              />
            </div>
          </button>
        </div>

        {/* Web Link Input Section */}
        <div style={{
          backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px',
          padding: '12px', marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#38bdf8' }}>🌐</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Paste Web Link / URL</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="https://..."
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: '10px',
                border: '1.5px solid #7a1c4b', fontSize: '13px', outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={onImportUrl}
              disabled={loading}
              style={{
                backgroundColor: '#7a1c4b', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '0 16px', fontSize: '13px',
                fontWeight: '700', cursor: 'pointer'
              }}
            >
              {loading ? '...' : 'Import'}
            </button>
          </div>
        </div>

        {/* Local Files Button */}
        <button
          type="button"
          onClick={onSelectLocal}
          style={{
            width: '100%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: '16px', padding: '14px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '10px', cursor: 'pointer', marginBottom: '12px'
          }}
        >
          <span style={{ fontSize: '18px' }}>📁</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Browse Local Files</span>
        </button>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%', backgroundColor: '#e2e8f0', border: 'none',
            borderRadius: '16px', padding: '12px', fontSize: '14px',
            fontWeight: '600', color: '#475569', cursor: 'pointer'
          }}
        >
          Cancel
        </button>

      </div>
    </div>
  );
}