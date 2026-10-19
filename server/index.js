<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Wardrobe - Smart Wardrobe Planner</title>
  
  <!-- Favicon for Chrome / Browser Tabs -->
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="shortcut icon" type="image/png" href="/favicon.png">

  <!-- PWA Manifest & Theme Color -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#7c3aed">

  <style>
    :root {
      --primary: #7c3aed;
      --primary-light: #f3e8ff;
      --primary-hover: #6d28d9;
      --bg-main: #fafafa;
      --bg-card: #ffffff;
      --text-main: #1f2937;
      --text-muted: #6b7280;
      --border: #f3f4f6;
      --radius: 16px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
      background: var(--bg-main); 
      color: var(--text-main); 
      display: flex; 
      min-height: 100vh; 
    }

    /* Desktop Sidebar Navigation */
    .sidebar { 
      width: 240px; 
      background: var(--bg-card); 
      border-right: 1px solid var(--border); 
      padding: 1.5rem; 
      display: flex; 
      flex-direction: column; 
      gap: 2rem; 
    }
    .brand { 
      font-size: 1.2rem; 
      font-weight: 800; 
      color: var(--primary); 
      display: flex; 
      align-items: center; 
      gap: 8px; 
    }
    .nav-menu { display: flex; flex-direction: column; gap: 6px; list-style: none; }
    .nav-item { 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      padding: 10px 14px; 
      border-radius: 12px; 
      color: var(--text-muted); 
      font-size: 0.95rem; 
      font-weight: 500; 
      cursor: pointer; 
      transition: 0.2s; 
    }
    .nav-item:hover, .nav-item.active { 
      background: var(--primary-light); 
      color: var(--primary); 
      font-weight: 600; 
    }

    /* Main Content Area */
    .main-wrapper { 
      flex: 1; 
      display: flex; 
      flex-direction: column; 
      overflow-y: auto; 
      padding-bottom: 70px; 
    }
    header { 
      background: var(--bg-card); 
      padding: 1rem 1.5rem; 
      border-bottom: 1px solid var(--border); 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
    }
    .search-bar { 
      background: var(--bg-main); 
      border: 1px solid var(--border); 
      padding: 8px 16px; 
      border-radius: 20px; 
      width: 280px; 
      font-size: 0.9rem; 
    }
    .user-profile { display: flex; align-items: center; gap: 10px; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }

    .content { padding: 1.5rem; max-width: 1100px; margin: 0 auto; width: 100%; }

    /* View Sections */
    .view-section { display: none; }
    .view-section.active { display: block; }

    /* General UI Elements */
    .page-title { font-size: 1.3rem; font-weight: 700; margin-bottom: 1rem; }
    .chip-group { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 1.25rem; }
    .chip { 
      background: var(--bg-card); 
      border: 1px solid var(--border); 
      padding: 8px 18px; 
      border-radius: 20px; 
      font-size: 0.85rem; 
      font-weight: 600; 
      color: var(--text-muted); 
      cursor: pointer; 
      white-space: nowrap; 
    }
    .chip.active { background: var(--primary); color: white; border-color: var(--primary); }

    /* Closet Grid */
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
    .card { 
      background: var(--bg-card); 
      border-radius: var(--radius); 
      overflow: hidden; 
      border: 1px solid var(--border); 
      box-shadow: 0 2px 8px rgba(0,0,0,0.03); 
    }
    .card img { width: 100%; height: 170px; object-fit: cover; background: #f0f0f0; }
    .card-body { padding: 10px; }
    .card-title { font-size: 0.85rem; font-weight: 600; }
    .card-sub { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }

    /* Style Me View */
    .style-card { 
      background: var(--bg-card); 
      border-radius: var(--radius); 
      padding: 1.5rem; 
      border: 1px solid var(--border); 
      margin-bottom: 1rem; 
    }
    .option-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px; margin-top: 10px; }
    .opt-btn { 
      background: var(--bg-main); 
      border: 1px solid var(--border); 
      border-radius: 12px; 
      padding: 12px; 
      text-align: center; 
      font-size: 0.8rem; 
      font-weight: 600; 
      cursor: pointer; 
    }
    .opt-btn.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }

    .btn-primary { 
      background: var(--primary); 
      color: white; 
      border: none; 
      padding: 12px 24px; 
      border-radius: 12px; 
      font-weight: 600; 
      cursor: pointer; 
      width: 100%; 
      font-size: 0.95rem; 
    }

    /* Modal Overlay */
    .modal-overlay { 
      display: none; 
      position: fixed; 
      inset: 0; 
      background: rgba(0,0,0,0.4); 
      align-items: center; 
      justify-content: center; 
      z-index: 1000; 
      padding: 1rem; 
    }
    .modal-overlay.open { display: flex; }
    .modal { 
      background: white; 
      border-radius: 20px; 
      padding: 1.5rem; 
      width: 100%; 
      max-width: 420px; 
      max-height: 90vh; 
      overflow-y: auto; 
    }
    .dropzone { 
      border: 2px dashed #d1d5db; 
      border-radius: 12px; 
      padding: 1.5rem; 
      text-align: center; 
      color: var(--text-muted); 
      font-size: 0.85rem; 
      cursor: pointer; 
      margin-bottom: 1rem; 
      background: var(--bg-main); 
    }

    /* Mobile Bottom Navigation */
    .mobile-nav { 
      display: none; 
      position: fixed; 
      bottom: 0; 
      left: 0; 
      right: 0; 
      background: var(--bg-card); 
      border-top: 1px solid var(--border); 
      padding: 8px 12px; 
      justify-content: space-around; 
      z-index: 900; 
    }
    .mobile-item { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      gap: 4px; 
      font-size: 0.7rem; 
      color: var(--text-muted); 
      cursor: pointer; 
    }
    .mobile-item.active { color: var(--primary); font-weight: 700; }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .mobile-nav { display: flex; }
      .search-bar { display: none; }
    }
  </style>
