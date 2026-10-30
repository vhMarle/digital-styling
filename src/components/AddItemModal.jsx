// src/components/AddItemModal.jsx
import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';

export default function AddItemModal({ onClose, onAddItem }) {
  const [statusMessage, setStatusMessage] = useState('');

  // Image & Editing States
  const [imagePreview, setImagePreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Form State
  const [category, setCategory] = useState('Tops');
  const [subcategory, setSubcategory] = useState('Polo Shirts');
  const [color, setColor] = useState('Yellow');
  const [notes, setNotes] = useState('Short Sleeve Striped Polo');

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Universal File & Camera Reader (Works with Gallery Browse & Camera Capture)
  const processSelectedFile = (file) => {
    if (!file) return;

    setStatusMessage('Reading image file...');

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;

      // Downscale image using HTML Canvas to prevent mobile browser memory drops
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

        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(resizedDataUrl);
        setIsEditing(true); // Force open the interactive editor area
        setStatusMessage('Photo loaded! Tap Clear BG or Save Area.');
      };

      img.src = base64Image;
    };

    reader.onerror = () => {
      setStatusMessage('Error reading file from device.');
    };

    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    processSelectedFile(file);
  };

  // Canvas Threshold Background Removal (Removes light background instantly on phone)
  const handleThresholdBgRemove = () => {
    if (!imagePreview) return;
    setStatusMessage('Clearing background...');

    const img = new Image();
    img.src = imagePreview;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Detect background color sample from top-left pixel
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const colorDiff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
        if (colorDiff < 85 || (r > 200 && g > 200 && b > 200)) {
          data[i + 3] = 0; // Set background pixels transparent
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setImagePreview(canvas.toDataURL('image/png'));
      setStatusMessage('Background cleared successfully!');
    };
  };

  // Crop Calculation
  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

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

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(URL.createObjectURL(blob)), 'image/png');
    });
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
      setStatusMessage('Crop applied!');
    } catch (err) {
      setStatusMessage('Crop failed');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imagePreview) {
      alert('Please select or capture a photo first.');
      return;
    }

    const newItem = {
      image_url: imagePreview,
      category,
      subcategory,
      color,
      notes,
      created_at: new Date().toISOString(),
    };

    if (onAddItem) onAddItem(newItem);
    if (onClose) onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 9999, padding: '12px'
    }}>
      {/* Hidden Mobile Inputs */}
      <input type="file" ref={cameraInputRef} onChange={handleInputChange} accept="image/*" capture="environment" style={{ display: 'none' }} />
      <input type="file" ref={fileInputRef} onChange={handleInputChange} accept="image/*" style={{ display: 'none' }} />

      <form onSubmit={handleSubmit} style={{
        backgroundColor: '#fff', borderRadius: '20px', width: '100%', maxWidth: '400px',
        maxHeight: '92vh', overflowY: 'auto', padding: '20px', boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', marginRight: '8px' }}>
            &lt;
          </button>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#7a1c4b' }}>Add New Item ✨</h2>
        </div>

        {/* Live Status Header */}
        {statusMessage && (
          <div style={{ padding: '8px 12px', backgroundColor: '#f0f9ff', color: '#0369a1', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', fontWeight: '500' }}>
            {statusMessage}
          </div>
        )}

        {/* Editor workspace - shown when an image is selected */}
        {isEditing && imagePreview ? (
          <div style={{ marginBottom: '16px', borderRadius: '16px', overflow: 'hidden', background: '#1e1e2d' }}>
            <div style={{ position: 'relative', height: '280px', width: '100%' }}>
              <Cropper
                image={imagePreview}
                crop={crop}
                zoom={zoom}
                aspect={4 / 5}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div style={{ padding: '10px', display: 'flex', gap: '8px', justifyContent: 'space-between', background: '#12121a' }}>
              <button
                type="button"
                onClick={handleThresholdBgRemove}
                style={{ backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ✨ Clear BG
              </button>
              <button
                type="button"
                onClick={handleSaveCrop}
                style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Save Area
              </button>
            </div>
          </div>
        ) : (
          /* Initial Upload Box */
          <div style={{ border: '2px dashed #e2b857', borderRadius: '16px', padding: '16px', textAlign: 'center', backgroundColor: '#fcfbfa', marginBottom: '16px' }}>
            <div style={{
              width: '150px', height: '170px', margin: '0 auto 12px auto', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#eee',
              display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'radial-gradient(#cbd5e1 20%, transparent 20%)', backgroundSize: '12px 12px'
            }}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '12px', color: '#64748b' }}>No Photo Selected</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => cameraInputRef.current && cameraInputRef.current.click()}
                style={{ backgroundColor: '#1b2a4a', color: '#fff', border: 'none', borderRadius: '20px', padding: '10px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                📷 Take Photo
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '10px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                📁 Browse
              </button>
            </div>
          </div>
        )}

        {/* Form Details */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <option value="Tops">Tops</option>
            <option value="Dresses">Dresses</option>
            <option value="Bottoms">Bottoms</option>
            <option value="Bags">Bags</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
        </div>

        <button
          type="submit"
          style={{ width: '100%', backgroundColor: '#7a1c4b', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Add to Wardrobe
        </button>
      </form>
    </div>
  );
}