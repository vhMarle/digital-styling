import React, { useState } from 'react';

// Sub-categories for details dropdowns
const DETAIL_OPTIONS = {
  category: ['Tops & Blouses', 'Bottoms & Denim', 'Outerwear & Dusters', 'Dresses & Jumpsuits', 'Footwear'],
  color: ['Cool Neutrals', 'Navy Blue', 'Forest Green', 'Rich Burgundy', 'Sage / Olive Green', 'Rose Pink', 'Chocolate Brown', 'Metallic Silver/Gold'],
  season: ['Spring', 'Summer', 'Fall', 'Winter', 'All-Season'],
  occasion: ['Casual Everyday', 'Resort & Vacation', 'Work & Professional', 'Evening & Social', 'Outdoor Hiking & Camping']
};

export default function App() {
  const [currentStep, setCurrentStep] = useState('source'); // 'source', 'details', 'wardrobe'
  const [selectedSource, setSelectedSource] = useState(null);
  
  // Form state for item details with dropdown selections
  const [details, setDetails] = useState({
    category: '',
    color: '',
    season: '',
    occasion: '',
    notes: ''
  });

  const handleSourceSelect = (sourceType) => {
    setSelectedSource(sourceType);
    setCurrentStep('details');
  };

  const handleDetailChange = (field, value) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleUndoToSource = () => {
    setCurrentStep('source');
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
      justifyContent: 'center',
      padding: '1rem',
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
        
        {/* Step 1: Select Source */}
        {currentStep === 'source' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#fbcfe8', margin: '0 0 0.25rem 0' }}>Catalog New Item</h2>
              <p style={{ fontSize: '0.875rem', color: '#a3a3a3', margin: 0 }}>Choose how you'd like to add your piece</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '0.5rem' }}>
              <button
                onClick={() => handleSourceSelect('camera')}
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
                  color: '#e5e5e5',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  marginBottom: '0.75rem',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(136, 19, 55, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  fontSize: '1.25rem'
                }}>
                  📷
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Take Photo</span>
              </button>

              <button
                onClick={() => handleSourceSelect('upload')}
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
                  color: '#e5e5e5',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  marginBottom: '0.75rem',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(136, 19, 55, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  fontSize: '1.25rem'
                }}>
                  📂
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Upload Image</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details Form with Sub-categories & Sizing/Move built in implicitly */}
        {currentStep === 'details' && (
          <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #404040', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Replaced Change Source button with undo-arrow-icon.png */}
                <button
                  type="button"
                  onClick={handleUndoToSource}
                  title="Reselect Source"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.375rem',
                    borderRadius: '0.5rem'
                  }}
                >
                  <img 
                    src="/undo-arrow-icon.png" 
                    alt="Back to Source" 
                    style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#fbcfe8' }}>Back</span>
                </button>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#fbcfe8', margin: 0 }}>Item Details</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#a3a3a3', textTransform: 'capitalize', backgroundColor: 'rgba(64, 64, 64, 0.6)', padding: '0.25rem 0.625rem', borderRadius: '9999px', border: '1px solid #525252' }}>
                Source: {selectedSource}
              </span>
            </div>

            {/* Dropdowns with Sub-categories */}
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
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
              }}
            >
              Save to Wardrobe
            </button>
          </form>
        )}

        {/* Step 3: Confirmation / Wardrobe View */}
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
            <p style={{ fontSize: '0.875rem', color: '#a3a3a3', margin: 0 }}>Your item has been cataloged with your custom specifications.</p>
            <button
              onClick={handleUndoToSource}
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
              Add Another Item
            </button>
          </div>
        )}

      </div>
    </div>
  );
}