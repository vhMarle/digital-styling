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
  const [step, setStep] = useState(1);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Form fields (initialized empty)
  const [category, setCategory] = useState('Tops');
  const [subcategory, setSubcategory] = useState('Sweaters');
  const [color, setColor] = useState('');
  const [sizeType, setSizeType] = useState('General');
  const [size, setSize] = useState('');
  const [notes, setNotes] = useState('');

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

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInput) {
      setPreviewUrl(urlInput);
      setProcessedImageUrl('');
      setShowUrlInput(false);
      setUrlInput('');
    }
  };

  const handleRemoveBackground = () => {
    if (!previewUrl) return;
    setIsRemovingBg(true);

    setTimeout(() => {
      setProcessedImageUrl(previewUrl);
      setIsRemovingBg(false);
    }, 800);
  };

  const handleProceedToDetails = () => {
    const finalImage = processedImageUrl || previewUrl;
    if (!finalImage) {
      alert('Please upload or select an image first.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalImage = processedImageUrl || previewUrl;
    const newItem = {
      id: Date.now().toString(),
      category,
      subcategory: subcategory || 'Item',
      color: color || 'Unspecified',
      sizeType,
      size: size || '-',
      notes: notes || '',
      image_url: finalImage,
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
      backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(3px)'
    }}>
      {/* Success Notification Popup */}
      {showSuccessPopup && (
        <div style={{
          position: 'absolute', backgroundColor: '#ffffff', borderRadius: '16px',
          padding: '24px 36px', textAlign: 'center', zIndex: 1200,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', border: '2px solid #7a1c4b'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#7a1c4b', fontSize: '18px' }}>Success! ✨</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Item added to your wardrobe.</p>
        </div>
      )}

      {/* Main Modal Card */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column'
      }}>
        {/* Dark Maroon Header */}
        <div style={{
          backgroundColor: '#7a1c4b', color: '#ffffff', padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <button
            type="button"
            onClick={() => {
              if (step === 2) setStep(1);
              else onClose();
            }}
            style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '20px', cursor: 'pointer', padding: 0 }}
          >
            {step === 2 ? '‹' : '✕'}
          </button>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', letterSpacing: '0.3px' }}>
            Add New Item
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '18px', cursor: 'pointer', padding: 0 }}
          >
            ✕
          </button>
        </div>

        {/* STEP 1: Source Selection Icons & Background Removal */}
        {step === 1 && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
            
            {/* Source Selection Icons Row/Grid */}
            {!previewUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  
                  {/* Camera */}
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('camera-input');
                      if (input) input.click();
                    }}
                    style={{
                      backgroundColor: '#fffbeb', border: '2px dashed #d97706', borderRadius: '16px',
                      padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <img src="camera-icon.jpg" alt="Camera" style={{ width: '28px', height: '28px', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none';}} />
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>Camera</span>
                    <input id="camera-input" type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
                  </button>

                  {/* Google Photos */}
                  <button
                    type="button"
                    onClick={() => alert('Google Photos integration selected.')}
                    style={{
                      backgroundColor: '#fffbeb', border: '2px dashed #d97706', borderRadius: '16px',
                      padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <img src="gphotos-icon.png" alt="Google Photos" style={{ width: '28px', height: '28px', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none';}} />
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>Photos</span>
                  </button>

                  {/* Browse / Folder */}
                  <label
                    style={{
                      backgroundColor: '#fffbeb', border: '2px dashed #d97706', borderRadius: '16px',
                      padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>📁</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>Browse</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                </div>

                {/* URL Option Below */}
                <div>
                  {!showUrlInput ? (
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(true)}
                      style={{
                        width: '100%', backgroundColor: '#fffbeb', border: '2px dashed #d97706', borderRadius: '16px',
                        padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#0f172a'
                      }}
                    >
                      <span>🔗</span> Enter Image URL
                    </button>
                  ) : (
                    <form onSubmit={handleUrlSubmit} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                        autoFocus
                      />
                      <button
                        type="submit"
                        style={{ backgroundColor: '#7a1c4b', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 14px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Load
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Preview & Background Removal Action */}
            {previewUrl && (
              <div style={{ marginTop: '4px' }}>
                <img
                  src={processedImageUrl || previewUrl}
                  alt="Upload Preview"
                  style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', margin: '0 auto 12px auto', display: 'block' }}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '14px' }}>
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
                  <button
                    type="button"
                    onClick={() => { setPreviewUrl(''); setProcessedImageUrl(''); }}
                    style={{
                      backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1',
                      borderRadius: '12px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    Change Source
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleProceedToDetails}
                  style={{
                    backgroundColor: '#7a1c4b', color: '#ffffff', border: 'none',
                    borderRadius: '24px', padding: '14px', fontSize: '14px', fontWeight: 'bold',
                    cursor: 'pointer', width: '100%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                >
                  Next: Enter Details →
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Item Details Form */}
        {step === 2 && (
          <form onSubmit={handleSubmit} style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Thumbnail Header in Step 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <img
                src={processedImageUrl || previewUrl}
                alt="Thumbnail"
                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div style={{ flex: 1, fontSize: '13px', color: '#334155', fontWeight: '500' }}>
                Photo prepared successfully! Add item details below.
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: '#7a1c4b', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Change Photo
              </button>
            </div>

            {/* Category & Sub-Category */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubcategory(SUBCATEGORIES[e.target.value]?.[0] || '');
                  }}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>Sub-Category</label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                >
                  {(SUBCATEGORIES[category] || []).map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Navy Blue / Forest Green"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            {/* Size Section */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>Size</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Size Type</span>
                  <select
                    value={sizeType}
                    onChange={(e) => setSizeType(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                  >
                    <option value="General">General</option>
                    <option value="Numeric">Numeric</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Size</span>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. L or 12"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional brand or fit notes..."
                rows="2"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'none' }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                backgroundColor: '#7a1c4b', color: '#ffffff', border: 'none',
                borderRadius: '24px', padding: '14px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
                marginTop: '6px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}
            >
              Add to Wardrobe ✨
            </button>
          </form>
        )}
      </div>
    </div>
  );
}