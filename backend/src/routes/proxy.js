const express = require('express');
const router = express.Router();

/**
 * Proxy endpoint for images
 * Fetches images from external sources and serves them to avoid COEP issues
 */
router.get('/image', async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        // Fetch the image
        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch image' });
        }

        // Get the content type
        const contentType = response.headers.get('content-type');

        // Set appropriate headers
        res.setHeader('Content-Type', contentType || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

        // Stream the image
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error('Image proxy error:', error);
        res.status(500).json({ error: 'Failed to proxy image' });
    }
});

module.exports = router;
