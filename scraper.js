const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://www.wosrewards.com/';

async function fetchCodes() {
  try {
    const { data } = await axios.get(URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const codes = new Set();

    // Look for common code container patterns
    $('strong, b, span, td, li').each((i, el) => {
      const text = $(el).text().trim();

      const match = text.match(/\b[A-Za-z0-9]{6,25}\b/);

      if (match) {
        const code = match[0];

        // Basic filtering
        if (
          !code.toLowerCase().includes("http") &&
          !code.toLowerCase().includes("whiteout") &&
          !code.toLowerCase().includes("reward")
        ) {
          codes.add(code);
        }
      }
    });

    return Array.from(codes);

  } catch (err) {
    console.error("Scraper error:", err.message);
    return [];
  }
}

module.exports = { fetchCodes };



