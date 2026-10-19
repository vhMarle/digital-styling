const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

const PUBLIC_DIR = path.join(__dirname, '../public');

// Helper to sanitize Supabase URL
function sanitizeUrl(rawUrl) {
  if (!rawUrl) return 'https://jzyagdnkhctawxhoimrx.supabase.co';
  const match = rawUrl.match(/https?:\/\/[^\s\]\)]+/);
  return match ? match[0] : rawUrl.trim();
}

// Sanitize and initialize Supabase Client
const supabaseUrl = sanitizeUrl(process.env.SUPABASE_URL);
const supabaseKey = (process.env.SUPABASE_KEY || 'sb_publishable_AOEbD5g2qOmzo2qYfmqutg_9u1USfRV').trim();

const supabase = createClient(supabaseUrl, supabaseKey);

// Multer memory storage for direct buffer upload to Supabase Storage
const upload = multer({ storage: multer.memoryStorage() });

app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'sparks-and-sequins-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
}));

app.use(express.json({ limit: '15mb' }));

// Explicit manifest route
app.get('/site.webmanifest', (req, res) => {
  res.header('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(PUBLIC_DIR, 'site.webmanifest'));
});

// Serve static assets with no-cache for index.html
app.use(express.static(PUBLIC_DIR, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// OAuth 2.0 Client Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://digital-styling.onrender.com/api/auth/callback'
);

app.get('/api/auth/login-url', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email']
  });
  res.json({ url });
});

app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    req.session.user = {
      id: data.id,
      name: data.name,
      email: data.email,
      picture: data.picture
    };

    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      res.redirect('/');
    });
  } catch (err) {
    console.error('OAuth Callback Error:', err);
    res.redirect('/?error=auth_failed');
  }
});

app.get('/api/auth/user', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false, user: null });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// --- SUPABASE CLOTHES & INVENTORY API ---

// GET /api/clothes - Fetch user clothes from Supabase
app.get('/api/clothes', async (req, res) => {
  try {
    const userEmail = req.session?.user?.email || 'guest@sparksequins.com';
    const { data, error } = await supabase
      .from('clothes')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, clothes: data || [] });
  } catch (err) {
    console.error('Error fetching clothes:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch clothes' });
  }
});

// POST /api/clothes - Save item into database
app.post('/api/clothes', upload.single('image'), async (req, res) => {
  try {
    const { 
      name, 
      category, 
      sub_type, 
      brand, 
      site_name, 
      color, 
      size, 
      image_url, 
      image_data 
    } = req.body;

    const userEmail = req.session?.user?.email || 'guest@sparksequins.com';
    let finalImageUrl = null;

    // 1. Process base64 image data from preview canvas
    if (image_data && typeof image_data === 'string' && image_data.startsWith('data:image')) {
      try {
        const base64Data = Buffer.from(image_data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        const fileName = `${Date.now()}_isolated.png`;

        const { error: uploadError } = await supabase
          .storage
          .from('wardrobe-images')
          .upload(fileName, base64Data, { contentType: 'image/png', upsert: true });

        if (!uploadError) {
          const { data: publicUrlData } = supabase
            .storage
            .from('wardrobe-images')
            .getPublicUrl(fileName);
          finalImageUrl = publicUrlData.publicUrl;
        }
      } catch (e) {
        console.error('Error uploading base64 image:', e);
      }
    }

    // 2. Process file buffer if uploaded directly
    if (!finalImageUrl && req.file) {
      try {
        const fileName = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const { error: uploadError } = await supabase
          .storage
          .from('wardrobe-images')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase
            .storage
            .from('wardrobe-images')
            .getPublicUrl(fileName);
          finalImageUrl = publicUrlData.publicUrl;
        }
      } catch (e) {
        console.error('Error uploading file buffer:', e);
      }
    }

    // 3. Process direct image URL
    if (!finalImageUrl && image_url) {
      finalImageUrl = image_url;
    }

    // Fallback image if none present
    if (!finalImageUrl) {
      finalImageUrl = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400';
    }

    const itemPayload = {
      user_email: userEmail,
      name: name || 'Untitled Item',
      category: category || 'Tops',
      sub_type: sub_type || 'General',
      brand: brand || 'Unspecified',
      site_name: site_name || 'Manual Import',
      color: color || 'Multi',
      size: size || 'Standard',
      image_url: finalImageUrl
    };

    const { data, error } = await supabase
      .from('clothes')
      .insert([itemPayload])
      .select();

    if (error) throw error;
    res.json({ success: true, item: data[0] });
  } catch (err) {
    console.error('Error saving item:', err);
    res.status(500).json({ success: false, message: 'Failed to save item' });
  }
});

// PUT /api/clothes/:id - Edit item
app.put('/api/clothes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, sub_type, brand, color, size } = req.body;

    const { data, error } = await supabase
      .from('clothes')
      .update({ name, category, sub_type, brand, color, size })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, item: data[0] });
  } catch (err) {
    console.error('Error editing item:', err);
    res.status(500).json({ success: false, message: 'Failed to edit item' });
  }
});

// DELETE /api/clothes/:id - Delete item
app.delete('/api/clothes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('clothes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ success: false, message: 'Failed to delete item' });
  }
});

// POST /api/parse-url - Safely extract metadata from URL
app.post('/api/parse-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL required' });

    let brandName = 'Web Import';
    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.replace('www.', '');
      const siteName = domain.split('.')[0];
      brandName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
    } catch (e) {}

    res.json({
      success: true,
      data: {
        site_name: brandName,
        brand: brandName,
        name: `${brandName} Garment Item`,
        color: 'Black',
        size: 'M',
        image_url: url
      }
    });
  } catch (err) {
    res.json({
      success: true,
      data: {
        site_name: 'Web Import',
        brand: 'Unknown Brand',
        name: 'Imported Item',
        color: 'Custom',
        size: 'M',
        image_url: req.body.url
      }
    });
  }
});

app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});