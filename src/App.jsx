import React, { useState, useRef } from 'react';
import './App.css';

// Exact Category & Sub-Type mapping based on your specification
const CATEGORY_SUBTYPES = {
  'Tops': ['Sleeveless', 'Short Sleeve', '3/4 Sleeve', 'Long Sleeve'],
  'Bottoms': ['Jeans', 'Dress Trousers', 'Leggings & Jeggings'],
  'Shoes': ['Boots', 'Sandals', 'Flats', 'Heels'],
  'Loungewear': ['Joggers', 'Sweatpants', 'Yoga Pants'],
  'Dresses': ['Mini', 'Midi', 'Maxi', 'Tea-Length', 'Ball Gown / Floor Length'],
  'Skirts': ['A-Line Skirts', 'Pencil Skirt', 'Mini & Midi Skirts', 'Maxi'],
  'Bags': [],
  'Accessories': ['Bag', 'Belt', 'Jewellery', 'Scarf']
};

export default function App() {
  const [currentView, setCurrentView] = useState('closet'); // 'closet' or 'upload'
  const [previewImage, setPreviewImage] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  // Form state fields
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubtype, setSelectedSubtype] = useState('');

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Handle file selection from Camera or Gallery with proper preview generation
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
    if (urlInput.trim() && urlInput !== 'https://sparksandsequins...') {
      setPreviewImage(urlInput.trim());
    }
  };

  // Handle Category change
  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setSelectedCategory(cat);
    setSelectedSubtype(''); // Reset subtype when category changes
  };

  // Get available subtypes for current category
  const availableSubtypes = selectedCategory ? CATEGORY_SUBTYPES[selectedCategory] || [] : [];

  return (
    <div className="app-wrapper">
      {currentView === 'closet' ? (
        /* --- CLOSET / WARDROBE HOME VIEW --- */
        <div className="closet-container">
          <h1 className="handwritten-title">MY WARDROBE</h1>

          {/* Navigation Tabs */}
          <div className="closet-tabs">
            {['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Loungewear', 'Skirts', 'Bags', 'Accessories'].map((tab) => (
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

            {/* URL Search Bar with Faded Placeholder */}
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
            <input type="text" placeholder="e.g., Linen Wrap Dress" />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>CATEGORY</label>
              <select value={selectedCategory} onChange={handleCategoryChange}>
                <option value="">Select Category</option>
                {Object.keys(CATEGORY_SUBTYPES).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group half">
              <label>SUB-TYPE</label>
              <select 
                value={selectedSubtype} 
                onChange={(e) => setSelectedSubtype(e.target.value)}
                disabled={!selectedCategory || availableSubtypes.length === 0}
              >
                <option value="">{selectedCategory ? (availableSubtypes.length > 0 ? 'Select Sub-Type' : 'None available') : 'Select Category First'}</option>
                {availableSubtypes.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group third">
              <label>SITE / BRAND</label>
              <input type="text" placeholder="e.g. Zara" />
            </div>
            <div className="form-group third">
              <label>COLOR</label>
              <input type="text" placeholder="e.g. Black" />
            </div>
            <div className="form-group third">
              <label>SIZE</label>
              <select>
                <option>--</option>
                <option>XS</option>
                <option>S</option>
                <option>M</option>
                <option>L</option>
                <option>XL</option>
              </select>
            </div>
          </div>

          <button className="add-action-btn" onClick={() => setCurrentView('closet')}>ADD</button>
        </div>
      )}
    </div>
  );
}