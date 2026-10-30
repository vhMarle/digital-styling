import React, { useState } from 'react';

// Categories for filtering and form selection
const CATEGORIES = ['All', 'Tops & Blouses', 'Bottoms & Denim', 'Outerwear & Dusters', 'Dresses & Jumpsuits', 'Footwear'];
const COLORS = ['Cool Neutrals', 'Navy Blue', 'Forest Green', 'Rich Burgundy', 'Sage / Olive Green', 'Rose Pink', 'Chocolate Brown', 'Metallic Silver/Gold'];

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'add', 'details'
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedSource, setSelectedSource] = useState(null);
  
  // Sample wardrobe items to populate the grid
  const [wardrobeItems, setWardrobeItems] = useState([
    { id: 1, category: 'Tops & Blouses', color: 'Cool Neutrals', notes: 'Oversized white button-down' },
    { id: 2, category: 'Bottoms & Denim', color: 'Navy Blue', notes: 'Straight-leg denim' },
    { id: 3, category: 'Outerwear & Dusters', color: 'Rich Burgundy', notes: 'Long open duster' }
  ]);

  const [newItem, setNewItem] = useState({
    category: 'Tops & Blouses',
    color: 'Cool Neutrals',
    notes: ''
  });

  const handleSourceSelect = (sourceType) => {
    setSelectedSource(sourceType);
    setCurrentView('details');
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    setWardrobeItems(prev => [
      { id: Date.now(), ...newItem },
      ...prev
    ]);
    setNewItem({ category: 'Tops & Blouses', color: 'Cool Neutrals', notes: '' });
    setCurrentView('home');
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
      <div style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        
        {/* VIEW 1: Main Homepage Wardrobe Dashboard */}
        {currentView === 'home' && (
          <>
            {/* Header with Title and Floating + Add Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #333' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#fbcfe8', margin: 0 }}>Sparks & Sequins</h2>
                <p style={{ fontSize: '0.75rem', color: '#a3a3a3', margin: 0 }}>Digital Wardrobe Curation</p>
              </div>
              <button
                onClick={() => setCurrentView('add')}
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

            {/* Filter Buttons at Top */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
              scrollbarWidth: 'none'
            }}>
              {CATEGORIES.map(cat => (
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

            {/* Wardrobe Item Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              paddingTop: '0.5rem'
            }}>
              {filteredItems.map(item => (
                <div key={item.id} style={{
                  backgroundColor: 'rgba(38, 38, 38, 0.85)',
                  border: '1px solid rgba(82, 82, 82, 0.4)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{
                    height: '100px',
                    backgroundColor: 'rgba(23, 23, 23, 0.6)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#737373',
                    fontSize: '0.75rem'
                  }}>
                    Item Photo
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#fbcfe8' }}>{item.category}</span>
                  <span style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>{item.color}</span>
                  {item.notes && <span style={{ fontSize: '0.7rem', color: '#737373', fontStyle: 'italic' }}>{item.notes}</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* VIEW 2: Source Selection (Take Photo / Upload) */}
        {currentView === 'add' && (
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
                onClick={() => setCurrentView('home')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.375rem'
                }}
              >
                <img 
                  src="/undo-arrow-icon.png" 
                  alt="Back" 
                  style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }}
                />
                <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#fbcfe8' }}>Home</span>
              </button>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#fbcfe8', margin: 0 }}>Catalog New Item</h3>
              <div style={{ width: '2rem' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                onClick={() => handleSourceSelect('camera')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem 1rem',
                  backgroundColor: 'rgba(64, 64, 64, 0.4)',
                  border: '1px solid rgba(115, 115, 115, 0.4)',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  color: '#e5e5e5'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📷</div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Take Photo</span>
              </button>

              <button
                onClick={() => handleSourceSelect('upload')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem 1rem',
                  backgroundColor: 'rgba(64, 64, 64, 0.4)',
                  border: '1px solid rgba(115, 115, 115, 0.4)',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  color: '#e5e5e5'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📂</div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Upload Image</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: Item Details Form */}
        {currentView === 'details' && (
          <form onSubmit={handleSaveItem} style={{
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
                onClick={() => setCurrentView('add')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.375rem'
                }}
              >
                <img 
                  src="/undo-arrow-icon.png" 
                  alt="Back" 
                  style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain' }}
                />
                <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#fbcfe8' }}>Back</span>
              </button>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#fbcfe8', margin: 0 }}>Item Details</h3>
              <span style={{ fontSize: '0.75rem', color: '#a3a3a3', textTransform: 'capitalize' }}>{selectedSource}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(23, 23, 23, 0.8)',
                    border: '1px solid #525252',
                    borderRadius: '0.5rem',
                    padding: '0.625rem 0.75rem',
                    fontSize: '0.875rem',
                    color: '#e5e5e5',
                    outline: 'none'
                  }}
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Color</label>
                <select
                  value={newItem.color}
                  onChange={(e) => setNewItem(prev => ({ ...prev, color: e.target.value }))}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(23, 23, 23, 0.8)',
                    border: '1px solid #525252',
                    borderRadius: '0.5rem',
                    padding: '0.625rem 0.75rem',
                    fontSize: '0.875rem',
                    color: '#e5e5e5',
                    outline: 'none'
                  }}
                >
                  {COLORS.map(col => (
                    <option key={col} value={col} style={{ backgroundColor: '#262626', color: '#e5e5e5' }}>{col}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d4d4d4' }}>Notes / Styling Cues</label>
                <input
                  type="text"
                  placeholder="e.g., pairs well with straight-leg denim"
                  value={newItem.notes}
                  onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(23, 23, 23, 0.8)',
                    border: '1px solid #525252',
                    borderRadius: '0.5rem',
                    padding: '0.625rem 0.75rem',
                    fontSize: '0.875rem',
                    color: '#e5e5e5',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(136, 19, 55, 0.7)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                borderRadius: '0.75rem',
                fontWeight: '500',
                color: '#ffe4e6',
                cursor: 'pointer'
              }}
            >
              Save to Wardrobe
            </button>
          </form>
        )}

      </div>
    </div>
  );
}