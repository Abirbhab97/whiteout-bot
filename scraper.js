const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://www.whiteoutsurvival.wiki/giftcodes/';

async function fetchCodes() {
  try {
    const { data } = await axios.get(URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Connection": "keep-alive"
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const codes = new Set();

    // Scan entire page text
    const bodyText = $('body').text();

    const matches = bodyText.match(/\b[A-Z0-9]{6,20}\b/g);

    if (matches) {
      matches.forEach(code => {
        if (
          !code.includes("HTTP") &&
          !code.includes("WHITEOUT") &&
          code.length >= 6
        ) {
          codes.add(code.trim());
        }
      });
    }

    return Array.from(codes);

  } catch (err) {
    console.error("Scraper error:", err.message);
    return [];
  }
}

module.exports = { fetchCodes };


