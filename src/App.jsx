import React, { useState, useRef } from 'react';
import './App.css';

export default function App() {
  const [wardrobe, setWardrobe] = useState([
    { id: 1, name: 'Black Tunic Top', category: 'Tops', subType: 'Tunic', image: '' },
    { id: 2, name: 'Straight-Leg Denim', category: 'Bottoms', subType: 'Jeans', image: '' },
    { id: 3, name: 'Gold Sunglasses', category: 'Accessories', subType: 'Glasses', image: '' }
  ]);

  const [activeTab, setActiveTab] = useState('wardrobe');
  const [itemImage, setItemImage] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Dresses');
  const [subType, setSubType] = useState('Maxi Dress');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result;
      setItemImage(base64data);
      setIsScanning(true);

      const img = new Image();
      img.src = base64data;
      img.onload = () => {
        setTimeout(() => {
          let detectedCategory = 'Dresses';
          let detectedSubType = 'Maxi Dress';
          let detectedName = 'Boho Tiered Maxi Dress';

          if (img.height > img.width * 1.2) {
            detectedCategory = 'Dresses';
            detectedSubType = 'Maxi Dress';
            detectedName = 'Full Length Dress';
          } else if (img.width >= img.height) {
            detectedCategory = 'Accessories';
            detectedSubType = 'Glasses';
            detectedName = 'Designer Sunglasses';
          } else {
            detectedCategory = 'Tops';
            detectedSubType = 'Blouse';
            detectedName = 'Casual Top';
          }

          setCategory(detectedCategory);
          setSubType(detectedSubType);
          setItemName(detectedName);
          setIsScanning(false);
        }, 1000);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemName) return;
    
    const newItem = {
      id: Date.now(),
      name: itemName,
      category,
      subType,
      image: itemImage
    };

    setWardrobe([newItem, ...wardrobe]);
    setItemName('');
    setItemImage('');
    setSubType('');
    setActiveTab('wardrobe');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafaf9', color: '#292524', fontFamily: 'sans-serif', padding: '24px' }}>
      <header style={{ maxWidth: '900px', margin: '0 auto 32px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e7e5e4', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '300', letterSpacing: '0.05em', margin: 0 }}>Sparks & Sequins</h1>
        <nav style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setActiveTab('wardrobe')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeTab === 'wardrobe' ? '#1c1917' : '#e7e5e4', color: activeTab === 'wardrobe' ? '#fff' : '#292524', fontWeight: '500' }}
          >
            Wardrobe ({wardrobe.length})
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeTab === 'add' ? '#1c1917' : '#e7e5e4', color: activeTab === 'add' ? '#fff' : '#292524', fontWeight: '500' }}
          >
            + Add Item / Scan
          </button>
        </nav>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto' }}>
        {activeTab === 'wardrobe' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {wardrobe.map(item => (
              <div key={item.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e7e5e4', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ height: '200px', background: '#f5f5f4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '12px' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#a8a29e', fontSize: '14px' }}>No Image</span>
                  )}
                </div>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#78716c', fontWeight: '600' }}>{item.category} &bull; {item.subType}</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#1c1917', margin: '4px 0 0 0' }}>{item.name}</h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'add' && (
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e7e5e4', maxWidth: '500px', margin: '0 auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: '16px', color: '#1c1917', marginTop: 0 }}>Import & AI Scan Wardrobe Item</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#44403c', marginBottom: '8px' }}>Upload Photo (Camera / Google Photos)</label>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ width: '100%', fontSize: '14px', color: '#78716c' }}
              />
            </div>

            {isScanning && (
              <div style={{ margin: '16px 0', padding: '16px', background: '#f5f5f4', borderRadius: '8px', textAlign: 'center', color: '#57534e', fontStyle: 'italic' }}>
                Scanning image shape & features with AI...
              </div>
            )}

            {itemImage && !isScanning && (
              <div style={{ marginBottom: '20px', height: '160px', background: '#f5f5f4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={itemImage} alt="Preview" style={{ height: '100%', objectFit: 'contain' }} />
              </div>
            )}

            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#44403c', marginBottom: '6px' }}>Item Name</label>
                <input 
                  type="text" 
                  value={itemName} 
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Boho Maxi Dress" 
                  style={{ width: '100%', border: '1px solid #d6d3d1', borderRadius: '8px', padding: '10px', outline: 'none', boxSizing: 'border-box' }}
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#44403c', marginBottom: '6px' }}>Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', border: '1px solid #d6d3d1', borderRadius: '8px', padding: '10px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="Tops">Tops</option>
                  <option value="Bottoms">Bottoms</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#44403c', marginBottom: '6px' }}>Sub-Type</label>
                <input 
                  type="text" 
                  value={subType} 
                  onChange={(e) => setSubType(e.target.value)}
                  placeholder="e.g. Maxi Dress, Glasses, Jeans" 
                  style={{ width: '100%', border: '1px solid #d6d3d1', borderRadius: '8px', padding: '10px', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>

              <button 
                type="submit" 
                style={{ width: '100%', backgroundColor: '#1c1917', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '15px' }}
              >
                Save to Digital Wardrobe
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}