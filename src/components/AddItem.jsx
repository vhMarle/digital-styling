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
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  // Form fields matching your design
  const [category, setCategory] = useState('Tops');
  const [subcategory, setSubcategory] = useState('Sweaters');
  const [color, setColor] = useState('Purple/Violeth');
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalImage = processedImageUrl || previewUrl;
    if (!finalImage) {
      alert('Please upload an image first.');
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
        {/* Header matching your mobile mockup */}
        <div style={{
          backgroundColor: '#7a1c4b', color: '#ffffff', borderRadius: '16px',
          padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ width: '24px' }}></div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Add New Item ✨
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '18px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Photo Preview Box with dashed border */}
          <div style={{
            border: '2px dashed #d97706', backgroundColor: '#fffbeb', borderRadius: '16px',
            padding: '16px', textAlign: 'center'
          }}>
            {previewUrl ? (
              <div>
                <img
                  src={processedImageUrl || previewUrl}
                  alt="Preview"
                  style={{ maxHeight: '140px', objectFit: 'contain', borderRadius: '8px', marginBottom: '10px' }}
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
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#78350f' }}>Upload photo of your item</p>
                <label style={{
                  backgroundColor: '#7a1c4b', color: '#ffffff', borderRadius: '12px',
                  padding: '10px 18px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block'
                }}>
                  Browse Photo
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>
            )}
          </div>

          {/* Category & Sub-Category row */}
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

          {/* Add to Wardrobe Button */}
          <button
            type="submit"
            style={{
              backgroundColor: '#7a1c4b', color: '#ffffff', border: 'none',
              borderRadius: '20px', padding: '14px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
              marginTop: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
          >
            Add to Wardrobe
          </button>
        </form>
      </div>
    </div>
  );
}