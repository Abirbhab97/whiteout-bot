const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://www.whiteoutsurvival.wiki/giftcodes/';

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

    // Extract main content text
    const content = $('#mw-content-text').text();

    if (!content) {
      console.log("Content not found.");
      return [];
    }

    const matches = content.match(/\b[A-Za-z0-9]{6,25}\b/g);

    if (!matches) return [];

    matches.forEach(code => {
      const isValid =
        !code.startsWith("http") &&
        !code.includes("whiteout") &&
        !code.includes("Whiteout") &&
        !code.includes("Century") &&
        !code.includes("January") &&
        !code.includes("February");

      if (isValid) {
        codes.add(code.trim());
      }
    });

    return Array.from(codes);

  } catch (err) {
    console.error("Scraper error:", err.message);
    return [];
  }
}

module.exports = { fetchCodes };



