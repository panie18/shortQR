const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { nanoid } = require('nanoid');
const qrcode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
mongoose.connect('mongodb://db:27017/qr-short', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// URL Schema
const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  clicks: {
    type: Number,
    default: 0
  }
});

const Url = mongoose.model('Url', urlSchema);

// Routes
app.post('/api/shorten', async (req, res) => {
  try {
    const { originalUrl, customAlias } = req.body;

    // Validate URL
    try {
      new URL(originalUrl);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const shortCode = customAlias || nanoid(6);

    // Check if custom alias already exists
    if (customAlias) {
      const existingUrl = await Url.findOne({ shortCode: customAlias });
      if (existingUrl) {
        return res.status(400).json({ error: 'Custom alias already in use' });
      }
    }

    // Create new URL record
    const url = new Url({
      originalUrl,
      shortCode
    });

    await url.save();

    // Generate QR code for the shortened URL
    const host = req.get('host');
    const protocol = req.protocol;
    const shortUrl = `${protocol}://${host}/s/${shortCode}`;
    
    res.json({
      originalUrl,
      shortCode,
      shortUrl,
      createdAt: url.createdAt,
      clicks: url.clicks
    });
  } catch (err) {
    console.error('Error shortening URL:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect to original URL
app.get('/s/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).send('URL not found');
    }

    // Increment clicks
    url.clicks++;
    await url.save();

    res.redirect(url.originalUrl);
  } catch (err) {
    console.error('Error redirecting:', err);
    res.status(500).send('Server error');
  }
});

// Get URL stats
app.get('/api/stats/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json({
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      createdAt: url.createdAt,
      clicks: url.clicks
    });
  } catch (err) {
    console.error('Error getting stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});