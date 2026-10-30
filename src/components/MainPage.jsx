// src/components/MainPage.jsx
import React, { useState } from 'react';
import AddItem from './AddItem';

const INITIAL_ITEMS = [
  { id: '1', category: 'Tops', subcategory: 'Blouses', color: 'Black', image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400' },
  { id: '2', category: 'Tops', subcategory: 'Tanks', color: 'Brown', image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=400' },
  { id: '3', category: 'Dresses', subcategory: 'Casual Dresses', color: 'Beige', image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=400' },
  { id: '4', category: 'Bottoms', subcategory: 'Jeans', color: 'Blue / Denim', image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=400' }
];

const FILTERS = ['All (4)', 'Bottoms', 'Dresses', 'Tops', 'Bags', 'Shoes'];

export default function MainPage() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [activeFilter, setActiveFilter] = useState('All (4)');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleAddItem = (newItem) => {
    setItems((prev) => [newItem, ...prev]);
  };

  const handleDeleteItem = (id) => {
    setItems((prev) => prev.filter(item => item.id !== id));
    setItemToDelete(null);
  };

  const filteredItems = items.filter(item => {
    if (activeFilter.startsWith('All')) return true;
    return item.category.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '24px', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', maxWidth: '1000px', margin: '0 auto 24px auto' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', color: '#7a1c4b', fontWeight: 'bold' }}>Sparks & Sequins ✨</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Digital Wardrobe & Outfit Planner</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            backgroundColor: '#7a1c4b', color: '#ffffff', border: 'none',
            borderRadius: '24px', padding: '12px 20px', fontSize: '14px', fontWeight: 'bold',
            cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          + Add New Item
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', maxWidth: '1000px', margin: '0 auto 24px auto', overflowX: 'auto', paddingBottom: '4px' }}>
        {FILTERS.map((filter) => {
          const isActive = activeFilter.startsWith('All') && filter.startsWith('All') || activeFilter === filter;
          const label = filter.startsWith('All') ? `All (${items.length})` : filter;

          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                backgroundColor: isActive ? '#1b2a4a' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                border: '1px solid #cbd5e1', borderRadius: '20px',
                padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Wardrobe Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '16px', maxWidth: '1000px', margin: '0 auto' }}>
        {filteredItems.map((item) => (
          <div key={item.id} style={{
            backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden',
            border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            position: 'relative', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ height: '220px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={item.image_url} alt={item.subcategory} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#7a1c4b', textTransform: 'uppercase' }}>{item.category}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '2px 0' }}>{item.subcategory}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{item.color}</div>
              </div>
              <button
                onClick={() => setItemToDelete(item.id)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
                title="Delete Item"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <AddItem onClose={() => setIsAddModalOpen(false)} onAddItem={handleAddItem} />
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 1100, padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px',
            maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 20px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '18px' }}>Delete Item?</h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '13px' }}>Are you sure you want to remove this item from your wardrobe?</p>
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
                onClick={() => handleDeleteItem(itemToDelete)}
                style={{
                  flex: 1, backgroundColor: '#dc2626', color: '#ffffff', border: 'none',
                  borderRadius: '12px', padding: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}