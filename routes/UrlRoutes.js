const express = require('express')
const router = express.Router()
const Url = require('../models/Schema')
const shortid = require('shortid')

router.post('/shorten', async (req, res) => {
    const { OriginalURL } = req.body;

    // Move validation to the top
    if (!OriginalURL) {
        return res.status(400).json({ error: 'originalUrl is required' });
    }

    try {
        // Check if URL already exists
        let url = await Url.findOne({ OriginalURL });
        if (url) {
            return res.json({ shortUrl: `https://yourdomain.com/${url.shortCode}` });
        }

        // Generate new short URL
        const shortCode = shortid.generate();

        // Create and save new URL
        url = new Url({
            OriginalURL,
            shortCode,
            createdAt: new Date()
        });
        await url.save();

        return res.json({ shortUrl: `https://yourdomain.com/${url.shortCode}` });

    } catch (error) {
        console.error('Error in shorten route:', error);
        return res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
});

router.get('/:code', async (req, res) => {
    try {
        const url = await Url.findOne({ shortCode: req.params.code });

        if (url) {
            // Optionally increment click count
            url.clickCount += 1;
            await url.save();
            
            return res.redirect(url.OriginalURL);
        } else {
            return res.status(404).json({ error: 'URL not found' });
        }
    } catch (error) {
        console.error('Error in redirect route:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;