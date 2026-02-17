const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://www.whiteoutsurvival.wiki/giftcodes/';

async function fetchCodes() {
  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

    const codes = new Set();

    $('code, strong').each((i, el) => {
      const text = $(el).text().trim();

      // Basic pattern: alphanumeric 5–20 chars
      if (/^[A-Za-z0-9]{5,20}$/.test(text)) {
        codes.add(text);
      }
    });

    return Array.from(codes);
  } catch (err) {
    console.error("Scraper error:", err.message);
    return [];
  }
}

module.exports = { fetchCodes };