</head>
<body>

  <!-- Desktop Sidebar -->
  <aside class="sidebar">
    <div class="brand">✦ Digital Wardrobe</div>
    <ul class="nav-menu">
      <li class="nav-item active" onclick="switchTab('closet')">📁 My Closet</li>
      <li class="nav-item" onclick="switchTab('styleme')">✦ Style Me</li>
      <li class="nav-item" onclick="switchTab('insights')">📊 Insights</li>
    </ul>
  </aside>

  <!-- Main Layout -->
  <div class="main-wrapper">
    <header>
      <input type="text" class="search-bar" placeholder="Search your wardrobe...">
      <div class="user-profile">
        <button class="chip" style="background: var(--primary-light); color: var(--primary); border:none;" onclick="loginWithGoogle()">Sign In with Google</button>
      </div>
    </header>

    <div class="content">
      
      <!-- My Closet Section -->
      <section id="closet-view" class="view-section active">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2 class="page-title">My Closet</h2>
          <button class="chip active" onclick="openModal()">+ Add Clothes</button>
        </div>

        <div class="chip-group">
          <button class="chip active" onclick="filterCategory('All')">All</button>
          <button class="chip" onclick="filterCategory('Tops')">Tops</button>
          <button class="chip" onclick="filterCategory('Bottoms')">Bottoms</button>
          <button class="chip" onclick="filterCategory('Outerwear')">Outerwear</button>
          <button class="chip" onclick="filterCategory('Shoes')">Shoes</button>
          <button class="chip" onclick="filterCategory('Accessories')">Accessories</button>
        </div>

        <div class="grid" id="wardrobe-grid"></div>
      </section>

      <!-- Style Me Section -->
      <section id="styleme-view" class="view-section">
        <h2 class="page-title">Style Me ✦</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">Tell us the vibe. Get your custom outfit look.</p>

        <div class="style-card">
          <h3>Select Your Mood</h3>
          <div class="option-grid">
            <div class="opt-btn active" onclick="toggleOption(this)">Confident</div>
            <div class="opt-btn" onclick="toggleOption(this)">Relaxed</div>
            <div class="opt-btn" onclick="toggleOption(this)">Energetic</div>
            <div class="opt-btn" onclick="toggleOption(this)">Elegant</div>
          </div>
        </div>

        <div class="style-card">
          <h3>What's the