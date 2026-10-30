// server/routes/removeBg.js
const express = require('express');
const router = express.Router();

// CORS Proxy for Web Image URLs
router.post('/fetch-url', express.json({ limit: '10mb' }), async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;
    
    return res.json({ success: true, dataUrl: base64 });
  } catch (err) {
    console.error('URL Fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch image from URL' });
  }
});

module.exports = router;