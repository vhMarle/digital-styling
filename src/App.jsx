import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MATRIX_CATEGORY_MAP = {
  'Tops': ['Blazers/Jackets', 'Shirts', 'Sweaters'],
  'Bottoms': ['Pants', 'Shorts', 'Skirts'],
  'Dresses': ['Mini Dresses', 'Midi Dresses', 'Maxi Dresses'],
  'Outerwear': ['Coats', 'Jackets', 'Blazers']
};

const SIZE_TYPES = ['General', 'US', 'UK', 'EU'];
const LOCALIZED_SIZES = {
  'General': ['XS', 'S', 'M', 'L', 'XL'],
  'US': ['0–2', '4–6', '8–10', '12–14', '16–18'],
  'UK': ['4–6', '8–10', '12–14', '16–18', '20–22'],
  'EU': ['32–34', '36–38', '40–42', '44–46', '48–50']
};

const RESTRICTED_COLORS = ['Red', 'Orange/Amber', 'Yellow/Gold', 'Green', 'Blue', 'Purple/Violet', 'Brown', 'Gray', 'Black', 'White'];

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'source', 'details'
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [wardrobeItems, setWardrobeItems] = useState([
    { id: 1, category: 'Tops', sub_category: 'Shirts', size_type: 'General', size: 'M', color: 'White', notes: 'Oversized white button-down', image_url: 'https://via.placeholder.com/150', zoom_level: 1, pan_x: 0, pan_y: 0, is_transparent: false },
    { id: 2, category: 'Bottoms', sub_category: 'Pants', size_type: 'General', size: 'S', color: 'Blue', notes: 'Straight-leg denim', image_url: 'https://via.placeholder.com/150', zoom_level: 1, pan_x: 0, pan_y: 0, is_transparent: false }
  ]);
  
  // Image & Interactive Editing State
  const [imageSource, setImageSource] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isTransparent, setIsTransparent] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // Drag-to-Pan Mouse States
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Delete Confirmation Popup State
  const [itemToDelete, setItemToDelete] = useState(null);

  // Details Form State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedSizeType, setSelectedSizeType] = useState('General');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchWardrobe();
  }, []);

  const fetchWardrobe = async () => {
    try {
      const { data, error } = await supabase.from('wardrobe_items').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) setWardrobeItems(data);
    } catch (err) {
      console.error('Supabase fetch error:', err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        resetEditor();
        setImageSource(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlImport = async (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      resetEditor();
      setImageSource(urlInput.trim());
      setUrlInput('');
    }
  };

  const resetEditor = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsTransparent(false);
  };

  // Modern Grab & Drag Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const removeWhiteBackground = () => {
    if (!imageSource) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r > 235 && g > 235 && b > 235) {
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      setImageSource(canvas.toDataURL('image/png'));
      setIsTransparent(true);
    };
    img.src = imageSource;
  };

  const confirmAndDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await supabase.from('wardrobe_items').delete().eq('id', itemToDelete.id);
      setWardrobeItems(prev => prev.filter(item => item.id !== itemToDelete.id));
    } catch (err) {
      setWardrobeItems(prev => prev.filter(item => item.id !== itemToDelete.id));
    }
    setItemToDelete(null);
  };

  const handleSaveToDatabase = async () => {
    const newItem = {
      category: selectedCategory,
      sub_category: selectedSubCategory,
      size_type: selectedSizeType,
      size: selectedSize,
      color: selectedColor,
      notes: notes,
      image_url: imageSource || 'https://via.placeholder.com/150',
      is_transparent: isTransparent,
      zoom_level: zoom,
      pan_x: pan.x,
      pan_y: pan.y
    };

    try {
      const { data, error } = await supabase.from('wardrobe_items').insert([newItem]).select();
      if (data) {
        setWardrobeItems(prev => [data[0], ...prev]);
      } else {
        setWardrobeItems(prev => [{ id: Date.now(), ...newItem }, ...prev]);
      }
    } catch (err) {
      setWardrobeItems(prev => [{ id: Date.now(), ...newItem }, ...prev]);
    }

    setCurrentView('home');
    setImageSource(null);
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedSizeType('General');
    setSelectedSize('');
    setSelectedColor('');
    setNotes('');
    resetEditor();
  };

  const filteredItems = selectedFilter === 'All' 
    ? wardrobeItems 
    : wardrobeItems.filter(item => item.category === selectedFilter);

  const brushHeaderStyle = {
    fontSize: '1.75rem',
    fontWeight: '700',
    fontFamily: 'serif',
    color: '#fbcfe8',
    background: 'linear-gradient(135deg, #881337 0%, #be123c 50%, #9f1239 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(1px 1px 2px rgba(136, 19, 55, 0.4))',
    margin: 0,
    letterSpacing: '0.025em'
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#171717',
      color: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1rem',
      fontFamily: 'sans-serif',
      userSelect: 'none'
    }}>
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* ================= VIEW 1: HOME DASHBOARD ================= */}
        {currentView === 'home' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #333' }}>
              <div>
                <h2 style={brushHeaderStyle}>Sparks & Sequins</h2>
                <p style={{ fontSize: '0.75rem', color: '#a3a3a3', margin: 0 }}>Digital Wardrobe Curation</p>
              </div>
              <button
                onClick={() => { resetEditor(); setImageSource(null); setCurrentView('source'); }}
                title="Add New Item"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  width: '3.5rem', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                }}
              >
                <img src="/plus-icon.png" alt="Add" style={{ width: '2.5rem', height: '2.5rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='+'; e.target.parentElement.style.color='#fbcfe8'; e.target.parentElement.style.fontSize='2.5rem';}} />
              </button>
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
              {['All', ...Object.keys(MATRIX_CATEGORY_MAP)].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  style={{
                    padding: '0.375rem 0.875rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    backgroundColor: selectedFilter === cat ? 'rgba(136, 19, 55, 0.7)' : 'rgba(38, 38, 38, 0.8)',
                    color: selectedFilter === cat ? '#ffe4e6' : '#d4d4d4',
                    border: selectedFilter === cat ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid #525252'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Wardrobe Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '0.5rem' }}>
              {filteredItems.map(item => (
                <div key={item.id || Math.random()} style={{
                  backgroundColor: 'rgba(38, 38, 38, 0.85)',
                  border: '1px solid rgba(82, 82, 82, 0.4)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  position: 'relative'
                }}>
                  <button
                    onClick={() => setItemToDelete(item)}
                    title="Remove item"
                    style={{
                      position: 'absolute', bottom: '0.75rem', right: '0.75rem',
                      background: 'transparent', border: 'none', width: '1.75rem', height: '1.75rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, zIndex: 2
                    }}
                  >
                    <img src="/minus-icon.png" alt="Remove" style={{ width: '1rem', height: '1rem', objectFit: 'contain', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='-'; e.target.parentElement.style.color='#fca5a5'; e.target.parentElement.style.fontSize='1rem';}} />
                  </button>

                  <div style={{
                    height: '110px',
                    backgroundColor: item.is_transparent ? 'transparent' : 'rgba(23, 23, 23, 0.6)',
                    borderRadius: '0.5rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <img 
                      src={item.image_url} 
                      alt={item.category} 
                      style={{ 
                        maxHeight: '100%', maxWidth: '100%', 
                        transform: `scale(${item.zoom_level || 1}) translate(${item.pan_x || 0}px, ${item.pan_y || 0}px)`,
                        filter: item.is_transparent ? 'drop-shadow(0px 0px 2px rgba(255,255,255,0.5))' : 'none'
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#fbcfe8' }}>{item.sub_category || item.category}</span>
                  <span style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>{item.color} {item.size ? `• ${item.size}` : ''}</span>
                  {item.notes && <span style={{ fontSize: '0.7rem', color: '#737373', fontStyle: 'italic' }}>{item.notes}</span>}
                </div>
              ))}
            </div>

            {/* Footer Text */}
            <div style={{ textAlign: 'center', padding: '1.5rem 0 0.5rem 0', borderTop: '1px solid #333', marginTop: 'auto' }}>
              <span style={{ fontSize: '1rem', fontWeight: '600', color: '#fbcfe8', fontFamily: 'sans-serif', letterSpacing: '0.05em' }}>
                Sparks & Sequins
              </span>
            </div>

            {/* Deletion Confirmation Popup */}
            {itemToDelete && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
              }}>
                <div style={{
                  backgroundColor: '#262626', border: '1px solid #525252', borderRadius: '1rem',
                  padding: '1.5rem', width: '90%', maxWidth: '320px', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ fontSize: '2rem' }}>✨</div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#fbcfe8', margin: 0 }}>Remove Item?</h3>
                  <p style={{ fontSize: '0.85rem', color: '#a3a3a3', margin: 0 }}>Are you sure you want to remove this piece from your digital wardrobe?</p>
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                    <button onClick={() => setItemToDelete(null)} style={{ flex: 1, padding: '0.625rem', backgroundColor: 'rgba(64,64,64,0.6)', border: '1px solid #525252', borderRadius: '0.5rem', color: '#e5e5e5', cursor: 'pointer', fontWeight: '500' }}>Keep</button>
                    <button onClick={confirmAndDeleteItem} style={{ flex: 1, padding: '0.625rem', backgroundColor: 'rgba(136, 19, 55, 0.8)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '0.5rem', color: '#ffe4e6', cursor: 'pointer', fontWeight: '500' }}>Remove</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ================= VIEW 2: SOURCING & IMAGE EDITING ================= */}
        {currentView === 'source' && (
          <div style={{
            backgroundColor: 'rgba(38, 38, 38, 0.85)',
            border: '1px solid rgba(82, 82, 82, 0.4)',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #404040', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => { setCurrentView('home'); setImageSource(null); resetEditor(); }}
                title="Back"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <img src="/back-icon.png" alt="Back" style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='←'; e.target.parentElement.style.color='#fbcfe8'; e.target.parentElement.style.fontSize='1.25rem';}} />
              </button>
              <h3 style={brushHeaderStyle}>Source New Item</h3>
              <div style={{ width: '1.5rem' }}></div>
            </div>

            {/* Sourcing Icons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'center', padding: '0.5rem 0' }}>
                <label title="Take a Picture" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src="/camera-icon.jpg" alt="Take a Picture" style={{ width: '2.5rem', height: '2.5rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} onError={(e)=>{e.target.style.display='none';}} />
                  <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>

                <label title="Google Photo's" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src="/gphotos-icon.png" alt="Google Photo's" style={{ width: '2.5rem', height: '2.5rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} onError={(e)=>{e.target.style.display='none';}} />
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>

                <label title="Browse Files" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src="/folder-icon.png" alt="Browse Files" style={{ width: '2.5rem', height: '2.5rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} onError={(e)=>{e.target.style.display='none';}} />
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Paste Web Link URL Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', backgroundColor: 'rgba(23, 23, 23, 0.6)', border: '1px solid #525252', borderRadius: '0.75rem', padding: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbcfe8', fontSize: '0.8rem', fontWeight: '600' }}>
                  <span>🌐</span> Paste Web Link
                </div>
                <form onSubmit={handleUrlImport} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    placeholder="Paste any product URL here..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    style={{
                      flex: 1, backgroundColor: 'rgba(23, 23, 23, 0.9)', border: '1px solid #525252',
                      borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#e5e5e5', outline: 'none'
                    }}
                  />
                  <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(136, 19, 55, 0.8)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '0.5rem', color: '#ffe4e6', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer' }}>Import</button>
                </form>
              </div>
            </div>

            {imageSource && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #404040', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <button
                    onClick={removeWhiteBackground}
                    style={{
                      padding: '0.25rem 0.5rem', fontSize: '0.65rem', fontWeight: '500',
                      backgroundColor: isTransparent ? 'rgba(52, 211, 153, 0.3)' : 'rgba(64, 64, 64, 0.6)',
                      color: isTransparent ? '#34d399' : '#d4d4d4', border: '1px solid #525252', borderRadius: '0.25rem', cursor: 'pointer'
                    }}
                  >
                    {isTransparent ? 'BG Removed' : 'Remove BG'}
                  </button>
                </div>

                {/* Modern Direct-Manipulation Grab & Drag Viewer */}
                <div 
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{
                    width: '100%', height: '170px', backgroundColor: isTransparent ? 'transparent' : 'rgba(23, 23, 23, 0.9)',
                    borderRadius: '0.5rem', border: '1px solid #525252', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab', position: 'relative'
                  }}
                >
                  <img 
                    src={imageSource} 
                    alt="Preview Sourced" 
                    draggable={false}
                    style={{ 
                      maxHeight: '100%', maxWidth: '100%', 
                      transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                      filter: isTransparent ? 'drop-shadow(0px 0px 2px rgba(255,255,255,0.5))' : 'none',
                      transition: isDragging ? 'none' : 'transform 0.05s ease-out'
                    }} 
                  />
                  <span style={{ position: 'absolute', bottom: '4px', right: '8px', fontSize: '0.65rem', color: '#737373', pointerEvents: 'none' }}>Click & drag to pan</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(23,23,23,0.5)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #404040' }}>
                  <span style={{ fontSize: '0.7rem', color: '#a3a3a3', whiteSpace: 'nowrap' }}>Resize:</span>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.5" 
                    step="0.05" 
                    value={zoom} 
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    style={{ flex: 1, accentColor: '#881337', cursor: 'pointer' }} 
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
              <button
                onClick={() => setCurrentView('details')}
                disabled={!imageSource}
                title="Proceed to Details"
                style={{
                  background: 'transparent', border: 'none', cursor: imageSource ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                }}
              >
                <img src="/check-mark-icon.png" alt="Confirm" style={{ width: '1.75rem', height: '1.75rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='✓'; e.target.parentElement.style.color='#34d399'; e.target.parentElement.style.fontSize='1.5rem';}} />
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW 3: ITEM DETAILS & FINAL SAVE ================= */}
        {currentView === 'details' && (
          <div style={{
            backgroundColor: 'rgba(38, 38, 38, 0.85)',
            border: '1px solid rgba(82, 82, 82, 0.4)',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #404040', paddingBottom: '0.75rem' }}>
              <div style={{ width: '1.5rem' }}></div>
              <h3 style={brushHeaderStyle}>Item Details</h3>
              <div style={{ width: '1.5rem' }}></div>
            </div>

            {imageSource && (
              <div style={{
                width: '100%', height: '130px', backgroundColor: isTransparent ? 'transparent' : 'rgba(23, 23, 23, 0.6)',
                borderRadius: '0.5rem', border: '1px solid #525252', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
              }}>
                <img src={imageSource} alt="Item Preview" style={{ maxHeight: '100%', maxWidth: '100%', transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`, filter: isTransparent ? 'drop-shadow(0px 0px 2px rgba(255,255,255,0.5))' : 'none' }} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Category *</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setSelectedCategory(cat);
                    setSelectedSubCategory(MATRIX_CATEGORY_MAP[cat] ? MATRIX_CATEGORY_MAP[cat][0] : '');
                  }}
                  style={{ width: '100%', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: '#e5e5e5', outline: 'none' }}
                >
                  <option value="" disabled>Select Category...</option>
                  {Object.keys(MATRIX_CATEGORY_MAP).map(cat => (
                    <option key={cat} value={cat} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sub-Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: selectedCategory ? '#d4d4d4' : '#737373' }}>Sub-Category</label>
                <select
                  disabled={!selectedCategory}
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: selectedCategory ? '#e5e5e5' : '#737373', outline: 'none', opacity: selectedCategory ? 1 : 0.5 }}
                >
                  <option value="" disabled>{selectedCategory ? 'Select Sub-Category...' : 'Select Category first'}</option>
                  {selectedCategory && MATRIX_CATEGORY_MAP[selectedCategory].map(sub => (
                    <option key={sub} value={sub} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Size Type Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Size Type *</label>
                <select
                  value={selectedSizeType}
                  onChange={(e) => {
                    setSelectedSizeType(e.target.value);
                    setSelectedSize('');
                  }}
                  style={{ width: '100%', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: '#e5e5e5', outline: 'none' }}
                >
                  {SIZE_TYPES.map(st => (
                    <option key={st} value={st} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Localized Size Dropdown matching Matrix */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Size *</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: '#e5e5e5', outline: 'none' }}
                >
                  <option value="" disabled>Select size...</option>
                  {(LOCALIZED_SIZES[selectedSizeType] || LOCALIZED_SIZES['General']).map(sz => (
                    <option key={sz} value={sz} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{sz}</option>
                  ))}
                </select>
              </div>

              {/* Color * */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Color *</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: '#e5e5e5', outline: 'none' }}
                >
                  <option value="" disabled>Select color...</option>
                  {RESTRICTED_COLORS.map(col => (
                    <option key={col} value={col} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Notes / Styling Cues</label>
                <input
                  type="text"
                  placeholder="e.g., pairs well with straight-leg denim"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: '#e5e5e5', outline: 'none' }}
                />
              </div>
            </div>

            {/* Bottom Bar: "Edit Item" on left, "Add to Wardrobe" on right */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
              <button
                onClick={() => setCurrentView('source')}
                title="Edit Item"
                style={{
                  background: 'transparent', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '0.5rem',
                  padding: '0.5rem 0.875rem', color: '#fbcfe8', fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer'
                }}
              >
                Edit Item
              </button>

              <button
                onClick={handleSaveToDatabase}
                disabled={!selectedCategory || !selectedSize || !selectedColor}
                title="Add to Wardrobe"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(251, 207, 232, 0.4)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1rem',
                  cursor: (selectedCategory && selectedSize && selectedColor) ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (selectedCategory && selectedSize && selectedColor) ? 1 : 0.4
                }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#fbcfe8', fontFamily: 'sans-serif' }}>
                  Add to Wardrobe
                </span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}