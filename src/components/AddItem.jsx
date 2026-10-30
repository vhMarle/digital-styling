// src/components/AddItem.jsx
import React, { useState } from 'react';

const CATEGORIES = ['Bottoms', 'Dresses', 'Tops', 'Bags', 'Shoes'];

export default function AddItem({ onClose, onAddItem }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [category, setCategory] = useState('Tops');
  const [subcategory, setSubcategory] = useState('');
  const [color, setColor] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!previewUrl) {
      alert('Please select an image first.');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      category,
      subcategory: subcategory || 'Item',
      color: color || 'Neutral',
      image_url: previewUrl,
    };

    onAddItem(newItem);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 1000, padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px',
        maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#7a1c4b' }}>Add Wardrobe Item</h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
              Upload Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ width: '100%', fontSize: '12px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
            />
          </div>

          {previewUrl && (
            <div style={{ textAlign: 'center', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{ maxHeight: '140px', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>
          )}

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
              onClick={onClose}
              style={{
                flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1',
                borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1, backgroundColor: '#7a1c4b', color: '#ffffff', border: 'none',
                borderRadius: '12px', padding: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}
            >
              Add to Wardrobe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}