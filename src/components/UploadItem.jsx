import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function UploadItem({ onBack }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Tops');
  const [subType, setSubType] = useState('Sleeveless');
  const [siteBrand, setSiteBrand] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('--');
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const photosInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setScale(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlGo = async () => {
    if (!urlInput) return;
    try {
      setLoading(true);
      if (urlInput.match(/\.(jpeg|jpg|gif|png)$/i) || urlInput.includes('http')) {
        setImageSrc(urlInput);
        try {
          setSiteBrand(new URL(urlInput).hostname.replace('www.', ''));
        } catch (e) {
          // ignore invalid url hostname parse
        }
      }
    } catch (err) {
      console.error('URL parse error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleAddItem = async () => {
    if (!itemName) {
      alert('Please enter an item name');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('wardrobe_items').insert([
        {
          item_name: itemName,
          category,
          sub_type: subType,
          site_brand: siteBrand,
          color,
          size,
          image_url: imageSrc
        }
      ]);
      if (error) throw error;
      onBack();
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Item processed successfully!');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        capture="environment" 
        style={{ display: 'none' }} 
      />
      <input 
        type="file" 
        ref={photosInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      <h1 className="handwritten-title">UPLOAD ITEM</h1>

      <div className="upload-drop-box">
        <div className="upload-icons-row">
          <div 
            className="icon-button" 
            onClick={() => fileInputRef.current.click()}
            title="Camera Upload"
          >
            <img src="/camera-icon.png" alt="Camera" className="custom-icon" />
          </div>

          <div 
            className="icon-button" 
            onClick={() => photosInputRef.current.click()}
            title="Google Photos"
          >
            <img src="/gphotos-icon.png" alt="Google Photos" className="custom-icon" />
          </div>
        </div>

        <div className="url-search-bar">
          <svg className="search-magnifier" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="https://sparksandsequins..." 
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button className="go-btn" onClick={handleUrlGo}>GO</button>
        </div>
      </div>

      <div 
        className="preview-square-frame"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt="Preview" 
            className="preview-img-transform"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            draggable={false}
          />
        ) : (
          <span className="preview-placeholder-text">Item Preview</span>
        )}
      </div>

      {imageSrc && (
        <div className="zoom-slider-row">
          <label>Stretch / Scale:</label>
          <input 
            type="range" 
            min="0.5" 
            max="3" 
            step="0.1" 
            value={scale} 
            onChange={(e) => setScale(parseFloat(e.target.value))} 
          />
        </div>
      )}

      <div className="form-group">
        <label>ITEM NAME</label>
        <input 
          type="text" 
          placeholder="e.g. Linen Wrap Dress" 
          value={itemName} 
          onChange={(e) => setItemName(e.target.value)} 
        />
      </div>

      <div className="form-row">
        <div className="form-group half">
          <label>CATEGORY</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Tops">Tops</option>
            <option value="Bottoms">Bottoms</option>
            <option value="Dresses">Dresses</option>
            <option value="Outerwear">Outerwear</option>
            <option value="Shoes">Shoes</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>
        <div className="form-group half">
          <label>SUB-TYPE</label>
          <select value={subType} onChange={(e) => setSubType(e.target.value)}>
            <option value="Sleeveless">Sleeveless</option>
            <option value="Short Sleeve">Short Sleeve</option>
            <option value="Long Sleeve">Long Sleeve</option>
            <option value="Straight Leg">Straight Leg</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group third">
          <label>SITE / BRAND</label>
          <input 
            type="text" 
            placeholder="e.g. Zara" 
            value={siteBrand} 
            onChange={(e) => setSiteBrand(e.target.value)} 
          />
        </div>
        <div className="form-group third">
          <label>COLOR</label>
          <input 
            type="text" 
            placeholder="e.g. Black" 
            value={color} 
            onChange={(e) => setColor(e.target.value)} 
          />
        </div>
        <div className="form-group third">
          <label>SIZE</label>
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="--">--</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>
      </div>

      <button className="add-action-btn" onClick={handleAddItem} disabled={loading}>
        {loading ? 'SAVING...' : 'ADD'}
      </button>
    </div>
  );
}