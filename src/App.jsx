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
  const [currentView, setCurrentView] = useState('home'); // 'home', 'source', 'editImage', 'details'
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [wardrobeItems, setWardrobeItems] = useState([
    { id: 1, category: 'Tops', sub_category: 'Shirts', size_type: 'General', size: 'M', color: 'White', notes: 'Oversized white button-down', image_url: 'https://via.placeholder.com/150', zoom_level: 1, width_scale: 100, height_scale: 100, pan_x: 0, pan_y: 0, is_transparent: false },
    { id: 2, category: 'Bottoms', sub_category: 'Pants', size_type: 'General', size: 'S', color: 'Blue', notes: 'Straight-leg denim', image_url: 'https://via.placeholder.com/150', zoom_level: 1, width_scale: 100, height_scale: 100, pan_x: 0, pan_y: 0, is_transparent: false }
  ]);
  
  // Image & Interactive Editing State
  const [imageSource, setImageSource] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [widthScale, setWidthScale] = useState(100);
  const [heightScale, setHeightScale] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isTransparent, setIsTransparent] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // Drag-to-Pan Mouse States
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Corner Resizing State
  const [isResizing, setIsResizing] = useState(null); // 'tl', 'tr', 'bl', 'br'
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 100, h: 100 });

  // Delete Confirmation Popup State
  const [itemToDelete, setItemToDelete] = useState(null);

  // Details Form State & Inspection Mode
  const [activeItemId, setActiveItemId] = useState(null);
  const [isDetailsEditable, setIsDetailsEditable] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedSizeType, setSelectedSizeType] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchWardrobe();

    const keepAliveInterval = setInterval(async () => {
      try {
        await supabase.from('wardrobe_items').select('id').limit(1);
      } catch (err) {
        // Ignore background ping errors
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(keepAliveInterval);
  }, []);

  const fetchWardrobe = async () => {
    try {
      const { data, error } = await supabase.from('wardrobe_items').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setWardrobeItems(data);
      }
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
        setCurrentView('editImage');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlImport = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      resetEditor();
      setImageSource(urlInput.trim());
      setUrlInput('');
      setCurrentView('editImage');
    }
  };

  const resetEditor = () => {
    setZoom(1);
    setWidthScale(100);
    setHeightScale(100);
    setPan({ x: 0, y: 0 });
    setIsTransparent(false);
  };

  const resetDetailsForm = () => {
    setActiveItemId(null);
    setIsDetailsEditable(true);
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedSizeType('');
    setSelectedSize('');
    setSelectedColor('');
    setNotes('');
  };

  const handleMouseDown = (e) => {
    if (isResizing) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const dx = e.clientX - resizeStart.x;
      const dy = e.clientY - resizeStart.y;
      if (isResizing === 'br') {
        setWidthScale(Math.max(30, Math.min(250, resizeStart.w + dx)));
        setHeightScale(Math.max(30, Math.min(250, resizeStart.h + dy)));
      } else if (isResizing === 'bl') {
        setWidthScale(Math.max(30, Math.min(250, resizeStart.w - dx)));
        setHeightScale(Math.max(30, Math.min(250, resizeStart.h + dy)));
      } else if (isResizing === 'tr') {
        setWidthScale(Math.max(30, Math.min(250, resizeStart.w + dx)));
        setHeightScale(Math.max(30, Math.min(250, resizeStart.h - dy)));
      } else if (isResizing === 'tl') {
        setWidthScale(Math.max(30, Math.min(250, resizeStart.w - dx)));
        setHeightScale(Math.max(30, Math.min(250, resizeStart.h - dy)));
      }
      return;
    }

    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.5), 3.5));
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
        if (r > 200 && g > 200 && b > 200) {
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
      width_scale: widthScale,
      height_scale: heightScale,
      pan_x: pan.x,
      pan_y: pan.y
    };

    try {
      if (activeItemId) {
        // Update existing item
        await supabase.from('wardrobe_items').update(newItem).eq('id', activeItemId);
        setWardrobeItems(prev => prev.map(item => item.id === activeItemId ? { ...item, ...newItem } : item));
      } else {
        // Insert new item
        const { data } = await supabase.from('wardrobe_items').insert([newItem]).select();
        if (data && data.length > 0) {
          setWardrobeItems(prev => [data[0], ...prev]);
        } else {
          setWardrobeItems(prev => [{ id: Date.now(), ...newItem }, ...prev]);
        }
      }
    } catch (err) {
      if (activeItemId) {
        setWardrobeItems(prev => prev.map(item => item.id === activeItemId ? { ...item, ...newItem } : item));
      } else {
        setWardrobeItems(prev => [{ id: Date.now(), ...newItem }, ...prev]);
      }
    }

    setCurrentView('home');
    setImageSource(null);
    resetDetailsForm();
    resetEditor();
  };

  const openExistingItem = (item) => {
    setActiveItemId(item.id);
    setImageSource(item.image_url);
    setIsTransparent(item.is_transparent || false);
    setZoom(item.zoom_level || 1);
    setWidthScale(item.width_scale || 100);
    setHeightScale(item.height_scale || 100);
    setPan({ x: item.pan_x || 0, y: item.pan_y || 0 });
    setSelectedCategory(item.category || '');
    setSelectedSubCategory(item.sub_category || '');
    setSelectedSizeType(item.size_type || '');
    setSelectedSize(item.size || '');
    setSelectedColor(item.color || '');
    setNotes(item.notes || '');
    setIsDetailsEditable(false); // Default to greyed out (read-only)
    setCurrentView('details');
  };

  const filteredItems = selectedFilter === 'All' 
    ? wardrobeItems 
    : wardrobeItems.filter(item => item.category === selectedFilter);

  const brushHeaderStyle = {
    fontSize: '1.85rem',
    fontWeight: '800',
    fontFamily: 'Georgia, serif',
    color: '#831843',
    background: 'linear-gradient(135deg, #701a35 0%, #831843 50%, #500724 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(1px 1px 2px rgba(131, 24, 67, 0.4))',
    margin: 0,
    letterSpacing: '0.04em',
    fontStyle: 'italic'
  };

  const BrushHeader = ({ text }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <h2 style={brushHeaderStyle}>{text}</h2>
    </div>
  );

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
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet" />
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* ================= VIEW 1: HOME DASHBOARD ================= */}
        {currentView === 'home' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #333' }}>
              <div>
                {/* Image logo instead of written title */}
                <img src="/Sparks & Sequince.png" alt="Sparks & Sequins" style={{ height: '3.5rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none';}} />
              </div>
              <button
                onClick={() => { resetEditor(); resetDetailsForm(); setImageSource(null); setCurrentView('source'); }}
                title="Add New Item"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  width: '5rem', height: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                }}
              >
                <img src="/plus-icon.png" alt="Add" style={{ width: '4rem', height: '4rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='+'; e.target.parentElement.style.color='#fbcfe8'; e.target.parentElement.style.fontSize='3.5rem';}} />
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
                    backgroundColor: selectedFilter === cat ? 'rgba(131, 24, 67, 0.7)' : 'rgba(38, 38, 38, 0.8)',
                    color: selectedFilter === cat ? '#ffe4e6' : '#d4d4d4',
                    border: selectedFilter === cat ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid #525252'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Wardrobe Grid - Clicking item opens details in read-only mode */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '0.5rem' }}>
              {filteredItems.map(item => (
                <div 
                  key={item.id || Math.random()} 
                  onClick={() => openExistingItem(item)}
                  style={{
                    backgroundColor: 'rgba(38, 38, 38, 0.85)',
                    border: '1px solid rgba(82, 82, 82, 0.4)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); setItemToDelete(item); }}
                    title="Remove item"
                    style={{
                      position: 'absolute', bottom: '0.75rem', right: '0.75rem',
                      background: 'transparent', border: 'none', width: '2.5rem', height: '2.5rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, zIndex: 2
                    }}
                  >
                    <img src="/minus-icon.png" alt="Remove" style={{ width: '1.75rem', height: '1.75rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='-'; e.target.parentElement.style.color='#fca5a5'; e.target.parentElement.style.fontSize='1.75rem';}} />
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
                        width: `${item.width_scale || 100}%`,
                        height: `${item.height_scale || 100}%`,
                        objectFit: 'contain',
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
                    <button onClick={confirmAndDeleteItem} style={{ flex: 1, padding: '0.625rem', backgroundColor: 'rgba(131, 24, 67, 0.8)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '0.5rem', color: '#ffe4e6', cursor: 'pointer', fontWeight: '500' }}>Remove</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ================= VIEW 2: SOURCING STAGE ("From...") ================= */}
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
              <BrushHeader text="From..." />
              <div style={{ width: '1.5rem' }}></div>
            </div>

            {/* Sourcing Icons Stacked Vertically */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                <label title="Take a Picture" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(23, 23, 23, 0.6)', border: '1px solid #525252', borderRadius: '0.75rem', padding: '0.875rem', width: '100%' }}>
                  <img src="/camera-icon.jpg" alt="Take a Picture" style={{ width: '4.5rem', height: '4.5rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} onError={(e)=>{e.target.style.display='none';}} />
                  <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>

                <label title="Google Photos" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(23, 23, 23, 0.6)', border: '1px solid #525252', borderRadius: '0.75rem', padding: '0.875rem', width: '100%' }}>
                  <img src="/gphotos-icon.png" alt="Google Photos" style={{ width: '4.5rem', height: '4.5rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} onError={(e)=>{e.target.style.display='none';}} />
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>

                <label title="Browse Files" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(23, 23, 23, 0.6)', border: '1px solid #525252', borderRadius: '0.75rem', padding: '0.875rem', width: '100%' }}>
                  <img src="/folder-icon.png" alt="Browse Files" style={{ width: '4.5rem', height: '4.5rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} onError={(e)=>{e.target.style.display='none';}} />
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Paste Web Link Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', backgroundColor: 'rgba(23, 23, 23, 0.6)', border: '1px solid #525252', borderRadius: '0.75rem', padding: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbcfe8', fontSize: '0.8rem', fontWeight: '600' }}>
                  <span>🌐</span> Paste Web Link
                </div>
                <form onSubmit={handleUrlImport} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                  <input
                    type="url"
                    placeholder="Paste URL..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    style={{
                      width: '100%', boxSizing: 'border-box', backgroundColor: 'rgba(23, 23, 23, 0.9)', border: '1px solid #525252',
                      borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.8rem', color: '#e5e5e5', outline: 'none'
                    }}
                  />
                  {urlInput.trim() && (
                    <button 
                      type="submit" 
                      style={{ 
                        width: '100%', padding: '0.625rem', 
                        backgroundColor: 'rgba(131, 24, 67, 0.9)', 
                        border: '1px solid rgba(244, 63, 94, 0.4)', 
                        borderRadius: '0.5rem', 
                        color: '#ffe4e6', 
                        fontSize: '0.8rem', 
                        fontWeight: '600', 
                        cursor: 'pointer' 
                      }}
                    >
                      Import
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 3: IMAGE EDITING STAGE ================= */}
        {currentView === 'editImage' && (
          <div style={{
            backgroundColor: 'rgba(38, 38, 38, 0.85)',
            border: '1px solid rgba(82, 82, 82, 0.4)',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #404040', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => { setCurrentView('source'); setImageSource(null); resetEditor(); }}
                title="Back"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <img src="/back-icon.png" alt="Back" style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='←'; e.target.parentElement.style.color='#fbcfe8'; e.target.parentElement.style.fontSize='1.25rem';}} />
              </button>
              <BrushHeader text="Edit Item Image" />
              <div style={{ width: '1.5rem' }}></div>
            </div>

            {imageSource && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>Drag corners to stretch/resize image</span>
                </div>

                {/* Interactive Frame with Corner Resize Handles */}
                <div 
                  onMouseDown={handleMouseDown}
                  onWheel={handleWheel}
                  style={{
                    width: '100%', height: '190px', backgroundColor: isTransparent ? 'transparent' : 'rgba(23, 23, 23, 0.9)',
                    borderRadius: '0.5rem', border: '1px solid #525252', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'visible', cursor: isDragging ? 'grabbing' : 'grab', position: 'relative'
                  }}
                >
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={imageSource} 
                      alt="Preview Sourced" 
                      draggable={false}
                      style={{ 
                        maxHeight: '150px', maxWidth: '280px', 
                        width: `${widthScale}%`,
                        height: `${heightScale}%`,
                        objectFit: 'contain',
                        transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                        filter: isTransparent ? 'drop-shadow(0px 0px 2px rgba(255,255,255,0.5))' : 'none'
                      }} 
                    />

                    {/* Corner Handles for Stretching */}
                    <div 
                      onMouseDown={(e) => { e.stopPropagation(); setIsResizing('tl'); setResizeStart({ x: e.clientX, y: e.clientY, w: widthScale, h: heightScale }); }}
                      style={{ position: 'absolute', top: -6, left: -6, width: 12, height: 12, backgroundColor: '#fbcfe8', border: '1px solid #831843', borderRadius: '50%', cursor: 'nwse-resize', zIndex: 10 }}
                      title="Resize Top-Left"
                    />
                    <div 
                      onMouseDown={(e) => { e.stopPropagation(); setIsResizing('tr'); setResizeStart({ x: e.clientX, y: e.clientY, w: widthScale, h: heightScale }); }}
                      style={{ position: 'absolute', top: -6, right: -6, width: 12, height: 12, backgroundColor: '#fbcfe8', border: '1px solid #831843', borderRadius: '50%', cursor: 'nesw-resize', zIndex: 10 }}
                      title="Resize Top-Right"
                    />
                    <div 
                      onMouseDown={(e) => { e.stopPropagation(); setIsResizing('bl'); setResizeStart({ x: e.clientX, y: e.clientY, w: widthScale, h: heightScale }); }}
                      style={{ position: 'absolute', bottom: -6, left: -6, width: 12, height: 12, backgroundColor: '#fbcfe8', border: '1px solid #831843', borderRadius: '50%', cursor: 'nesw-resize', zIndex: 10 }}
                      title="Resize Bottom-Left"
                    />
                    <div 
                      onMouseDown={(e) => { e.stopPropagation(); setIsResizing('br'); setResizeStart({ x: e.clientX, y: e.clientY, w: widthScale, h: heightScale }); }}
                      style={{ position: 'absolute', bottom: -6, right: -6, width: 12, height: 12, backgroundColor: '#fbcfe8', border: '1px solid #831843', borderRadius: '50%', cursor: 'nwse-resize', zIndex: 10 }}
                      title="Resize Bottom-Right"
                    />
                  </div>

                  <span style={{ position: 'absolute', bottom: '4px', right: '8px', fontSize: '0.65rem', color: '#737373', pointerEvents: 'none' }}>
                    Drag corners to stretch • Scroll to zoom
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Sourcing Navigation: "BG Removed" matches button style next to it, greyed out when clicked */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
              <button
                onClick={removeWhiteBackground}
                disabled={!imageSource || isTransparent}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: isTransparent ? 'rgba(64, 64, 64, 0.4)' : 'transparent',
                  color: isTransparent ? '#737373' : '#fbcfe8',
                  border: isTransparent ? '1px solid #525252' : '1px solid rgba(251, 207, 232, 0.4)',
                  borderRadius: '0.5rem',
                  cursor: (imageSource && !isTransparent) ? 'pointer' : 'default',
                  opacity: imageSource ? 1 : 0.4
                }}
              >
                {isTransparent ? 'BG Removed' : 'Remove BG'}
              </button>

              <button
                onClick={() => { if (imageSource) { resetDetailsForm(); setCurrentView('details'); } }}
                disabled={!imageSource}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(251, 207, 232, 0.4)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1rem',
                  cursor: imageSource ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  opacity: imageSource ? 1 : 0.4
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: '700', fontFamily: 'Georgia, serif', color: '#fbcfe8', fontStyle: 'italic' }}>
                  Details &gt;
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW 4: ITEM DETAILS & FINAL SAVE ================= */}
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
              <BrushHeader text="Item Details" />
              <div style={{ width: '1.5rem' }}></div>
            </div>

            {imageSource && (
              <div style={{
                width: '100%', height: '130px', backgroundColor: isTransparent ? 'transparent' : 'rgba(23, 23, 23, 0.6)',
                borderRadius: '0.5rem', border: '1px solid #525252', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
              }}>
                <img 
                  src={imageSource} 
                  alt="Item Preview" 
                  style={{ 
                    maxHeight: '100%', maxWidth: '100%', 
                    width: `${widthScale}%`, height: `${heightScale}%`, objectFit: 'contain',
                    transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`, 
                    filter: isTransparent ? 'drop-shadow(0px 0px 2px rgba(255,255,255,0.5))' : 'none' 
                  }} 
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Category *</label>
                <select
                  disabled={!isDetailsEditable}
                  value={selectedCategory}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setSelectedCategory(cat);
                    setSelectedSubCategory('');
                  }}
                  style={{ width: '100%', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: isDetailsEditable ? '#e5e5e5' : '#a3a3a3', outline: 'none', opacity: isDetailsEditable ? 1 : 0.7 }}
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
                  disabled={!isDetailsEditable || !selectedCategory}
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: isDetailsEditable ? '#e5e5e5' : '#a3a3a3', outline: 'none', opacity: (isDetailsEditable && selectedCategory) ? 1 : 0.5 }}
                >
                  <option value="" disabled>{selectedCategory ? 'Select Sub-Category...' : 'Select Category first'}</option>
                  {selectedCategory && MATRIX_CATEGORY_MAP[selectedCategory].map(sub => (
                    <option key={sub} value={sub} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Sizing Section (Size dropdown blank by default) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Size *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    disabled={!isDetailsEditable}
                    value={selectedSizeType}
                    onChange={(e) => {
                      setSelectedSizeType(e.target.value);
                      setSelectedSize('');
                    }}
                    style={{ width: '110px', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.5rem', fontSize: '0.875rem', color: isDetailsEditable ? '#e5e5e5' : '#a3a3a3', outline: 'none', opacity: isDetailsEditable ? 1 : 0.7 }}
                  >
                    <option value="" disabled>Standard...</option>
                    {SIZE_TYPES.map(st => (
                      <option key={st} value={st} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{st}</option>
                    ))}
                  </select>

                  <select
                    disabled={!isDetailsEditable || !selectedSizeType}
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    style={{ flex: 1, backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: isDetailsEditable ? '#e5e5e5' : '#a3a3a3', outline: 'none', opacity: (isDetailsEditable && selectedSizeType) ? 1 : 0.5 }}
                  >
                    <option value="" disabled>{selectedSizeType ? 'Select size...' : 'Select standard first'}</option>
                    {selectedSizeType && (LOCALIZED_SIZES[selectedSizeType] || []).map(sz => (
                      <option key={sz} value={sz} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{sz}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Color * */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Color *</label>
                <select
                  disabled={!isDetailsEditable}
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: isDetailsEditable ? '#e5e5e5' : '#a3a3a3', outline: 'none', opacity: isDetailsEditable ? 1 : 0.7 }}
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
                  disabled={!isDetailsEditable}
                  placeholder="e.g., pairs well with straight-leg denim"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: isDetailsEditable ? '#e5e5e5' : '#a3a3a3', outline: 'none', opacity: isDetailsEditable ? 1 : 0.7 }}
                />
              </div>
            </div>

            {/* Bottom Bar: "Edit Item" on left, "Add to Wardrobe" (or check-mark-icon.png) on right */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
              <button
                onClick={() => setIsDetailsEditable(true)}
                title="Edit Item"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(251, 207, 232, 0.4)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#fbcfe8', fontFamily: 'sans-serif' }}>
                  Edit Item
                </span>
              </button>

              {isDetailsEditable ? (
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
              ) : (
                <button
                  onClick={() => setCurrentView('home')}
                  title="Done"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '3rem',
                    height: '3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                >
                  <img src="/check-mark-icon.png" alt="Done" style={{ width: '2.5rem', height: '2.5rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='✓'; e.target.parentElement.style.color='#fbcfe8'; e.target.parentElement.style.fontSize='2rem';}} />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}