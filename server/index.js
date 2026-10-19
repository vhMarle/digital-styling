const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Determine potential root folders
const rootParent = path.resolve(__dirname, '..');
const rootCurrent = process.cwd();

// Debug route to locate files on Render
app.get('/api/debug-files', (req, res) => {
  const parentFiles = fs.existsSync(rootParent) ? fs.readdirSync(rootParent) : [];
  const currentFiles = fs.existsSync(rootCurrent) ? fs.readdirSync(rootCurrent) : [];
  res.json({
    dirname: __dirname,
    cwd: rootCurrent,
    rootParent,
    parentFiles,
    currentFiles
  });
});

// Helper function to send root files from wherever they exist
const sendRootFile = (fileName, contentType, res) => {
  const pathInParent = path.join(rootParent, fileName);
  const pathInCurrent = path.join(rootCurrent, fileName);

  if (fs.existsSync(pathInParent)) {
    if (contentType) res.header('Content-Type', contentType);
    return res.sendFile(pathInParent);
  } else if (fs.existsSync(pathInCurrent)) {
    if (contentType) res.header('Content-Type', contentType);
    return res.sendFile(pathInCurrent);
  } else {
    return res.status(404).send(`File ${fileName} not found on server`);
  }
};

// Explicit endpoints for manifest and icon files
app.get('/site.webmanifest', (req, res) => sendRootFile('site.webmanifest', 'application/manifest+json', res));
app.get('/favicon.ico', (req, res) => sendRootFile('favicon.ico', 'image/x-icon', res));
app.get('/favicon-32x32.png', (req, res) => sendRootFile('favicon-32x32.png', 'image/png', res));
app.get('/favicon-16x16.png', (req, res) => sendRootFile('favicon-16x16.png', 'image/png', res));
app.get('/android-chrome-192x192.png', (req, res) => sendRootFile('android-chrome-192x192.png', 'image/png', res));
app.get('/android-chrome-512x512.png', (req, res) => sendRootFile('android-chrome-512x512.png', 'image/png', res));
app.get('/apple-touch-icon.png', (req, res) => sendRootFile('apple-touch-icon.png', 'image/png', res));

// Serve static assets from both directories
app.use(express.static(rootParent));
app.use(express.static(rootCurrent));

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
  sendRootFile('index.html', 'text/html', res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});