const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { nanoid } = require('nanoid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://db:27017/shortqr', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  created: { type: Date, default: Date.now },
  clicks: { type: Number, default: 0 }
});

const URL = mongoose.model('URL', urlSchema);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
    res.status(500).json({ message: error.message });
  }
});

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
    res.status(500).json({ message: error.message });
  }
});

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
    res.status(500).json({ message: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});