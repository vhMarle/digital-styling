const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

const PUBLIC_DIR = path.join(__dirname, '../public');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://jzyagdnkhctawxhoimrx.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_AOEbD5g2qOmzo2qYfmqutg_9u1USfRV';
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

app.use(express.json());

// Explicit manifest route with correct JSON MIME type
app.get('/site.webmanifest', (req, res) => {
  res.header('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(PUBLIC_DIR, 'site.webmanifest'));
});

// Serve static assets from public directory
app.use(express.static(PUBLIC_DIR));

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

// --- SUPABASE CLOTHES API ---

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

// POST /api/clothes - Add new item & upload image to Supabase Bucket
app.post('/api/clothes', upload.single('image'), async (req, res) => {
  try {
    const { name, category } = req.body;
    const userEmail = req.session?.user?.email || 'guest@sparksequins.com';
    let imageUrl = 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300';

    if (req.file) {
      const fileName = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('wardrobe-images')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase
        .storage
        .from('wardrobe-images')
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('clothes')
      .insert([{ user_email: userEmail, name, category, image_url: imageUrl }])
      .select();

    if (error) throw error;
    res.json({ success: true, item: data[0] });
  } catch (err) {
    console.error('Error saving item:', err);
    res.status(500).json({ success: false, message: 'Failed to save item' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});