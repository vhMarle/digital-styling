import React, { useState, useRef } from 'react';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('closet'); // 'closet' or 'upload'
  const [previewImage, setPreviewImage] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Handle file selection from Camera or Gallery
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  // Trigger phone camera directly
  const handleCameraClick = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Trigger photo gallery / Google Photos selection directly
  const handleGalleryClick = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  // Handle URL submit or fetch preview
  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setPreviewImage(urlInput.trim());
    }
  };

  return (
    <div className="app-wrapper">
      {currentView === 'closet' ? (
        /* --- CLOSET / WARDROBE HOME VIEW --- */
        <div className="closet-container">
          <h1 className="handwritten-title">MY WARDROBE</h1>

          {/* Navigation Tabs */}
          <div className="closet-tabs">
            {['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes'].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Wardrobe Items Grid */}
          <div className="closet-grid">
            <div className="closet-placeholder-card">
              <span className="empty-closet-text">No items yet. Tap + to add!</span>
            </div>
          </div>

          {/* Floating Add (+) Button */}
          <button 
            className="floating-add-btn" 
            onClick={() => setCurrentView('upload')}
          >
            +
          </button>
        </div>
      ) : (
        /* --- UPLOAD ITEM VIEW --- */
        <div className="upload-container">
          <div className="upload-header-row">
            <button className="back-btn" onClick={() => setCurrentView('closet')}>← Back</button>
            <h1 className="handwritten-title">UPLOAD ITEM</h1>
            <div style={{ width: 50 }}></div>
          </div>

          <div className="upload-drop-box">
            <div className="upload-icons-row">
              {/* Camera Icon -> Opens Camera directly */}
              <div className="icon-button" onClick={handleCameraClick}>
                <img src="/camera-icon.png" alt="Camera" className="custom-icon" />
              </div>
              <input 
                type="file" 
                ref={cameraInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                capture="environment"
                onChange={handleFileChange} 
              />

              {/* Google Photos Icon -> Opens Gallery / Photos directly */}
              <div className="icon-button" onClick={handleGalleryClick}>
                <img src="/gphotos-icon.png" alt="Google Photos" className="custom-icon" />
              </div>
              <input 
                type="file" 
                ref={galleryInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>

            {/* URL Search Bar with Placeholder */}
            <div className="url-search-bar">
              <span className="search-magnifier">🔍</span>
              <input 
                type="text" 
                placeholder="https://sparksandsequins..." 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <button className="go-btn" onClick={handleUrlSubmit}>GO</button>
            </div>
          </div>

          {/* Preview Square Frame */}
          <div className="preview-square-frame">
            {previewImage ? (
              <img src={previewImage} alt="Item Preview" className="preview-img-transform" />
            ) : (
              <span className="preview-placeholder-text">Preview</span>
            )}
          </div>

          {/* Zoom Slider */}
          <div className="zoom-slider-row">
            <span>-</span>
            <input type="range" min="50" max="150" defaultValue="100" />
            <span>+</span>
          </div>

          {/* Form Fields */}
          <div className="form-group">
            <label>ITEM NAME</label>
            <input type="text" placeholder="e.g., Linen Blazer" />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>CATEGORY</label>
              <select>
                <option>Tops</option>
                <option>Bottoms</option>
                <option>Dresses</option>
                <option>Shoes</option>
                <option>Accessories</option>
              </select>
            </div>
            <div className="form-group half">
              <label>COLOR</label>
              <input type="text" placeholder="e.g., Beige" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group third">
              <label>SEASON</label>
              <select>
                <option>All Season</option>
                <option>Spring/Summer</option>
                <option>Fall/Winter</option>
              </select>
            </div>
            <div className="form-group third">
              <label>OCCASION</label>
              <select>
                <option>Casual</option>
                <option>Work</option>
                <option>Evening</option>
              </select>
            </div>
            <div className="form-group third">
              <label>BRAND</label>
              <input type="text" placeholder="Brand" />
            </div>
          </div>

          <button className="add-action-btn" onClick={() => setCurrentView('closet')}>ADD</button>
        </div>
      )}
    </div>
  );
}