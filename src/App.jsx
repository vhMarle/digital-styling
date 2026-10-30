// src/App.jsx
import React, { useState, useEffect } from 'react';
import MainPage from './pages/MainPage';
import AddItem from './components/AddItem';

export default function App() {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  
  // Load wardrobe items from localStorage
  const [wardrobeItems, setWardrobeItems] = useState(() => {
    try {
      const saved = localStorage.getItem('sparks_wardrobe_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse wardrobe from localStorage", e);
      return [];
    }
  });

  // Keep localStorage updated
  useEffect(() => {
    localStorage.setItem('sparks_wardrobe_items', JSON.stringify(wardrobeItems));
  }, [wardrobeItems]);

  const handleAddItem = (newItem) => {
    setWardrobeItems((prev) => [newItem, ...prev]);
    setIsAddItemOpen(false);
  };

  const handleRemoveItem = (itemId) => {
    setWardrobeItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif' }}>
      <MainPage
        wardrobeItems={wardrobeItems}
        onOpenAddItem={() => setIsAddItemOpen(true)}
        onRemoveItem={handleRemoveItem}
      />

      {isAddItemOpen && (
        <AddItem
          onClose={() => setIsAddItemOpen(false)}
          onAddItem={handleAddItem}
        />
      )}
    </div>
  );
}