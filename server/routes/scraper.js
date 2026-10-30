// server/routes/scraper.js
const express = require('express');
const router = express.Router();

/**
 * GET /api/scrape?url=<ENCODED_URL>
 * Parses the product page specifically for high-res og:image or picture source tags.
 */
router.get('/scrape', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required.' });
  }

  try {
    const targetUrl = new URL(url);

    // Custom headers mimicking a real Desktop Chrome browser session
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`Site returned status ${response.status}`);
    }

    const html = await response.text();

    let imageUrl = '';
    let title = '';

    // 1. Check OpenGraph image tags
    const ogImgMatch =
      html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);

    if (ogImgMatch) {
      imageUrl = ogImgMatch[1];
    }

    // 2. Fallback: Parse high-res picture tags / JSON-LD schema
    if (!imageUrl) {
      const jsonLdMatch = html.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
      if (jsonLdMatch) {
        for (const script of jsonLdMatch) {
          try {
            const cleanJson = script.replace(/<script[^>]*>|<\/script>/gi, '');
            const parsed = JSON.parse(cleanJson);
            const item = Array.isArray(parsed) ? parsed[0] : parsed;
            if (item.image) {
              imageUrl = Array.isArray(item.image) ? item.image[0] : item.image;
              break;
            }
          } catch (e) {
            // Ignore parse errors on malformed inline json
          }
        }
      }
    }

    // 3. Extract OpenGraph title
    const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i);
    if (ogTitleMatch) {
      title = ogTitleMatch[1].replace(/ - Miu Miu| \| Miu Miu/gi, '').trim();
    }

    // Ensure protocol is attached (e.g. //www.miumiu.com -> https://www.miumiu.com)
    if (imageUrl && imageUrl.startsWith('//')) {
      imageUrl = `https:${imageUrl}`;
    }

    return res.json({
      success: true,
      data: {
        imageUrl: imageUrl || null,
        title: title || 'Imported Web Item',
        sourceUrl: url,
      },
    });
  } catch (error) {
    console.error('Scraper Fetch Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Could not fetch image from URL automatically.',
      details: error.message,
    });
  }
});

/**
 * GET /api/proxy-image?url=<ENCODED_IMAGE_URL>
 * Proxies the image stream while spoofing site-specific Referer and Origin headers.
 */
router.get('/proxy-image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Image URL required');

  try {
    let targetUrl = url;
    if (targetUrl.startsWith('//')) targetUrl = `https:${targetUrl}`;

    const parsedTarget = new URL(targetUrl);

    // Crucial: Set Referer matching the origin domain of the luxury retailer
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': `${parsedTarget.origin}/`,
        'Origin': parsedTarget.origin,
      },
    });

    if (!response.ok) {
      console.error(`Proxy stream failed with status: ${response.status}`);
      return res.status(response.status).send('Failed to stream remote image');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Image Proxy Server Error:', err.message);
    res.status(500).send('Image Proxy Internal Error');
  }
});

module.exports = router;