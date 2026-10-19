const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');
const https = require('https');
const http = require('http');

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

// Multer memory storage
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

app.use(express.json({ limit: '25mb' }));

// Manifest
app.get('/site.webmanifest', (req, res) => {
  res.header('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(PUBLIC_DIR, 'site.webmanifest'));
});

// Serve static assets
app.use(express.static(PUBLIC_DIR, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// OAuth Setup
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

// Proxy Image to bypass CORS for canvas preview
app.get('/api/proxy-image', (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('URL required');

  try {
    const client = imageUrl.startsWith('https') ? https : http;
    const request = client.get(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return res.redirect(`/api/proxy-image?url=${encodeURIComponent(response.headers.location)}`);
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
      response.pipe(res);
    });
    request.on('error', () => {
      res.status(500).send('Image proxy error');
    });
  } catch (e) {
    res.status(500).send('Proxy exception');
  }
});

// GET /api/clothes - Fetch user clothes
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

// POST /api/clothes - Save item with automatic table-column fallback logic
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
        console.error('Error uploading buffer:', e);
      }
    }

    if (!finalImageUrl && image_url) {
      finalImageUrl = image_url;
    }

    if (!finalImageUrl) {
      finalImageUrl = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400';
    }

    const fullPayload = {
      user_email: userEmail,
      name: name || 'Garment Item',
      category: category || 'Tops',
      sub_type: sub_type || 'General',
      brand: brand || '',
      site_name: site_name || '',
      color: color || '',
      size: size || '',
      image_url: finalImageUrl
    };

    let insertResult = await supabase.from('clothes').insert([fullPayload]).select();

    if (insertResult.error) {
      const minimalPayload = {
        user_email: userEmail,
        name: name || 'Garment Item',
        category: category || 'Tops',
        image_url: finalImageUrl
      };
      insertResult = await supabase.from('clothes').insert([minimalPayload]).select();
    }

    if (insertResult.error) throw insertResult.error;

    res.json({ success: true, item: insertResult.data[0] });
  } catch (err) {
    console.error('Error saving item:', err);
    res.status(500).json({ success: false, message: 'Failed to save item: ' + err.message });
  }
});

app.put('/api/clothes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, sub_type, brand, color, size } = req.body;

    let updateResult = await supabase
      .from('clothes')
      .update({ name, category, sub_type, brand, color, size })
      .eq('id', id)
      .select();

    if (updateResult.error) {
      updateResult = await supabase
        .from('clothes')
        .update({ name, category })
        .eq('id', id)
        .select();
    }

    if (updateResult.error) throw updateResult.error;
    res.json({ success: true, item: updateResult.data[0] });
  } catch (err) {
    console.error('Error editing item:', err);
    res.status(500).json({ success: false, message: 'Failed to edit item' });
  }
});

app.delete('/api/clothes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('clothes').delete().eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ success: false, message: 'Failed to delete item' });
  }
});

app.post('/api/parse-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL required' });

    const lowerUrl = url.toLowerCase();

    let brandName = 'Web Import';
    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.replace('www.', '');
      const rawBrand = domain.split('.')[0];
      brandName = rawBrand.charAt(0).toUpperCase() + rawBrand.slice(1);
    } catch (e) {}

    let category = 'Tops';
    let subType = 'Short Sleeve';

    if (lowerUrl.includes('dress') || lowerUrl.includes('gown') || lowerUrl.includes('maxi') || lowerUrl.includes('midi')) {
      category = 'Dresses';
      subType = lowerUrl.includes('maxi') ? 'Maxi' : lowerUrl.includes('mini') ? 'Mini' : 'Midi';
    } else if (lowerUrl.includes('shoe') || lowerUrl.includes('boot') || lowerUrl.includes('sandal') || lowerUrl.includes('heel') || lowerUrl.includes('flat') || lowerUrl.includes('sneaker')) {
      category = 'Shoes';
      subType = lowerUrl.includes('boot') ? 'Boots' : lowerUrl.includes('sandal') ? 'Sandals' : lowerUrl.includes('heel') ? 'Heels' : 'Flats';
    } else if (lowerUrl.includes('pant') || lowerUrl.includes('jean') || lowerUrl.includes('skirt') || lowerUrl.includes('short') || lowerUrl.includes('trouser')) {
      category = 'Bottoms';
      subType = lowerUrl.includes('jean') ? 'Jeans' : lowerUrl.includes('skirt') ? 'Skirts' : lowerUrl.includes('short') ? 'Shorts' : 'Pants';
    } else if (lowerUrl.includes('bag') || lowerUrl.includes('belt') || lowerUrl.includes('jewel') || lowerUrl.includes('scarf')) {
      category = 'Accessories';
      subType = lowerUrl.includes('bag') ? 'Bags' : lowerUrl.includes('belt') ? 'Belts' : lowerUrl.includes('scarf') ? 'Scarfs' : 'Jewelry';
    } else if (lowerUrl.includes('jacket') || lowerUrl.includes('coat') || lowerUrl.includes('duster')) {
      category = 'Outerwear';
      subType = 'Coats';
    } else {
      if (lowerUrl.includes('sleeve') || lowerUrl.includes('top') || lowerUrl.includes('shirt') || lowerUrl.includes('blouse')) {
        category = 'Tops';
        subType = lowerUrl.includes('sleeveless') ? 'Sleeveless' : lowerUrl.includes('long') ? 'Long Sleeve' : 'Short Sleeve';
      }
    }

    const defaultFashionImg = category === 'Dresses' 
      ? 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500'
      : category === 'Shoes'
      ? 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500'
      : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500';

    res.json({
      success: true,
      data: {
        site_name: brandName,
        brand: brandName,
        name: `${brandName} ${subType} ${category.slice(0, -1)}`,
        category: category,
        sub_type: subType,
        color: 'Neutral',
        size: 'M',
        image_url: defaultFashionImg
      }
    });
  } catch (err) {
    res.json({
      success: true,
      data: {
        site_name: 'Web Import',
        brand: 'Imported Brand',
        name: 'Imported Garment',
        category: 'Tops',
        sub_type: 'Short Sleeve',
        color: '',
        size: '',
        image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500'
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