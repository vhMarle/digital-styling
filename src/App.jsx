import React, { useState } from 'react';

export default function App() {
  const [items, setItems] = useState([]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Digital Styling - Smart Wardrobe Planner</h1>
      <p>Welcome to your personal digital wardrobe!</p>
    </div>
  );
}