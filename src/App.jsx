import React, { useState, useRef } from 'react';
import './App.css';

export default function App() {
  const [previewImage, setPreviewImage] = useState(null);
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

        {/* URL Search Bar */}
        <div className="url-search-bar">
          <span className="search-magnifier">🔍</span>
          <input type="text" placeholder="https://sparksandsequins..." />
          <button className="go-btn">GO</button>
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

      {/* Form Fields & Add Button */}
      {/* ... rest of your form components ... */}
    </div>
  );
}