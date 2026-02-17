require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const { fetchCodes } = require('./scraper');
const {
  saveCode,
  markExpired,
  getActiveCodes,
  updateLastChecked
} = require('./database');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Run immediately on startup
  await checkForUpdates();

  // TEMP: Run every minute for debugging
  cron.schedule('* * * * *', async () => {
    console.log('Checking for updates...');
    await checkForUpdates();
  });
});

async function checkForUpdates() {
  try {
    console.log("Running scraper...");

    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    const rolePing = `<@&${process.env.ROLE_ID}>`;

    const scrapedCodes = await fetchCodes();
    console.log("Scraped codes:", scrapedCodes);

    const activeCodes = await getActiveCodes();

    // Detect new codes
    for (const code of scrapedCodes) {
      const isNew = await saveCode(code);

      if (isNew) {
        console.log("New code found:", code);

        await channel.send(
          `${rolePing}\n🎁 **New Whiteout Survival Gift Code!**\n\n` +
          `\`\`\`\n${code}\n\`\`\`\n` +
          `🔗 Redeem: https://wos-giftcode.centurygame.com/`
        );
      }

      await updateLastChecked(code);
    }

    // Detect expired codes
    for (const code of activeCodes) {
      if (!scrapedCodes.includes(code)) {
        console.log("Code expired:", code);

        await markExpired(code);
        await channel.send(
          `⚠️ **Code Expired:** \`${code}\` has been removed from the wiki.`
        );
      }
    }

  } catch (error) {
    console.error("Error in checkForUpdates:", error);
  }
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'codes') {
    try {
      const codes = await getActiveCodes();

      if (!codes.length) {
        return interaction.reply("No active codes available right now.");
      }

      await interaction.reply(
        `🎁 **Active Whiteout Survival Gift Codes:**\n\n` +
        codes.map(c => `• ${c}`).join('\n')
      );
    } catch (error) {
      console.error("Error handling /codes:", error);
      await interaction.reply("Something went wrong.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

