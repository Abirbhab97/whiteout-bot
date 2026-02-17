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
    const codes = [];

    // Each card container
    $('div.bg-white').each((i, el) => {

      const statusText = $(el).find('.absolute').text().trim();
      const codeText = $(el).find('h5').text().trim();

      if (!codeText) return;

      // Only ACTIVE codes
      if (statusText.includes('ACTIVE')) {
        codes.push(codeText);
      }

    });

    return codes;

  } catch (err) {
    console.error("Scraper error:", err.message);
    return [];
  }
}

module.exports = { fetchCodes };




