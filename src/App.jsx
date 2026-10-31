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
    { id: 1, category: 'Tops', sub_category: 'Shirts', size_type: '', size: '', color: 'White', notes: 'Oversized white button-down', image_url: 'https://via.placeholder.com/150', zoom_level: 1, frame_width: 260, frame_height: 180, pan_x: 0, pan_y: 0, is_transparent: false },
    { id: 2, category: 'Bottoms', sub_category: 'Pants', size_type: '', size: '', color: 'Blue', notes: 'Straight-leg denim', image_url: 'https://via.placeholder.com/150', zoom_level: 1, frame_width: 260, frame_height: 180, pan_x: 0, pan_y: 0, is_transparent: false }
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

    const channel = supabase
      .channel('public:wardrobe_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wardrobe_items' },
        () => {
          fetchWardrobe();
        }
      )
      .subscribe();

    const keepAliveInterval = setInterval(async () => {
      try {
        await supabase.from('wardrobe_items').select('id').limit(1);
      } catch (err) {
        // Ignore background ping errors
      }
    }, 15 * 60 * 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(keepAliveInterval);
    };
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
    if (!imageSource || isTransparent) return;
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderBottom: '1px solid #333', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', height: '6.5rem' }}>
                <img src="/spark-and-sequins-logo.png" alt="Sparks & Sequins" style={{ height: '6.0rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='block';}} />
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

        {/* ================= VIEW 2: SOURCING STAGE ================= */}
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
                <img src="/home-icon.png" alt="Home" style={{ height: '2.5rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='🏠'; e.target.parentElement.style.color='#fbcfe8'; e.target.parentElement.style.fontSize='1.5rem';}} />
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/import-from-header.png" alt="Import from" style={{ height: '2.5rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='block';}} />
                <h2 style={{ display: 'none', fontSize: '1.85rem', fontWeight: '800', fontFamily: 'Georgia, serif', color: '#834655', margin: 0, fontStyle: 'italic' }}>Import from...</h2>
              </div>

              <div style={{ width: '2.5rem' }}></div>
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

        {/* ================= VIEW 3: IMAGE EDITING STAGE ================= */}
        {currentView === 'editImage' && (
          <div style={{
            backgroundColor: 'rgba(38, 38, 38, 0.85)',
            border: '1px solid rgba(82, 82, 82, 0.4)',
            borderRadius: '1rem',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #404040', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCurrentView('source')}
                style={{ background: 'transparent', border: 'none', color: '#fbcfe8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
              >
                ← Back
              </button>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fbcfe8', margin: 0 }}>Adjust Image</h2>
              <button
                type="button"
                onClick={() => setCurrentView('details')}
                style={{
                  backgroundColor: '#834655', border: '1px solid rgba(244, 63, 94, 0.4)',
                  borderRadius: '0.5rem', padding: '0.375rem 0.75rem', color: '#ffe4e6', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Next →
              </button>
            </div>

            <div 
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              style={{
                width: '100%',
                height: '260px',
                backgroundColor: 'rgba(23, 23, 23, 0.8)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid #525252'
              }}
            >
              <div
                onMouseDown={(e) => handleMouseDown(e, null)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  width: `${frameWidth}px`,
                  height: `${frameHeight}px`,
                  border: '2px dashed rgba(244, 63, 94, 0.8)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'move',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isTransparent ? 'transparent' : 'rgba(0,0,0,0.2)'
                }}
              >
                {imageSource && (
                  <img
                    src={imageSource}
                    alt="To edit"
                    style={{
                      maxWidth: 'none',
                      maxHeight: 'none',
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                      pointerEvents: 'none',
                      filter: isTransparent ? 'drop-shadow(0px 0px 2px rgba(255,255,255,0.5))' : 'none'
                    }}
                  />
                )}

                {/* Resizing Handles */}
                <div onMouseDown={(e) => handleMouseDown(e, 'nw')} style={{ position: 'absolute', top: 0, left: 0, width: '12px', height: '12px', cursor: 'nwse-resize', zIndex: 3 }} />
                <div onMouseDown={(e) => handleMouseDown(e, 'ne')} style={{ position: 'absolute', top: 0, right: 0, width: '12px', height: '12px', cursor: 'nesw-resize', zIndex: 3 }} />
                <div onMouseDown={(e) => handleMouseDown(e, 'sw')} style={{ position: 'absolute', bottom: 0, left: 0, width: '12px', height: '12px', cursor: 'nesw-resize', zIndex: 3 }} />
                <div onMouseDown={(e) => handleMouseDown(e, 'se')} style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', cursor: 'nwse-resize', zIndex: 3 }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <button
                type="button"
                onClick={removeWhiteBackground}
                style={{
                  flex: 1, padding: '0.625rem', backgroundColor: 'rgba(64,64,64,0.6)',
                  border: '1px solid #525252', borderRadius: '0.5rem', color: '#e5e5e5',
                  fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer'
                }}
              >
                🪄 Remove BG
              </button>
              <button
                type="button"
                onClick={resetEditor}
                style={{
                  padding: '0.625rem 1rem', backgroundColor: 'rgba(64,64,64,0.6)',
                  border: '1px solid #525252', borderRadius: '0.5rem', color: '#e5e5e5',
                  fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>Zoom: {zoom.toFixed(2)}x</label>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#834655' }}
              />
            </div>
          </div>
        )}

        {/* ================= VIEW 4: DETAILS & METADATA FORM ================= */}
        {currentView === 'details' && (
          <div style={{
            backgroundColor: 'rgba(38, 38, 38, 0.85)',
            border: '1px solid rgba(82, 82, 82, 0.4)',
            borderRadius: '1rem',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #404040', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCurrentView('editImage')}
                style={{ background: 'transparent', border: 'none', color: '#fbcfe8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
              >
                ← Back
              </button>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fbcfe8', margin: 0 }}>Item Details</h2>
              <button
                type="button"
                onClick={handleSaveToDatabase}
                style={{
                  backgroundColor: '#834655', border: '1px solid rgba(244, 63, 94, 0.4)',
                  borderRadius: '0.5rem', padding: '0.375rem 0.75rem', color: '#ffe4e6', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Save ✨
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Category Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubCategory('');
                  }}
                  style={{ width: '100%', backgroundColor: '#262626', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.5rem', color: '#e5e5e5', fontSize: '0.85rem' }}
                >
                  <option value="">Select Category...</option>
                  {Object.keys(MATRIX_CATEGORY_MAP).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sub-Category Dropdown */}
              {selectedCategory && MATRIX_CATEGORY_MAP[selectedCategory] && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>Sub-Category</label>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#262626', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.5rem', color: '#e5e5e5', fontSize: '0.85rem' }}
                  >
                    <option value="">Select Sub-Category...</option>
                    {MATRIX_CATEGORY_MAP[selectedCategory].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Size Type Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>Size System</label>
                <select
                  value={selectedSizeType}
                  onChange={(e) => {
                    setSelectedSizeType(e.target.value);
                    setSelectedSize('');
                  }}
                  style={{ width: '100%', backgroundColor: '#262626', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.5rem', color: '#e5e5e5', fontSize: '0.85rem' }}
                >
                  <option value="">Select Size System...</option>
                  {SIZE_TYPES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Specific Size Dropdown */}
              {selectedSizeType && LOCALIZED_SIZES[selectedSizeType] && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#262626', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.5rem', color: '#e5e5e5', fontSize: '0.85rem' }}
                  >
                    <option value="">Select Size...</option>
                    {LOCALIZED_SIZES[selectedSizeType].map(sz => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Color Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>Color Family</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#262626', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.5rem', color: '#e5e5e5', fontSize: '0.85rem' }}
                >
                  <option value="">Select Color...</option>
                  {RESTRICTED_COLORS.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Notes Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>Notes / Description</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add styling notes..."
                  rows="3"
                  style={{ width: '100%', backgroundColor: '#262626', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.5rem', color: '#e5e5e5', fontSize: '0.85rem', resize: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}