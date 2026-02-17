
const axios = require('axios');

const API_URL = 'https://www.whiteoutsurvival.wiki/api.php';

async function fetchCodes() {
  try {
    const { data } = await axios.get(API_URL, {
      params: {
        action: 'parse',
        page: 'giftcodes',
        format: 'json',
        prop: 'wikitext'
      }
    });

    const wikitext = data?.parse?.wikitext?.['*'];

    if (!wikitext) {
      console.log("No wikitext returned.");
      return [];
    }

    const codes = new Set();

    const matches = wikitext.match(/\b[A-Za-z0-9]{6,25}\b/g);

    if (matches) {
      matches.forEach(code => {
        if (
          !code.includes("http") &&
          !code.includes("Whiteout") &&
          !code.includes("Century")
        ) {
          codes.add(code.trim());
        }
      });
    }

    return Array.from(codes);

  } catch (err) {
    console.error("Wiki API error:", err.message);
    return [];
  }
}

module.exports = { fetchCodes };


