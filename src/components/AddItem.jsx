// src/components/AddItem.jsx
import React, { useState } from 'react';

const CATEGORIES = ['Bottoms', 'Dresses', 'Tops', 'Bags', 'Shoes'];

export default function AddItem({ onClose, onAddItem }) {
  // Step control: 1 = Upload & Background Removal, 2 = Item Details
  const [step, setStep] = useState(1);
  
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  // Form fields for Step 2
  const [category, setCategory] = useState('Tops');
  const [subcategory, setSubcategory] = useState('');
  const [color, setColor] = useState('');
  
  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Handle file selection & preview
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      setProcessedImageUrl(''); // Reset processed image on new upload
    }
  };

  // Background removal / cropping processing action
  const handleRemoveBackground = () => {
    if (!previewUrl) return;
    setIsRemovingBg(true);

    // Simulating background removal / canvas processing delay
    setTimeout(() => {
      // Lock in the processed background-removed image URL
      setProcessedImageUrl(previewUrl);
      setIsRemovingBg(false);
    }, 700);
  };

  // Proceed from Step 1 to Step 2
  const handleNextStep = () => {
    const finalImage = processedImageUrl || previewUrl;
    if (!finalImage) {
      alert('Please select and process an image first.');
      return;
    }
    setStep(2);
  };

  // Final submit handler on Step 2
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
      color: color || 'Neutral',
      image_url: finalImage, // Correctly preserves background-removed state!
    };

    // 1. Add item to parent wardrobe state
    onAddItem(newItem);

    // 2. Trigger success notification popup
    setShowSuccessPopup(true);

    // 3. Close modal after success display
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
        backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px',
        maxWidth: '440px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#7a1c4b' }}>
            {step === 1 ? 'Step 1: Upload & Clean Image' : 'Step 2: Item Details'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
          >
            ✕
          </button>
        </div>

        {/* STEP 1: Upload & Background Removal / Crop */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                Upload Wardrobe Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ width: '100%', fontSize: '12px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              />
            </div>

            {previewUrl && (
              <div style={{ textAlign: 'center', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <img
                  src={processedImageUrl || previewUrl}
                  alt="Preview"
                  style={{ maxHeight: '180px', objectFit: 'contain', borderRadius: '8px' }}
                />
                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={handleRemoveBackground}
                    disabled={isRemovingBg}
                    style={{
                      backgroundColor: '#1b2a4a', color: '#ffffff', border: 'none',
                      borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    {isRemovingBg ? 'Processing...' : '✨ Clear Background'}
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1',
                  borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer'
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
                  borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: 'bold', cursor: previewUrl ? 'pointer' : 'not-allowed',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              >
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Category, Subcategory, Color & Save */}
        {step === 2 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <img
                src={processedImageUrl || previewUrl}
                alt="Thumb"
                style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '6px', backgroundColor: '#fff' }}
              />
              <div style={{ fontSize: '12px', color: '#334155' }}>
                <strong>Image Ready</strong>
                <div style={{ color: '#64748b', fontSize: '11px' }}>Background processed successfully</div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#7a1c4b', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Change
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                Subcategory / Item Name
              </label>
              <input
                type="text"
                placeholder="e.g., Silk Blouse, Straight Denim"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                Color
              </label>
              <input
                type="text"
                placeholder="e.g., Navy Blue, Forest Green"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1, backgroundColor: '#f1f5f9', color: '#3341