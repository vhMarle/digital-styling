import React, { useState } from 'react';

// Dropdown options for category and color
const DETAIL_OPTIONS = {
  category: ['Tops & Blouses', 'Bottoms & Denim', 'Outerwear & Dusters', 'Dresses & Jumpsuits', 'Footwear'],
  color: ['Cool Neutrals', 'Navy Blue', 'Forest Green', 'Rich Burgundy', 'Sage / Olive Green', 'Rose Pink', 'Chocolate Brown', 'Metallic Silver/Gold']
};

export default function App() {
  const [currentStep, setCurrentStep] = useState('home'); // 'home', 'source', 'details', 'wardrobe'
  const [selectedSource, setSelectedSource] = useState(null);
  
  // Form state for item details (Category, Color, Notes)
  const [details, setDetails] = useState({
    category: '',
    color: '',
    notes: ''
  });

  const handleGoToSource = (sourceType) => {
    setSelectedSource(sourceType);
    setCurrentStep('details');
  };

  const handleDetailChange = (field, value) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleUndoToHome = () => {
    setCurrentStep('home');
    setSelectedSource(null);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    setCurrentStep('wardrobe');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#171717',
      color: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '3rem',
      paddingBottom: '3rem',
      paddingLeft: '1rem',
      paddingRight: '1rem',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'rgba(38, 38, 38, 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(82, 82, 82, 0.4)',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* Step 1: Homepage / Main Dashboard */}
        {currentStep === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center', padding: '1rem 0' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#fbcfe8', margin: '0 0 0.35rem 0' }}>Sparks & Sequins</h2>
              <p style={{ fontSize: '0.875rem', color: '#a3a3a3', margin: 0 }}>Digital Wardrobe & Outfit Curation</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', paddingTop: '0.5rem' }}>
              <button
                onClick={() => setCurrentStep('source')}
                style={{
                  padding: '0.875rem',
                  backgroundColor: 'rgba(136, 19, 55, 0.7)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  borderRadius: '0.75rem',
                  fontWeight: '500',
                  color: '#ffe4e6',
                  cursor: 'pointer'
                }}
              >
                + Catalog New Item
              </button>
              <button
                onClick={() => setCurrentStep('wardrobe')}
                style={{
                  padding: '0.875rem',
                  backgroundColor: 'rgba(64, 64, 64, 0.4)',
                  border: '1px solid rgba(115, 115, 115, 0.4)',
                  borderRadius: '0.75rem',
                  fontWeight: '500',
                  color: '#e5e5e5',
                  cursor: 'pointer'
                }}
              >
                View Wardrobe
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Source Selection (Take Photo / Upload Image) */}
        {currentStep === 'source' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #404040', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={handleUndoToHome}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.375rem'
                }}
              >
                <img 
                  src="/undo-arrow-icon.png" 
                  alt="Back" 
                  style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }}
                />
                <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#fbcfe8' }}>Home</span>
              </button>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#fbcfe8', margin: 0 }}>Catalog New Item</h3>
              <div style={{ width: '2rem' }}></div>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#a3a3a3', textAlign: 'center', margin: 0 }}>Choose how you'd like to add your piece</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                onClick={() => handleGoToSource('camera')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem 1rem',
                  backgroundColor: 'rgba(64, 64, 64, 0.4)',
                  border: '1px solid rgba(115, 115, 115, 0.4)',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  color: '#e5e5e5'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📷</div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Take Photo</span>
              </button>

              <button
                onClick={() => handleGoToSource('upload')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem 1rem',
                  backgroundColor: 'rgba(64, 64, 64, 0.4)',
                  border: '1px solid rgba(115, 115, 115, 0.4)',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  color: '#e5e5e5'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📂</div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Upload Image</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Streamlined Details Form */}
        {currentStep === 'details' && (
          <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #404040', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCurrentStep('source')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.375rem'
                }}
              >
                <img 
                  src="/undo-arrow-icon.png" 
                  alt="Back" 
                  style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }}
                />
                <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#fbcfe8' }}>Back</span>
              </button>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#fbcfe8', margin: 0 }}>Item Details</h3>
              <span style={{ fontSize: '0.75rem', color: '#a3a3a3', textTransform: 'capitalize' }}>
                {selectedSource}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.keys(DETAIL_OPTIONS).map((field) => (
                <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>
                    {field}
                  </label>
                  <select
                    value={details[field]}
                    onChange={(e) => handleDetailChange(field, e.target.value)}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(23, 23, 23, 0.8)',
                      border: '1px solid #525252',
                      borderRadius: '0.5rem',
                      padding: '0.625rem 0.75rem',
                      fontSize: '0.875rem',
                      color: '#e5e5e5',
                      outline: 'none'
                    }}
                  >
                    <option value="" disabled>Select {field}...</option>
                    {DETAIL_OPTIONS[field].map((subOption) => (
                      <option key={subOption} value={subOption} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>
                        {subOption}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>
                  Notes / Styling Cues
                </label>
                <input
                  type="text"
                  placeholder="e.g., pairs well with straight-leg denim"
                  value={details.notes}
                  onChange={(e) => handleDetailChange('notes', e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(23, 23, 23, 0.8)',
                    border: '1px solid #525252',
                    borderRadius: '0.5rem',
                    padding: '0.625rem 0.75rem',
                    fontSize: '0.875rem',
                    color: '#e5e5e5',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(136, 19, 55, 0.7)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                borderRadius: '0.75rem',
                fontWeight: '500',
                color: '#ffe4e6',
                cursor: 'pointer'
              }}
            >
              Save to Wardrobe
            </button>
          </form>
        )}

        {/* Step 4: Wardrobe / Success View */}
        {currentStep === 'wardrobe' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              backgroundColor: 'rgba(6, 95, 70, 0.3)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              color: '#34d399',
              fontSize: '1.5rem'
            }}>
              ✓
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f5f5f5', margin: 0 }}>Item Added Successfully!</h3>
            <p style={{ fontSize: '0.875rem', color: '#a3a3a3', margin: 0 }}>Your item has been cataloged.</p>
            <button
              onClick={handleUndoToHome}
              style={{
                marginTop: '1rem',
                padding: '0.625rem 1.5rem',
                backgroundColor: 'rgba(82, 82, 82, 0.5)',
                border: '1px solid #737373',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#e5e5e5',
                cursor: 'pointer'
              }}
            >
              Back to Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
}