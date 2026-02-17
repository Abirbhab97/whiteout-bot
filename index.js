require('dotenv').config();

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
});

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

  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('Checking for updates...');
    await checkForUpdates();
  });
});

async function checkForUpdates() {
  try {
    console.log("Running scraper...");

    const channelId = process.env.CHANNEL_ID;

    if (!channelId) {
      console.error("CHANNEL_ID is missing in environment variables.");
      return;
    }

    const channel = await client.channels.fetch(channelId).catch(err => {
      console.error("Failed to fetch channel:", err);
      return null;
    });

    if (!channel) {
      console.error("Channel not found or bot has no access.");
      return;
    }

    const rolePing = process.env.ROLE_ID
      ? `<@&${process.env.ROLE_ID}>`
      : "";

    const scrapedCodes = await fetchCodes().catch(err => {
      console.error("Scraper failed:", err);
      return [];
    });

    console.log("Scraped codes:", scrapedCodes);

    const activeCodes = await getActiveCodes();

    // Add new codes
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

    // Expire removed codes
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
    console.error("Error inside checkForUpdates:", error);
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


