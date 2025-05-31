const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(express.json());

app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url.includes('instagram.com')) {
    return res.status(400).json({ error: 'Invalid Instagram URL' });
  }

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/113.0.0.0 Safari/537.36',
      },
    });

    const cheerio = require('cheerio');
    const $ = cheerio.load(data);
    const scriptTag = $('script[type="application/ld+json"]').html();

    if (!scriptTag) return res.status(404).json({ error: 'Media not found' });

    const jsonData = JSON.parse(scriptTag);

    const mediaUrl =
      jsonData.video?.contentUrl || jsonData.image || null;

    if (!mediaUrl) return res.status(404).json({ error: 'Media not found' });

    res.json({ mediaUrl, type: jsonData.video ? 'video' : 'image' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to scrape media' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
