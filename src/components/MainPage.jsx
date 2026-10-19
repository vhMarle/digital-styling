import React from 'react';
import customPlusIcon from '../assets/icons/plus-custom.svg'; // Or .png

export default function MainPage({ onOpenUpload }) {
  return (
    <div className="app-container" style={{ justifyContent: 'space-between', padding: '24px' }}>
      <div>
        <h1 className="handwritten-header">SPARKS &amp; SEQUINS</h1>
        <p style={{ textAlign: 'center', color: '#64748B' }}>Your digital wardrobe and outfit planner.</p>
      </div>

      {/* Main Content / Wardrobe Grid placeholder */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#94A3B8' }}>No items added yet. Tap below to add your first piece!</p>
      </div>

      {/* Floating Action / Navigation Footer with Custom Plus Icon */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
        <button className="custom-fab" onClick={onOpenUpload} title="Add Item">
          <img src={customPlusIcon} alt="Add Item" className="custom-plus-icon" />
        </button>
      </div>
    </div>
  );
}