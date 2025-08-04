const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { nanoid } = require('nanoid');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://db:27017/shortqr';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  // Continue even with DB error, for QR code functionality
});

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// URL Schema
const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  created: { type: Date, default: Date.now },
  clicks: { type: Number, default: 0 }
});

const URL = mongoose.model('URL', urlSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint: Create shortened URL
app.post('/api/shorten', async (req, res) => {
  try {
    const { url, slug } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }
    
    let shortSlug = slug;
    
    if (!shortSlug) {
      shortSlug = nanoid(6);
    } else {
      const existing = await URL.findOne({ slug: shortSlug });
      if (existing) {
        return res.status(409).json({ message: 'This custom slug is already in use' });
      }
    }
    
    const newUrl = new URL({
      originalUrl: url,
      slug: shortSlug
    });
    
    await newUrl.save();
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ 
      shortUrl: `${baseUrl}/${shortSlug}`,
      created: newUrl.created,
      slug: shortSlug
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});

// Redirect shortened URLs
app.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const url = await URL.findOne({ slug });
    
    if (!url) {
      return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
    }
    
    url.clicks += 1;
    await url.save();
    
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// Get URL statistics
app.get('/api/stats/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const url = await URL.findOne({ slug });
    
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }
    
    res.json({
      originalUrl: url.originalUrl,
      created: url.created,
      clicks: url.clicks
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
});

// For all other routes, serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});