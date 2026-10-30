// src/pages/MainPage.jsx
import React, { useState } from 'react';

const CATEGORIES = ['All', 'Bottoms', 'Dresses', 'Tops', 'Bags', 'Shoes'];

export default function MainPage({ wardrobeItems = [], onOpenAddItem, onRemoveItem }) {
  const [activeTab, setActiveTab] = useState('All');
  const [itemToDelete, setItemToDelete] = useState(null);

  // Filter items based on active tab
  const filteredItems = activeTab === 'All'
    ? wardrobeItems
    : wardrobeItems.filter((item) => item && item.category === activeTab);

  const confirmDelete = () => {
    if (itemToDelete) {
      onRemoveItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 10000, padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px',
            maxWidth: '340px', width: '100%', textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', border: '2px solid #7a1c4b'
          }}>
            <div style={{
              width: '48px', height: '48px', margin: '0 auto 8px auto', borderRadius: '50%',
              backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7a1c4b" strokeWidth="3.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 8px 0', color: '#7a1c4b', fontSize: '18px' }}>Remove Item?</h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '13px' }}>
              Are you sure you want to delete this item from your wardrobe?
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setItemToDelete(null)}
                style={{
                  flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1',
                  borderRadius: '12px', padding: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1, backgroundColor: '#dc2626', color: '#ffffff', border: 'none',
                  borderRadius: '12px', padding: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#7a1c4b' }}>Sparks & Sequins ✨</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Digital Wardrobe & Outfit Planner</p>
        </div>
        <button
          onClick={onOpenAddItem}
          style={{
            backgroundColor: '#7a1c4b',
            color: '#ffffff',
            border: 'none',
            borderRadius: '20px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}
        >
          + Add New Item
        </button>
      </header>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            style={{
              backgroundColor: activeTab === cat ? '#1b2a4a' : '#ffffff',
              color: activeTab === cat ? '#ffffff' : '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '16px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat} {cat === 'All' ? `(${wardrobeItems.length})` : ''}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #cbd5e1', borderRadius: '16px', backgroundColor: '#ffffff' }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>No items in {activeTab} yet.</p>
          <button
            onClick={onOpenAddItem}
            style={{ marginTop: '12px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer' }}
          >
            Add Your First Item
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                position: 'relative'
              }}
            >
              {/* Image Preview Container */}
              <div style={{ height: '180px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                <img src={item.image_url} alt={item.subcategory || item.category} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>

              {/* Card Footer with Details & Bottom-Right Truly Transparent Minus Icon */}
              <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#7a1c4b' }}>{item.category}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{item.subcategory || 'Item'}</div>
                  {item.color && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{item.color}</div>}
                </div>

                {/* Truly Transparent Maroon Minus Button */}
                <button
                  onClick={() => setItemToDelete(item)}
                  title="Remove Item"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center'
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7a1c4b" strokeWidth="4" strokeLinecap="round">
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}