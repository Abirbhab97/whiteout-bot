const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://www.whiteoutsurvival.wiki/giftcodes/';

async function fetchCodes() {
  try {
    const { data } = await axios.get(URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const $ = cheerio.load(data);

    const codes = new Set();

    // Look through all text in page
    $('p, li, td').each((i, el) => {
      const text = $(el).text();

      // Match gift code pattern (5-20 uppercase letters/numbers)
      const matches = text.match(/\b[A-Z0-9]{5,20}\b/g);

      if (matches) {
        matches.forEach(code => {
          // Filter obvious false positives
          if (
            !code.includes("HTTP") &&
            !code.includes("WHITEOUT") &&
            code.length >= 5
          ) {
            codes.add(code.trim());
          }
        });
      }
    });

    return Array.from(codes);

  } catch (err) {
    console.error("Scraper error:", err.message);
    return [];
  }
}

module.exports = { fetchCodes };

