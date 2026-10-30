import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Ensure your env variables or keys are set)
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Hierarchical Categories & Sub-categories
const CATEGORY_MAP = {
  'Tops & Blouses': ['Blouses', 'T-Shirts & Tanks', 'Sweaters & Cardigans', 'Shirts'],
  'Bottoms & Denim': ['Straight-Leg Denim', 'Bootcut Jeans', 'Trousers', 'Skirts', 'Shorts'],
  'Outerwear & Dusters': ['Long Open Dusters', 'Blazers', 'Jackets', 'Coats'],
  'Dresses & Jumpsuits': ['Casual Dresses', 'Evening Dresses', 'Jumpsuits'],
  'Footwear': ['Adidas Sneakers', 'Leopard Sandals', 'Boots', 'Heels', 'Flats']
};

const COLORS = ['Cool Neutrals', 'Navy Blue', 'Forest Green', 'Rich Burgundy', 'Sage / Olive Green', 'Rose Pink', 'Chocolate Brown', 'Metallic Silver/Gold'];

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'source', 'details'
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [wardrobeItems, setWardrobeItems] = useState([]);
  
  // Image & Editing State
  const [imageSource, setImageSource] = useState(null); // URL or File preview
  const [zoom, setZoom] = useState(1);
  const [isTransparent, setIsTransparent] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // Details Form State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch items from Supabase on mount
  useEffect(() => {
    fetchWardrobe();
  }, []);

  const fetchWardrobe = async () => {
    try {
      const { data, error } = await supabase.from('wardrobe_items').select('*').order('created_at', { ascending: false });
      if (data) setWardrobeItems(data);
      if (error) console.error('Error fetching from Supabase:', error.message);
    } catch (err) {
      console.error('Supabase connection error:', err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageSource(imageUrl);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInput) {
      setImageSource(urlInput);
      setUrlInput('');
    }
  };

  const handleSaveToDatabase = async () => {
    const newItem = {
      category: selectedCategory,
      sub_category: selectedSubCategory,
      color: selectedColor,
      notes: notes,
      image_url: imageSource || 'https://via.placeholder.com/150',
      is_transparent: isTransparent,
      zoom_level: zoom
    };

    const { data, error } = await supabase.from('wardrobe_items').insert([newItem]).select();
    
    if (error) {
      console.error('Error inserting into Supabase:', error.message);
      // Fallback local addition if offline/testing
      setWardrobeItems(prev => [{ id: Date.now(), ...newItem }, ...prev]);
    } else if (data) {
      setWardrobeItems(prev => [data[0], ...prev]);
    }

    // Reset and return to home
    setCurrentView('home');
    setImageSource(null);
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedColor('');
    setNotes('');
    setZoom(1);
    setIsTransparent(false);
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
      paddingTop: '2rem',
      paddingBottom: '2rem',
      paddingLeft: '1rem',
      paddingRight: '1rem',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* ================= VIEW 1: HOME DASHBOARD ================= */}
        {currentView === 'home' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #333' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#fbcfe8', margin: 0 }}>Sparks & Sequins</h2>
                <p style={{ fontSize: '0.75rem', color: '#a3a3a3', margin: 0 }}>Digital Wardrobe Curation</p>
              </div>
              <button
                onClick={() => setCurrentView('source')}
                title="Add New Item"
                style={{
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(136, 19, 55, 0.8)',
                  border: '1px solid rgba(244, 63, 94, 0.5)',
                  color: '#ffe4e6',
                  fontSize: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}
              >
                +
              </button>
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
              {['All', ...Object.keys(CATEGORY_MAP)].map(cat => (
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
                <div key={item.id || item.created_at} style={{
                  backgroundColor: 'rgba(38, 38, 38, 0.85)',
                  border: '1px solid rgba(82, 82, 82, 0.4)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    height: '110px',
                    backgroundColor: item.is_transparent ? 'transparent' : 'rgba(23, 23, 23, 0.6)',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={item.image_url} 
                      alt={item.category} 
                      style={{ 
                        maxHeight: '100%', 
                        maxWidth: '100%', 
                        transform: `scale(${item.zoom_level || 1})`,
                        filter: item.is_transparent ? 'drop-shadow(0px 0px 2px rgba(255,255,255,0.5))' : 'none'
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#fbcfe8' }}>{item.sub_category || item.category}</span>
                  <span style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>{item.color}</span>
                  {item.notes && <span style={{ fontSize: '0.7rem', color: '#737373', fontStyle: 'italic' }}>{item.notes}</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ================= VIEW 2: ADD ITEM & EDITING SOURCE ================= */}
        {currentView === 'source' && (
          <div style={{
            backgroundColor: 'rgba(38, 38, 38, 0.85)',
            border: '1px solid rgba(82, 82, 82, 0.4)',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #404040', paddingBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => { setCurrentView('home'); setImageSource(null); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <img src="/undo-arrow-icon.png" alt="Home" style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#fbcfe8' }}>Home</span>
              </button>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#fbcfe8', margin: 0 }}>Add New Item</h3>
              <div style={{ width: '2rem' }}></div>
            </div>

            {/* Source Selection Icons */}
            {!imageSource ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Camera Icon Button */}
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '1.5rem 1rem', backgroundColor: 'rgba(64, 64, 64, 0.4)', border: '1px solid rgba(115, 115, 115, 0.4)',
                    borderRadius: '0.75rem', cursor: 'pointer', color: '#e5e5e5'
                  }}>
                    <img src="/camera-icon.png" alt="Take Photo" style={{ width: '2rem', height: '2rem', marginBottom: '0.5rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none';}} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Take Photo</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>

                  {/* Folder Icon Button */}
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '1.5rem 1rem', backgroundColor: 'rgba(64, 64, 64, 0.4)', border: '1px solid rgba(115, 115, 115, 0.4)',
                    borderRadius: '0.75rem', cursor: 'pointer', color: '#e5e5e5'
                  }}>
                    <img src="/folder-icon.png" alt="Browse Files" style={{ width: '2rem', height: '2rem', marginBottom: '0.5rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none';}} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Upload File</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                {/* URL Input Field */}
                <form onSubmit={handleUrlSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    placeholder="Or paste image URL here..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    style={{
                      flex: 1, backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252',
                      borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: '#e5e5e5', outline: 'none'
                    }}
                  />
                  <button type="submit" style={{ padding: '0.625rem 1rem', backgroundColor: '#525252', border: 'none', borderRadius: '0.5rem', color: '#fff', cursor: 'pointer' }}>Load</button>
                </form>
              </div>
            ) : (
              /* Image Editing & Background Removal Tools */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  width: '100%', height: '180px', backgroundColor: isTransparent ? 'transparent' : 'rgba(23, 23, 23, 0.8)',
                  borderRadius: '0.5rem', border: '1px solid #525252', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                }}>
                  <img src={imageSource} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', transform: `scale(${zoom})`, filter: isTransparent ? 'contrast(120%) brightness(110%)' : 'none' }} />
                </div>

                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>Zoom:</span>
                  <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} style={{ padding: '0.25rem 0.75rem', background: '#333', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>-</button>
                  <button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} style={{ padding: '0.25rem 0.75rem', background: '#333', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>+</button>
                  <button
                    onClick={() => setIsTransparent(!isTransparent)}
                    style={{
                      padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: '500',
                      backgroundColor: isTransparent ? 'rgba(52, 211, 153, 0.3)' : 'rgba(64, 64, 64, 0.6)',
                      color: isTransparent ? '#34d399' : '#d4d4d4', border: '1px solid #525252', borderRadius: '0.375rem', cursor: 'pointer'
                    }}
                  >
                    {isTransparent ? 'Background Removed' : 'Remove BG'}
                  </button>
                </div>

                {/* Complete Icon Button to Proceed to Details */}
                <button
                  onClick={() => setCurrentView('details')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    width: '100%', marginTop: '0.5rem', padding: '0.75rem',
                    backgroundColor: 'rgba(136, 19, 55, 0.7)', border: '1px solid rgba(244, 63, 94, 0.4)',
                    borderRadius: '0.75rem', fontWeight: '500', color: '#ffe4e6', cursor: 'pointer'
                  }}
                >
                  <img src="/complete-icon.png" alt="Complete" style={{ width: '1.25rem', height: '1.25rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none';}} />
                  <span>Proceed to Details</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 3: ITEM DETAILS & DATABASE SAVE ================= */}
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
              <button
                type="button"
                onClick={() => setCurrentView('source')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <img src="/undo-arrow-icon.png" alt="Back" style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#fbcfe8' }}>Back</span>
              </button>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#fbcfe8', margin: 0 }}>Item Details</h3>
              <div style={{ width: '2rem' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Category Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory(''); }}
                  style={{ width: '100%', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: '#e5e5e5', outline: 'none' }}
                >
                  <option value="" disabled>Select Category first...</option>
                  {Object.keys(CATEGORY_MAP).map(cat => (
                    <option key={cat} value={cat} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sub-Category Dropdown (Active only after Category is selected) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: selectedCategory ? '#d4d4d4' : '#737373' }}>Sub-Category</label>
                <select
                  disabled={!selectedCategory}
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: selectedCategory ? '#e5e5e5' : '#737373', outline: 'none', opacity: selectedCategory ? 1 : 0.5 }}
                >
                  <option value="" disabled>{selectedCategory ? 'Select Sub-Category...' : 'Select Category first'}</option>
                  {selectedCategory && CATEGORY_MAP[selectedCategory].map(sub => (
                    <option key={sub} value={sub} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Color Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Color</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'rgba(23, 23, 23, 0.8)', border: '1px solid #525252', borderRadius: '0.5rem', padding: '0.625rem 0.75rem', fontSize: '0.875rem', color: '#e5e5e5', outline: 'none' }}
                >
                  <option value="" disabled>Select color...</option>
                  {COLORS.map(col => (
                    <option key={col} value={col} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{col}</option>
                  ))}
                </select>
              </div>

              {/* Notes Input */}
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

            {/* Save to Database Button with add-wardrobe-icon.png */}
            <button
              onClick={handleSaveToDatabase}
              disabled={!selectedCategory || !selectedSubCategory || !selectedColor}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                width: '100%', marginTop: '0.5rem', padding: '0.75rem',
                backgroundColor: selectedCategory && selectedSubCategory && selectedColor ? 'rgba(136, 19, 55, 0.7)' : 'rgba(64, 64, 64, 0.4)',
                border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '0.75rem', fontWeight: '500',
                color: selectedCategory && selectedSubCategory && selectedColor ? '#ffe4e6' : '#737373',
                cursor: selectedCategory && selectedSubCategory && selectedColor ? 'pointer' : 'not-allowed'
              }}
            >
              <img src="/add-wardrobe-icon.png" alt="Save" style={{ width: '1.25rem', height: '1.25rem', objectFit: 'contain' }} onError={(e)=>{e.target.style.display='none';}} />
              <span>Save to Database</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}