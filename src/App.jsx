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
    { id: 1, category: 'Tops', sub_category: 'Shirts', size_type: 'General', size: 'M', color: 'White', notes: 'Oversized white button-down', image_url: 'https://via.placeholder.com/150', zoom_level: 1, frame_width: 260, frame_height: 180, pan_x: 0, pan_y: 0, is_transparent: false },
    { id: 2, category: 'Bottoms', sub_category: 'Pants', size_type: 'General', size: 'S', color: 'Blue', notes: 'Straight-leg denim', image_url: 'https://via.placeholder.com/150', zoom_level: 1, frame_width: 260, frame_height: 180, pan_x: 0, pan_y: 0, is_transparent: false }
  ]);
  
  // Image & Interactive Editing State
  const [imageSource, setImageSource] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [frameWidth, setFrameWidth] = useState(260);
  const [frameHeight, setFrameHeight] = useState(180);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isTransparent, setIsTransparent] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // Drag-to-Pan Content Offset State & Touch Pinch
  const [isDraggingContent, setIsDraggingContent] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialTouchDist, setInitialTouchDist] = useState(null);

  // Frame Resizing Anchor State
  const [isResizingFrame, setIsResizingFrame] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 260, h: 180 });

  // Delete Warning Confirmation Popup State
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
      const { data } = await supabase.from('wardrobe_items').select('*').order('created_at', { ascending: false });
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
    setFrameWidth(260);
    setFrameHeight(180);
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

  // Mouse & Touch Interaction Handlers
  const handleMouseDown = (e, handleType) => {
    e.stopPropagation();
    if (handleType) {
      setIsResizingFrame(handleType);
      setResizeStart({ x: e.clientX, y: e.clientY, w: frameWidth, h: frameHeight });
    } else {
      setIsDraggingContent(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isResizingFrame) {
      const dx = e.clientX - resizeStart.x;
      const dy = e.clientY - resizeStart.y;
      let newW = resizeStart.w;
      let newH = resizeStart.h;

      if (isResizingFrame.includes('r')) newW = Math.max(100, resizeStart.w + dx);
      if (isResizingFrame.includes('l')) newW = Math.max(100, resizeStart.w - dx);
      if (isResizingFrame.includes('b')) newH = Math.max(80, resizeStart.h + dy);
      if (isResizingFrame.includes('t')) newH = Math.max(80, resizeStart.h - dy);

      setFrameWidth(newW);
      setFrameHeight(newH);
      return;
    }

    if (!isDraggingContent) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDraggingContent(false);
    setIsResizingFrame(null);
  };

  // Mobile Touch Pinch-to-Zoom & Pan Handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialTouchDist(dist);
    } else if (e.touches.length === 1) {
      setIsDraggingContent(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialTouchDist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / initialTouchDist;
      setZoom(prev => Math.min(Math.max(prev * (factor > 1 ? 1.05 : 0.95), 0.5), 3.5));
      setInitialTouchDist(dist);
    } else if (e.touches.length === 1 && isDraggingContent) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDraggingContent(false);
    setInitialTouchDist(null);
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
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
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
      } catch (err) {
        console.error('Background removal security/canvas error:', err);
      }
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
    setCurrentView('home');
    resetDetailsForm();
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
      frame_width: frameWidth,
      frame_height: frameHeight,
      pan_x: pan.x,
      pan_y: pan.y
    };

    try {
      if (activeItemId) {
        await supabase.from('wardrobe_items').update(newItem).eq('id', activeItemId);
        setWardrobeItems(prev => prev.map(item => item.id === activeItemId ? { ...item, ...newItem } : item));
      } else {
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
    setFrameWidth(item.frame_width || 260);
    setFrameHeight(item.frame_height || 180);
    setPan({ x: item.pan_x || 0, y: item.pan_y || 0 });
    setSelectedCategory(item.category || '');
    setSelectedSubCategory(item.sub_category || '');
    setSelectedSizeType(item.size_type || '');
    setSelectedSize(item.size || '');
    setSelectedColor(item.color || '');
    setNotes(item.notes || '');
    setIsDetailsEditable(false);
    setCurrentView('details');
  };

  const filteredItems = selectedFilter === 'All' 
    ? wardrobeItems 
    : wardrobeItems.filter(item => item.category === selectedFilter);

  // Exact Gray Crimson #834655 Header Style
  const brushHeaderStyle = {
    fontSize: '1.85rem',
    fontWeight: '800',
    fontFamily: 'Georgia, serif',
    color: '#834655',
    background: 'linear-gradient(135deg, #703845 0%, #834655 50%, #502732 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(1px 1px 2px rgba(131, 70, 85, 0.4))',
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
      padding: '1rem 0.5rem',
      fontFamily: 'sans-serif',
      userSelect: 'none',
      boxSizing: 'border-box',
      overflowX: 'hidden',
      width: '100vw'
    }}>
      <div style={{ width: '100%', maxWidth: '480px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0 0.5rem' }}>
        
        {/* ================= VIEW 1: HOME DASHBOARD ================= */}
        {currentView === 'home' && (
          <>
            {/* Header with P&S.png logo and plus button vertically centered */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderBottom: '1px solid #333', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', height: '3.5rem' }}>
                <img src="/P&S.png" alt="Sparks & Sequins" style={{ height: '3rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='block';}} />
                <span style={{ display: 'none', fontSize: '1.25rem', fontWeight: '800', color: '#834655', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>Sparks & Sequins</span>
              </div>
              <button
                onClick={() => { resetEditor(); resetDetailsForm(); setImageSource(null); setCurrentView('source'); }}
                title="Add New Item"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  width: '3.5rem', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                }}
              >
                <img src="/plus-icon.png" alt="Add" style={{ width: '3.25rem', height: '3.25rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='+'; e.target.parentElement.style.color='#fbcfe8'; e.target.parentElement.style.fontSize='2.5rem';}} />
              </button>
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', width: '100%', boxSizing: 'border-box' }}>
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
                    backgroundColor: selectedFilter === cat ? 'rgba(131, 70, 85, 0.7)' : 'rgba(38, 38, 38, 0.8)',
                    color: selectedFilter === cat ? '#ffe4e6' : '#d4d4d4',
                    border: selectedFilter === cat ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid #525252'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Wardrobe Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '0.5rem', width: '100%', boxSizing: 'border-box' }}>
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
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); openExistingItem(item); }}
                    title="Edit Item"
                    style={{
                      position: 'absolute', bottom: '0.75rem', right: '0.75rem',
                      background: 'transparent', border: 'none', width: '2.25rem', height: '2.25rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, zIndex: 2
                    }}
                  >
                    <img src="/edit-icon.png" alt="Edit" style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='✏️'; e.target.parentElement.style.fontSize='1.25rem';}} />
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

            {/* Deletion Confirmation Warning Popup */}
            {itemToDelete && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
              }}>
                <div style={{
                  backgroundColor: '#262626', border: '1px solid #834655', borderRadius: '1rem',
                  padding: '1.5rem', width: '90%', maxWidth: '320px', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ fontSize: '2rem' }}>⚠️</div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#fbcfe8', margin: 0 }}>Delete Item?</h3>
                  <p style={{ fontSize: '0.85rem', color: '#a3a3a3', margin: 0 }}>Warning: This action cannot be undone. Are you sure you want to permanently delete this piece from your wardrobe?</p>
                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                    <button onClick={() => setItemToDelete(null)} style={{ flex: 1, padding: '0.625rem', backgroundColor: 'rgba(64,64,64,0.6)', border: '1px solid #525252', borderRadius: '0.5rem', color: '#e5e5e5', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                    <button onClick={confirmAndDeleteItem} style={{ flex: 1, padding: '0.625rem', backgroundColor: 'rgba(131, 70, 85, 0.9)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '0.5rem', color: '#ffe4e6', cursor: 'pointer', fontWeight: '500' }}>Delete</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ================= VIEW 2: SOURCING STAGE ("Import from...") ================= */}
        {currentView === 'source' && (
          <div style={{
            backgroundColor: 'rgba(38, 38, 38, 0.85)',
            border: '1px solid rgba(82, 82, 82, 0.4)',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #404040', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => { setCurrentView('home'); setImageSource(null); resetEditor(); }}
                title="Home"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <img src="/home-icon.png" alt="Home" style={{ width: '1.75rem', height: '1.75rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='🏠'; e.target.parentElement.style.color='#fbcfe8'; e.target.parentElement.style.fontSize='1.5rem';}} />
              </button>
              <BrushHeader text="Import from..." />
              <div style={{ width: '1.75rem' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
              <label title="Take a Picture" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(23, 23, 23, 0.6)', border: '1px solid #525252', borderRadius: '0.75rem', padding: '0.875rem', width: '100%', boxSizing: 'border-box' }}>
                <img src="/camera-icon.jpg" alt="Take a Picture" style={{ width: '4.5rem', height: '4.5rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} onError={(e)=>{e.target.style.display='none';}} />
                <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>

              <label title="Google Photos" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(23, 23, 23, 0.6)', border: '1px solid #525252', borderRadius: '0.75rem', padding: '0.875rem', width: '100%', boxSizing: 'border-box' }}>
                <img src="/gphotos-icon.png" alt="Google Photos" style={{ width: '4.5rem', height: '4.5rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} onError={(e)=>{e.target.style.display='none';}} />
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>

              <label title="Browse Files" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(23, 23, 23, 0.6)', border: '1px solid #525252', borderRadius: '0.75rem', padding: '0.875rem', width: '100%', boxSizing: 'border-box' }}>
                <img src="/folder-icon.png" alt="Browse Files" style={{ width: '4.5rem', height: '4.5rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} onError={(e)=>{e.target.style.display='none';}} />
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'rgba(23, 23, 23, 0.6)', border: '1px solid #834655', borderRadius: '0.75rem', padding: '0.875rem', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#834655', fontSize: '1rem', fontWeight: '700' }}>
                  <span>🌐</span> Paste web link
                </div>
                <form onSubmit={handleUrlImport} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', boxSizing: 'border-box' }}>
                  <input
                    type="url"
                    placeholder="Paste URL..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    style={{
                      width: '100%', boxSizing: 'border-box', backgroundColor: 'rgba(23, 23, 23, 0.9)', border: '1px solid #834655',
                      borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.85rem', color: '#e5e5e5', outline: 'none'
                    }}
                  />
                  {urlInput.trim() && (
                    <button 
                      type="submit" 
                      style={{ 
                        width: '100%', boxSizing: 'border-box', padding: '0.625rem', 
                        backgroundColor: '#834655', 
                        border: '1px solid rgba(244, 63, 94, 0.4)', 
                        borderRadius: '0.5rem', 
                        color: '#ffe4e6', 
                        fontSize: '0.85rem', 
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

        {/* ================= VIEW 3: IMAGE EDITING STAGE ("Edit item") ================= */}
        {currentView === 'editImage' && (
          <div style={{
            backgroundColor: 'rgba(38, 38, 38, 0.85)',
            border: '1px solid rgba(82, 82, 82, 0.4)',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            width: '100%',
            boxSizing: 'border-box'
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
              
              {/* Replaced header with edit-item.png graphic */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/edit-item.png" alt="Edit item" style={{ height: '2.5rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='block';}} />
                <span style={{ display: 'none', fontSize: '1.5rem', fontWeight: '800', color: '#834655', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>Edit item</span>
              </div>

              <div style={{ width: '1.5rem' }}></div>
            </div>

            {imageSource && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box', alignItems: 'center' }}>
                
                {/* Workspace Container for Two-Layer Frame vs Content */}
                <div style={{
                  width: '100%', height: '240px', backgroundColor: '#171717',
                  borderRadius: '0.5rem', border: '1px solid #525252', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', position: 'relative', boxSizing: 'border-box'
                }}>
                  
                  {/* OUTER FRAME (Viewing Window / Bounding Box) */}
                  <div 
                    onMouseDown={(e) => handleMouseDown(e, null)}
                    onWheel={handleWheel}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{
                      position: 'relative',
                      width: `${frameWidth}px`,
                      height: `${frameHeight}px`,
                      border: '2px solid #834655',
                      backgroundColor: '#111',
                      overflow: 'hidden',
                      cursor: isDraggingContent ? 'grabbing' : 'grab',
                      boxSizing: 'border-box',
                      touchAction: 'none'
                    }}
                  >
                    {/* INNER CONTENT (Panned & Scaled Image) */}
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none'
                    }}>
                      <img 
                        src={imageSource} 
                        alt="Content Preview" 
                        draggable={false}
                        style={{ 
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          filter: isTransparent ? 'drop-shadow(0px 0px 2px rgba(255,255,255,0.5))' : 'none'
                        }} 
                      />
                    </div>

                    {/* PINK ANCHOR HANDLES Locked to Frame Corners */}
                    <div onMouseDown={(e) => handleMouseDown(e, 'tl')} style={{ position: 'absolute', top: -5, left: -5, width: 10, height: 10, backgroundColor: '#f472b6', border: '1px solid #834655', borderRadius: '50%', cursor: 'nwse-resize', zIndex: 10 }} />
                    <div onMouseDown={(e) => handleMouseDown(e, 'tm')} style={{ position: 'absolute', top: -5, left: 'calc(50% - 5px)', width: 10, height: 10, backgroundColor: '#f472b6', border: '1px solid #834655', borderRadius: '50%', cursor: 'ns-resize', zIndex: 10 }} />
                    <div onMouseDown={(e) => handleMouseDown(e, 'tr')} style={{ position: 'absolute', top: -5, right: -5, width: 10, height: 10, backgroundColor: '#f472b6', border: '1px solid #834655', borderRadius: '50%', cursor: 'nesw-resize', zIndex: 10 }} />
                    <div onMouseDown={(e) => handleMouseDown(e, 'ml')} style={{ position: 'absolute', top: 'calc(50% - 5px)', left: -5, width: 10, height: 10, backgroundColor: '#f472b6', border: '1px solid #834655', borderRadius: '50%', cursor: 'ew-resize', zIndex: 10 }} />
                    <div onMouseDown={(e) => handleMouseDown(e, 'mr')} style={{ position: 'absolute', top: 'calc(50% - 5px)', right: -5, width: 10, height: 10, backgroundColor: '#f472b6', border: '1px solid #834655', borderRadius: '50%', cursor: 'ew-resize', zIndex: 10 }} />
                    <div onMouseDown={(e) => handleMouseDown(e, 'bl')} style={{ position: 'absolute', bottom: -5, left: -5, width: 10, height: 10, backgroundColor: '#f472b6', border: '1px solid #834655', borderRadius: '50%', cursor: 'nesw-resize', zIndex: 10 }} />
                    <div onMouseDown={(e) => handleMouseDown(e, 'bm')} style={{ position: 'absolute', bottom: -5, left: 'calc(50% - 5px)', width: 10, height: 10, backgroundColor: '#f472b6', border: '1px solid #834655', borderRadius: '50%', cursor: 'ns-resize', zIndex: 10 }} />
                    <div onMouseDown={(e) => handleMouseDown(e, 'br')} style={{ position: 'absolute', bottom: -5, right: -5, width: 10, height: 10, backgroundColor: '#f472b6', border: '1px solid #834655', borderRadius: '50%', cursor: 'nwse-resize', zIndex: 10 }} />
                  </div>

                </div>
              </div>
            )}

            {/* Bottom Sourcing Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', width: '100%', boxSizing: 'border-box' }}>
              <button
                onClick={removeWhiteBackground}
                disabled={!imageSource || isTransparent}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(251, 207, 232, 0.4)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: isTransparent ? '#737373' : '#fbcfe8',
                  backgroundColor: isTransparent ? 'rgba(64, 64, 64, 0.4)' : 'transparent',
                  borderColor: isTransparent ? '#525252' : 'rgba(251, 207, 232, 0.4)',
                  cursor: (imageSource && !isTransparent) ? 'pointer' : 'default',
                  opacity: imageSource ? 1 : 0.4
                }}
              >
                {isTransparent ? 'BG Removed' : 'Remove BG'}
              </button>

              <button
                onClick={() => { if (imageSource) { setCurrentView('details'); } }}
                disabled={!imageSource}
                title="Details"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(251, 207, 232, 0.4)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.875rem',
                  cursor: imageSource ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: imageSource ? 1 : 0.4
                }}
              >
                <img src="/next-icon.png" alt="Details" style={{ width: '1.25rem', height: '1.25rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='>'; e.target.parentElement.style.color='#fbcfe8';}} />
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW 4: ITEM DETAILS & FINAL SAVE ("Details") ================= */}
        {currentView === 'details' && (
          <div style={{
            backgroundColor: 'rgba(38, 38, 38, 0.85)',
            border: '1px solid rgba(82, 82, 82, 0.4)',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #404040', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => { setCurrentView('editImage'); }}
                title="Back"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <img src="/back-icon.png" alt="Back" style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='←'; e.target.parentElement.style.color='#fbcfe8'; e.target.parentElement.style.fontSize='1.25rem';}} />
              </button>
              <BrushHeader text="Details" />
              <div style={{ width: '1.5rem' }}></div>
            </div>

            {imageSource && (
              <div style={{
                width: '100%', height: '130px', backgroundColor: isTransparent ? 'transparent' : 'rgba(23, 23, 23, 0.6)',
                borderRadius: '0.5rem', border: '1px solid #525252', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxSizing: 'border-box'
              }}>
                <img 
                  src={imageSource} 
                  alt="Item Preview" 
                  style={{ 
                    maxHeight: '100%', maxWidth: '100%', 
                    objectFit: 'contain',
                    transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`, 
                    filter: isTransparent ? 'drop-shadow(0px 0px 2px rgba(255,255,255,0.5))' : 'none' 
                  }} 
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
              {/* Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', boxSizing: 'border-box' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Category *</label>
                <select
                  disabled={!isDetailsEditable}
                  value={selectedCategory}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setSelectedCategory(cat);
                    setSelectedSubCategory('');
                  }}
                  style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: isDetailsEditable ? '#e5e5e5' : '#a3a3a3', outline: 'none', opacity: isDetailsEditable ? 1 : 0.7 }}
                >
                  <option value="" disabled>Select Category...</option>
                  {Object.keys(MATRIX_CATEGORY_MAP).map(cat => (
                    <option key={cat} value={cat} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sub-Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', boxSizing: 'border-box' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: selectedCategory ? '#d4d4d4' : '#737373' }}>Sub-Category</label>
                <select
                  disabled={!isDetailsEditable || !selectedCategory}
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: isDetailsEditable ? '#e5e5e5' : '#a3a3a3', outline: 'none', opacity: (isDetailsEditable && selectedCategory) ? 1 : 0.5 }}
                >
                  <option value="" disabled>{selectedCategory ? 'Select Sub-Category...' : 'Select Category first'}</option>
                  {selectedCategory && MATRIX_CATEGORY_MAP[selectedCategory].map(sub => (
                    <option key={sub} value={sub} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Sizing Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', boxSizing: 'border-box' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Size *</label>
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%', boxSizing: 'border-box' }}>
                  <select
                    disabled={!isDetailsEditable}
                    value={selectedSizeType}
                    onChange={(e) => {
                      setSelectedSizeType(e.target.value);
                      setSelectedSize('');
                    }}
                    style={{ width: '110px', boxSizing: 'border-box', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.5rem', fontSize: '0.875rem', color: isDetailsEditable ? '#e5e5e5' : '#a3a3a3', outline: 'none', opacity: isDetailsEditable ? 1 : 0.7 }}
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
                    style={{ flex: 1, boxSizing: 'border-box', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: isDetailsEditable ? '#e5e5e5' : '#a3a3a3', outline: 'none', opacity: (isDetailsEditable && selectedSizeType) ? 1 : 0.5 }}
                  >
                    <option value="" disabled>{selectedSizeType ? 'Select size...' : 'Select standard first'}</option>
                    {selectedSizeType && (LOCALIZED_SIZES[selectedSizeType] || []).map(sz => (
                      <option key={sz} value={sz} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{sz}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Color * */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', boxSizing: 'border-box' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Color *</label>
                <select
                  disabled={!isDetailsEditable}
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: isDetailsEditable ? '#e5e5e5' : '#a3a3a3', outline: 'none', opacity: isDetailsEditable ? 1 : 0.7 }}
                >
                  <option value="" disabled>Select color...</option>
                  {RESTRICTED_COLORS.map(col => (
                    <option key={col} value={col} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', boxSizing: 'border-box' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Notes</label>
                <input
                  type="text"
                  disabled={!isDetailsEditable}
                  placeholder="e.g., pairs well with straight-leg denim"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: isDetailsEditable ? '#e5e5e5' : '#a3a3a3', outline: 'none', opacity: isDetailsEditable ? 1 : 0.7 }}
                />
              </div>
            </div>

            {/* Bottom Bar with Bin & Check Mark */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', width: '100%', boxSizing: 'border-box' }}>
              <button
                onClick={() => {
                  if (!isDetailsEditable) {
                    setIsDetailsEditable(true);
                  } else {
                    setCurrentView('source');
                  }
                }}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Bin Icon Button */}
                {activeItemId && (
                  <button
                    onClick={() => setItemToDelete(wardrobeItems.find(i => i.id === activeItemId))}
                    title="Delete item"
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                    }}
                  >
                    <img src="/bin-icon.png" alt="Delete" style={{ width: '1.75rem', height: '1.75rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='🗑️'; e.target.parentElement.style.fontSize='1.5rem';}} />
                  </button>
                )}

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
                    <img src="/check-mark-icon.png" alt="Done" style={{ width: '2.5rem', height: '2.5rem', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='✓'; e.target.parentElement.style.color='#fbcfe8'; e.target.parentElement.style.fontSize='2.0rem';}} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Global Deletion Warning Popup when triggered from Details page */}
      {itemToDelete && currentView === 'details' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{
            backgroundColor: '#262626', border: '1px solid #834655', borderRadius: '1rem',
            padding: '1.5rem', width: '90%', maxWidth: '320px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '2rem' }}>⚠️</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#fbcfe8', margin: 0 }}>Delete Item?</h3>
            <p style={{ fontSize: '0.85rem', color: '#a3a3a3', margin: 0 }}>Warning: This action cannot be undone. Are you sure you want to permanently delete this piece from your wardrobe?</p>
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
              <button onClick={() => setItemToDelete(null)} style={{ flex: 1, padding: '0.625rem', backgroundColor: 'rgba(64,64,64,0.6)', border: '1px solid #525252', borderRadius: '0.5rem', color: '#e5e5e5', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
              <button onClick={confirmAndDeleteItem} style={{ flex: 1, padding: '0.625rem', backgroundColor: 'rgba(131, 70, 85, 0.9)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '0.5rem', color: '#ffe4e6', cursor: 'pointer', fontWeight: '500' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}