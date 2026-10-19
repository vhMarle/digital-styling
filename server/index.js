const express = require('express');
const session = require('express-session');
const path = require('path');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

const PUBLIC_DIR = path.join(__dirname, '../public');

// Trust Render's reverse proxy for secure HTTPS cookies
app.set('trust proxy', 1);

// Configure Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'stylenest-super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

app.use(express.json());

// Explicit manifest route with application/manifest+json MIME type
app.get('/site.webmanifest', (req, res) => {
  res.header('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(PUBLIC_DIR, 'site.webmanifest'));
});

// Serve static assets from public folder
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

app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});