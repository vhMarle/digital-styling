import React, { useState, useRef } from 'react';
import './App.css';

export default function App() {
  const [previewImage, setPreviewImage] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  // Handle local file selection (Camera / Device)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  // Trigger hidden file input when clicking the camera icon
  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle URL submit or fetch preview
  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setPreviewImage(urlInput.trim());
    }
  };

  return (
    <div className="upload-container">
      <h1 className="handwritten-title">UPLOAD ITEM</h1>

      <div className="upload-drop-box">
        <div className="upload-icons-row">
          {/* Camera Icon */}
          <div className="icon-button" onClick={handleCameraClick}>
            <img src="/camera-icon.png" alt="Camera" className="custom-icon" />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*" 
            onChange={handleFileChange} 
          />

          {/* Google Photos Icon */}
          <div className="icon-button" onClick={() => alert("Google Photos picker triggered")}>
            <img src="/gphotos-icon.png" alt="Google Photos" className="custom-icon" />
          </div>
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

      <button className="add-action-btn">ADD</button>
    </div>
  );
}