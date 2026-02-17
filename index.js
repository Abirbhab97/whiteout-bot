require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const { fetchCodes } = require('./scraper');
const {
  saveCode,
  markExpired,
  getActiveCodes,
  getAllCodes,
  updateLastChecked
} = require('./database');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await checkForUpdates();

  cron.schedule('*/15 * * * *', async () => {
    console.log('Checking for updates...');
    await checkForUpdates();
  });
});

async function checkForUpdates() {
  const channel = await client.channels.fetch(process.env.CHANNEL_ID);
  const rolePing = `<@&${process.env.ROLE_ID}>`;

  const scrapedCodes = await fetchCodes();
  const activeCodes = await getActiveCodes();

  // 1️⃣ Detect new codes
  for (const code of scrapedCodes) {
    const isNew = await saveCode(code);

    if (isNew) {
      await channel.send(
        `${rolePing}\n🎁 **New Whiteout Survival Gift Code!**\n\n` +
        `\`\`\`\n${code}\n\`\`\`\n` +
        `🔗 Redeem: https://wos-giftcode.centurygame.com/`
      );
    }

    await updateLastChecked(code);
  }

  // 2️⃣ Detect expired codes (not present anymore)
  for (const code of activeCodes) {
    if (!scrapedCodes.includes(code)) {
      await markExpired(code);
      await channel.send(
        `⚠️ **Code Expired:** \`${code}\` has been removed from the wiki.`
      );
    }
  }
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'codes') {
    const codes = await getActiveCodes();

    if (!codes.length) {
      return interaction.reply("No active codes available.");
    }

    await interaction.reply(
      `🎁 **Active Gift Codes:**\n\n` +
      codes.map(c => `• ${c}`).join('\n')
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
