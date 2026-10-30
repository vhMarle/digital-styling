// src/components/AddItem.jsx
import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';

const CATEGORY_MAP = {
  Tops: ['Sweaters', 'Blouses', 'T-Shirts', 'Polo Shirts', 'Cardigans', 'Jackets'],
  Bottoms: ['Jeans', 'Pants', 'Shorts', 'Skirts', 'Leggings'],
  Dresses: ['Maxi Dress', 'Midi Dress', 'Mini Dress', 'Jumpsuit', 'Shirt Dress'],
  Bags: ['Handbag', 'Tote Bag', 'Crossbody', 'Clutch', 'Backpack'],
  Shoes: ['Sneakers', 'Sandals', 'Boots', 'Flats', 'Heels']
};

const COLOR_OPTIONS = [
  'Purple/Violet',
  'Black',
  'White / Cream',
  'Beige / Tan',
  'Yellow',
  'Blue / Denim',
  'Navy',
  'Forest Green',
  'Sage Green',
  'Rich Burgundy',
  'Rose Pink',
  'Chocolate Brown',
  'Silver Accent',
  'Gold Accent'
];

const SIZE_TYPES = ['General', 'US', 'UK', 'EU'];
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', '2XL', '30', '32', '34', '36'];

export default function AddItem({ onClose, onAddItem }) {
  const [statusMessage, setStatusMessage] = useState('');
  const [webUrlInput, setWebUrlInput] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Initial Method Selection Modal State
  const [showPickerModal, setShowPickerModal] = useState(true);

  // Image & Cropper States
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Controlled Form States
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [color, setColor] = useState('');
  const [sizeType, setSizeType] = useState('General');
  const [size, setSize] = useState('');
  const [notes, setNotes] = useState('');

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    setSubcategory('');
  };

  const resetAll = () => {
    setImagePreview(null);
    setOriginalImage(null);
    setIsEditing(false);
    setShowPickerModal(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCategory('');
    setSubcategory('');
    setColor('');
    setSizeType('General');
    setSize('');
    setNotes('');
    setWebUrlInput('');
    setStatusMessage('');
  };

  const processImageFile = (file) => {
    if (!file) return;
    setStatusMessage('Loading photo...');

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const safeDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setOriginalImage(safeDataUrl);
        setImagePreview(safeDataUrl);
        setIsEditing(true);
        setShowPickerModal(false);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        setStatusMessage('Adjust position or crop image, then tap Save Area.');
      };

      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleLoadWebUrl = async () => {
    if (!webUrlInput.trim()) return;
    const url = webUrlInput.trim();
    setStatusMessage('Loading web image...');

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const localBlobUrl = URL.createObjectURL(blob);

      setOriginalImage(localBlobUrl);
      setImagePreview(localBlobUrl);
      setIsEditing(true);
      setShowPickerModal(false);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setWebUrlInput('');
      setStatusMessage('Web image loaded!');
    } catch (err) {
      setOriginalImage(url);
      setImagePreview(url);
      setIsEditing(true);
      setShowPickerModal(false);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setWebUrlInput('');
      setStatusMessage('Web image loaded!');
    }
  };

  const handleClearBackground = () => {
    if (!imagePreview) return;
    setStatusMessage('Clearing background...');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imagePreview;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const isYellowItem = r > 150 && g > 150 && b < 120;
        if (!isYellowItem) {
          const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
          if (diff < 50) {
            data[i + 3] = 0;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setImagePreview(canvas.toDataURL('image/png'));
      setStatusMessage('Background cleared!');
    };
  };

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    await new Promise((res) => (image.onload = res));

    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/png');
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels || !imagePreview) return;
    try {
      const cropped = await getCroppedImg(imagePreview, croppedAreaPixels);
      setImagePreview(cropped);
      setIsEditing(false);
      setStatusMessage('Crop applied! Enter details below.');
    } catch (err) {
      setStatusMessage('Failed to save crop.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imagePreview || !category) return;

    const newItem = {
      id: Date.now().toString(),
      image_url: imagePreview,
      category,
      subcategory,
      color,
      sizeType,
      size,
      notes,
      created_at: new Date().toISOString(),
    };

    if (onAddItem) onAddItem(newItem);

    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
      resetAll();
      if (onClose) onClose();
    }, 1800);
  };

  const isFormDisabled = showPickerModal || isEditing;
  const isFormValid = imagePreview && category && !isFormDisabled;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 9999, padding: '12px'
    }}>
      <input type="file" ref={cameraInputRef} onChange={(e) => processImageFile(e.target.files[0])} accept="image/*" capture="environment" style={{ display: 'none' }} />
      <input type="file" ref={fileInputRef} onChange={(e) => processImageFile(e.target.files[0])} accept="image/*" style={{ display: 'none' }} />

      {/* Success Notification Modal */}
      {showSuccessPopup && (
        <div style={{
          position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff', padding: '24px 32px', borderRadius: '24px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', zIndex: 10001, textAlign: 'center',
          border: '3px solid #e2b857'
        }}>
          <div style={{ fontSize: '42px', marginBottom: '8px' }}>🎉✨</div>
          <h3 style={{ margin: '0 0 6px 0', color: '#7a1c4b', fontSize: '18px' }}>Added to Wardrobe!</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Your new item is ready for styling.</p>
        </div>
      )}

      {/* Front Modal: Select Image Source */}
      {showPickerModal && (
        <div style={{
          position: 'absolute', backgroundColor: '#ffffff', borderRadius: '24px',
          padding: '24px', width: '90%', maxWidth: '360px', zIndex: 10000,
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', textAlign: 'center'
        }}>
          <h3 style={{ marginTop: 0, color: '#7a1c4b', fontSize: '18px' }}>Select Image Source ✨</h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Choose how you want to add your clothing item:</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              type="button"
              onClick={() => cameraInputRef.current && cameraInputRef.current.click()}
              style={{ backgroundColor: '#7a1c4b', color: '#fff', border: 'none', borderRadius: '16px', padding: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
            >
              📷 Take Photo
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{ backgroundColor: '#1b2a4a', color: '#fff', border: 'none', borderRadius: '16px', padding: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
            >
              📁 Browse Gallery
            </button>

            <div style={{ marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <input
                type="text"
                placeholder="Or paste Web Image URL..."
                value={webUrlInput}
                onChange={(e) => setWebUrlInput(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box', marginBottom: '8px' }}
              />
              <button
                type="button"
                onClick={handleLoadWebUrl}
                style={{ width: '100%', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                Load URL
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', marginTop: '8px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Container (Faded and Disabled when Picker Modal is Active) */}
      <form onSubmit={handleSubmit} style={{
        backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '420px',
        maxHeight: '94vh', overflowY: 'auto', boxSizing: 'border-box', color: '#1e293b', overflowX: 'hidden',
        opacity: showPickerModal ? 0.35 : 1,
        pointerEvents: showPickerModal ? 'none' : 'auto',
        transition: 'opacity 0.2s ease-in-out'
      }}>
        {/* Deep Maroon Header Bar */}
        <div style={{
          backgroundColor: '#7a1c4b', padding: '16px 20px', display: 'flex',
          justify: 'space-between', alignItems: 'center', color: '#ffffff'
        }}>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>
            &lt;
          </button>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>Add New Item ✨</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {statusMessage && (
            <div style={{ padding: '8px 12px', backgroundColor: '#f0f9ff', color: '#0369a1', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', fontWeight: '500' }}>
              {statusMessage}
            </div>
          )}

          {/* Cropper View while active */}
          {isEditing && imagePreview ? (
            <div style={{ marginBottom: '16px', borderRadius: '16px', overflow: 'hidden', background: '#1e1e2d' }}>
              <div style={{ position: 'relative', height: '340px', width: '100%' }}>
                <Cropper
                  image={imagePreview}
                  crop={crop}
                  zoom={zoom}
                  aspect={3 / 4}
                  restrictPosition={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div style={{ padding: '8px 12px', background: '#181824', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#fff', fontSize: '12px' }}>🔍 Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={0.8}
                  max={3}
                  step={0.05}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#2563eb' }}
                />
              </div>

              <div style={{ padding: '10px', display: 'flex', gap: '6px', justifyContent: 'space-between', background: '#12121a' }}>
                <button
                  type="button"
                  onClick={() => setShowPickerModal(true)}
                  style={{ backgroundColor: '#475569', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  &larr; Re-select
                </button>
                <button
                  type="button"
                  onClick={handleClearBackground}
                  style={{ backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ✨ Clear BG
                </button>
                <button
                  type="button"
                  onClick={handleSaveCrop}
                  style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Save Area
                </button>
              </div>
            </div>
          ) : (
            /* Yellow Dashed Card display matching Screenshot */
            <div style={{
              border: '2px dashed #d97706', borderRadius: '16px', padding: '20px',
              textAlign: 'center', backgroundColor: '#fffbeb', marginBottom: '20px'
            }}>
              <div style={{
                width: '160px', height: '180px', margin: '0 auto 12px auto', borderRadius: '12px',
                overflow: 'hidden', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center',
                justify: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '12px', color: '#92400e' }}>No Item Loaded</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowPickerModal(true)}
                style={{
                  backgroundColor: '#0f172a', color: '#ffffff', border: 'none',
                  borderRadius: '10px', padding: '10px 20px', fontSize: '13px',
                  fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                {imagePreview ? 'Change Photo' : 'Select Photo'}
              </button>
            </div>
          )}

          {/* Disabled Form Fields when picker or editor is active */}
          <fieldset disabled={isFormDisabled} style={{ border: 'none', padding: 0, margin: 0, opacity: isFormDisabled ? 0.5 : 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#1e293b' }}>Category</label>
                <select
                  value={category}
                  onChange={handleCategoryChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #0f172a', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: '500' }}
                >
                  <option value="">Select...</option>
                  {Object.keys(CATEGORY_MAP).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#1e293b' }}>Sub-Category</label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  disabled={!category || isFormDisabled}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #0f172a', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: '500' }}
                >
                  <option value="">Select...</option>
                  {category && CATEGORY_MAP[category] && CATEGORY_MAP[category].map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#1e293b' }}>Color</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #0f172a', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: '500' }}
              >
                <option value="">Select Color...</option>
                {COLOR_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#1e293b' }}>Size</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Size Type</span>
                  <select
                    value={sizeType}
                    onChange={(e) => setSizeType(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #0f172a', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: '500' }}
                  >
                    {SIZE_TYPES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Size</span>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #0f172a', backgroundColor: '#ffffff', color: '#0f172a', fontWeight: '500' }}
                  >
                    <option value="">Select...</option>
                    {SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#1e293b' }}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Item notes..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #0f172a', boxSizing: 'border-box', color: '#0f172a', fontWeight: '500' }}
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              style={{
                width: '100%',
                backgroundColor: isFormValid ? '#7a1c4b' : '#cbd5e1',
                color: isFormValid ? '#ffffff' : '#64748b',
                border: 'none',
                borderRadius: '24px',
                padding: '16px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: isFormValid ? 'pointer' : 'not-allowed'
              }}
            >
              Add to Wardrobe
            </button>
          </fieldset>
        </div>
      </form>
    </div>
  );
}