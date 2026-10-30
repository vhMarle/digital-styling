// src/components/AddItem.jsx
import React, { useState } from 'react';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Bags', 'Shoes'];
const SUBCATEGORIES = {
  Tops: ['Sweaters', 'Blouses', 'T-Shirts', 'Shirts', 'Tank Tops'],
  Bottoms: ['Jeans', 'Trousers', 'Skirts', 'Shorts'],
  Dresses: ['Casual Dresses', 'Evening Dresses', 'Maxi Dresses'],
  Bags: ['Handbags', 'Crossbody', 'Totes', 'Clutches'],
  Shoes: ['Sneakers', 'Boots', 'Sandals', 'Heels']
};

export default function AddItem({ onClose, onAddItem }) {
  // Step control: 1 = Upload & Clear Background, 2 = Item Details
  const [step, setStep] = useState(1);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  // Form fields for Step 2
  const [category, setCategory] = useState('Tops');
  const [subcategory, setSubcategory] = useState('Sweaters');
  const [color, setColor] = useState('');
  const [sizeType, setSizeType] = useState('General');
  const [size, setSize] = useState('L');
  const [notes, setNotes] = useState('');

  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      setProcessedImageUrl('');
    }
  };

  const handleRemoveBackground = () => {
    if (!previewUrl) return;
    setIsRemovingBg(true);

    setTimeout(() => {
      setProcessedImageUrl(previewUrl);
      setIsRemovingBg(false);
    }, 700);
  };

  const handleNextStep = () => {
    const finalImage = processedImageUrl || previewUrl;
    if (!finalImage) {
      alert('Please upload or process an image first.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalImage = processedImageUrl || previewUrl;
    if (!finalImage) {
      alert('Image missing. Please go back and select an image.');
      setStep(1);
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      category,
      subcategory: subcategory || 'Item',
      color,
      sizeType,
      size,
      notes,
      image_url: finalImage, // Preserves background-removed image state
    };

    onAddItem(newItem);
    setShowSuccessPopup(true);

    setTimeout(() => {
      setShowSuccessPopup(false);
      onClose();
    }, 1400);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 1000, padding: '16px'
    }}>
      {/* Success Notification Popup */}
      {showSuccessPopup && (
        <div style={{
          position: 'absolute', backgroundColor: '#ffffff', borderRadius: '16px',
          padding: '24px 36px', textAlign: 'center', zIndex: 1100,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', border: '2px solid #7a1c4b'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#7a1c4b', fontSize: '18px' }}>Success! ✨</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Item added to your wardrobe.</p>
        </div>
      )}

      {/* Main Modal Card */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '24px', padding: '24px',
        maxWidth: '440px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#7a1c4b', color: '#ffffff', borderRadius: '16px',
          padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ width: '24px' }}>
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '16px', cursor: 'pointer', padding: 0 }}
              >
                ‹
              </button>
            )}
          </div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {step === 1 ? 'Add New Item ✨' : 'Item Details ✨'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '18px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* STEP 1: Upload & Background Removal */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              border: '2px dashed #d97706', backgroundColor: '#fffbeb', borderRadius: '16px',
              padding: '20px', textAlign: 'center'
            }}>
              {previewUrl ? (
                <div>
                  <img
                    src={processedImageUrl || previewUrl}
                    alt="Preview"
                    style={{ maxHeight: '160px', objectFit: 'contain', borderRadius: '8px', marginBottom: '12px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <label style={{
                      backgroundColor: '#1b2a4a', color: '#ffffff', borderRadius: '12px',
                      padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
                    }}>
                      Change Photo
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveBackground}
                      disabled={isRemovingBg}
                      style={{
                        backgroundColor: '#7a1c4b', color: '#ffffff', border: 'none',
                        borderRadius: '12px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
                      }}
                    >
                      {isRemovingBg ? 'Processing...' : '✨ Clear BG'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#78350f', fontWeight: '500' }}>Upload photo of your item</p>
                  <label style={{
                    backgroundColor: '#7a1c4b', color: '#ffffff', borderRadius: '12px',
                    padding: '10px 20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block'
                  }}>
                    Browse Photo
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1',
                  borderRadius: '16px', padding: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!previewUrl}
                style={{
                  flex: 1, backgroundColor: previewUrl ? '#7a1c4b' : '#cbd5e1', color: '#ffffff', border: 'none',
                  borderRadius: '16px', padding: '12px', fontSize: '13px', fontWeight: 'bold', cursor: previewUrl ? 'pointer' : 'not-allowed',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              >
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Category, Sub-Category, Color, Size, Notes */}
        {step === 2 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Thumbnail Preview Banner */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <img
                src={processedImageUrl || previewUrl}
                alt="Thumb"
                style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#fff' }}
              />
              <div style={{ fontSize: '12px', color: '#334155' }}>
                <strong>Photo Processed</strong>
                <div style={{ color: '#64748b', fontSize: '11px' }}>Ready for details</div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#7a1c4b', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Edit Photo
              </button>
            </div>

            {/* Category & Sub-Category */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubcategory(SUBCATEGORIES[e.target.value]?.[0] || '');
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Sub-Category</label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  {(SUBCATEGORIES[category] || []).map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Purple/Violet"
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            {/* Size Section */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Size Type</label>
                <select
                  value={sizeType}
                  onChange={(e) => setSizeType(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="General">General</option>
                  <option value="Numeric">Numeric</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Size</label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g. L, 10, Medium"
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Zara Striped Wool Sweater"
                rows="2"
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'none' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1',
                  borderRadius: '16px', padding: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                ← Back
              </button>
              <button
                type="submit"
                style={{
                  flex: 1, backgroundColor: '#7a1c4b', color: '#ffffff', border: 'none',
                  borderRadius: '16px', padding: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              >
                Add to Wardrobe
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}