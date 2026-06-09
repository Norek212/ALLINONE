const { Client, GatewayIntentBits, Collection, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('./utils/db');
const { legitCheckGuideEmbed, BRAND } = require('./utils/embeds');
require('dotenv').config();

const LEGIT_CHECK_CHANNEL_ID = process.env.LEGIT_CHECK_CHANNEL_ID || '1513663849478488147';
const LOCK_FILE = path.join(__dirname, '.bot-lock');
let legitGuideMessageId = null;
let legitRenameInFlight = false;
let legitRenameRetryTimer = null;
let legitRenameTarget = db.getLegitCount();

function formatLegitName(count) {
  return `\u3022\u2705\u30fblegit-check\u279c${count}`;
}

function cleanupLockFile() {
  try {
    if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
  } catch {}
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

try {
  if (fs.existsSync(LOCK_FILE)) {
    const lockPid = Number(fs.readFileSync(LOCK_FILE, 'utf8').trim());
    if (Number.isInteger(lockPid) && lockPid > 0 && !isProcessAlive(lockPid)) {
      cleanupLockFile();
    } else {
      console.error('[BOT] Druga instancja bota już działa, zamykam start.');
      process.exit(1);
    }
  }
  fs.writeFileSync(LOCK_FILE, String(process.pid), { flag: 'wx' });
} catch (error) {
  console.error('[BOT] Nie mogę utworzyć locka startowego:', error?.message || error);
  process.exit(1);
}

function isLegitCheckChannel(channel) {
  return (
    channel?.id === LEGIT_CHECK_CHANNEL_ID ||
    channel?.name?.toLowerCase().includes('legit-check')
  );
}

async function findLegitChannel(guild) {
  const byId = await guild.channels.fetch(LEGIT_CHECK_CHANNEL_ID).catch(() => null);
  if (byId?.isTextBased?.()) return byId;

  return guild.channels.cache.find((channel) =>
    channel.isTextBased?.() &&
    channel.name?.toLowerCase().includes('legit-check')
  ) || null;
}

async function syncLegitChannelName(guild, count = db.getLegitCount(), directChannel = null) {
  const channel = directChannel || await findLegitChannel(guild);
  if (channel) {
    const nextName = formatLegitName(count);
    const me = guild.members.me || await guild.members.fetchMe().catch(() => null);
    if (!me?.permissionsIn(channel)?.has(PermissionFlagsBits.ManageChannels)) {
      console.error('[LEGIT] Brak ManageChannels do zmiany nazwy kanalu:', channel.id, channel.name);
      return null;
    }

    const updated = await channel.edit({ name: nextName }).catch((error) => {
      console.error('[LEGIT] Nie moge zmienic nazwy kanalu:', error?.message || error);
      return null;
    });
    if (updated) {
      legitRenameTarget = count;
      console.log(`[LEGIT] Nazwa kanalu ustawiona: ${updated.name}`);
      return true;
    }
  }

  return false;
}

function scheduleLegitRenameRetry(guild, directChannel = null, delay = 5000) {
  if (legitRenameRetryTimer) return;

  legitRenameRetryTimer = setTimeout(async () => {
    legitRenameRetryTimer = null;
    if (legitRenameInFlight) {
      scheduleLegitRenameRetry(guild, directChannel, delay);
      return;
    }

    legitRenameInFlight = true;
    try {
      const latestCount = db.getLegitCount();
      const ok = await syncLegitChannelName(guild, latestCount, directChannel);
      if (!ok) scheduleLegitRenameRetry(guild, directChannel, 5000);
    } catch (error) {
      console.error('[LEGIT] Retry rename error:', error?.message || error);
      scheduleLegitRenameRetry(guild, directChannel, 5000);
    } finally {
      legitRenameInFlight = false;
    }
  }, delay);
}

async function updateLegitChannelRename(guild, directChannel = null) {
  const latestCount = db.getLegitCount();
  legitRenameTarget = latestCount;

  if (legitRenameInFlight) {
    scheduleLegitRenameRetry(guild, directChannel, 2500);
    return;
  }

  legitRenameInFlight = true;
  try {
    const ok = await syncLegitChannelName(guild, latestCount, directChannel);
    if (!ok) scheduleLegitRenameRetry(guild, directChannel, 5000);
  } catch (error) {
    console.error('[LEGIT] Update rename error:', error?.message || error);
    scheduleLegitRenameRetry(guild, directChannel, 5000);
  } finally {
    legitRenameInFlight = false;
  }
}

async function refreshLegitGuide(channel, count = db.getLegitCount()) {
  const embed = legitCheckGuideEmbed();
  if (typeof count === 'number') {
    embed.setFooter({ text: `${BRAND.footer} • ${count}`, iconURL: BRAND.icon });
  }
  const payload = { embeds: [embed] };

  if (legitGuideMessageId) {
    const oldGuide = await channel.messages.fetch(legitGuideMessageId).catch(() => null);
    if (oldGuide) {
      await oldGuide.delete().catch(() => {});
    }
  }

  const sent = await channel.send(payload).catch((error) => {
    console.error('[LEGIT] Nie moge wyslac embeda:', error?.message || error);
  });
  legitGuideMessageId = sent?.id || null;
  if (sent) {
    console.log(`[LEGIT] Embed wyslany: ${sent.id}`);
  }
}

function parseRepMessage(message) {
  const target = message.mentions.users.first() || message.author;

  const withoutPrefix = message.content.replace(/^\+rep\s*/i, '').trim();
  const withoutMention = withoutPrefix.replace(/<@!?\d+>/, '').trim();
  const match = withoutMention.match(/^Exchanged\s+(.+?)\s+to\s+(.+?)\s+(\d+(?:[,.]\d{1,2})?)\s*(?:pln|zł)?$/i);

  if (!match) {
    const amountMatch = message.content.match(/(\d+(?:[,.]\d{1,2})?)/);
    const amount = amountMatch ? Number(amountMatch[1].replace(',', '.')) : 0;

    return {
      target,
      method: withoutMention || message.content,
      amount: Number.isFinite(amount) ? amount : 0
    };
  }

  const fromMethod = match[1].trim();
  const toMethod = match[2].trim();
  const amount = Number(match[3].replace(',', '.'));

  return {
    target,
    method: `Exchanged ${fromMethod} to ${toMethod}`,
    amount: Number.isFinite(amount) ? amount : 0
  };
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(err);
      if (err?.code === 10062 || err?.code === 40060) {
        return;
      }
      const msg = {
        content: `❌ ${err?.message || 'Wystapil blad!'}`,
        ephemeral: true
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg);
      } else {
        await interaction.reply(msg);
      }
    }
    return;
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId?.startsWith('embedbuilder:')) {
      const { handleBuilderSelect } = require('./utils/embedBuilder');
      await handleBuilderSelect(interaction);
      return;
    }

    const { handleSelect } = require('./utils/selectHandler');
    await handleSelect(interaction, client);
    return;
  }

  if (interaction.isButton()) {
    const { handleButton } = require('./utils/buttonHandler');
    await handleButton(interaction, client);
    return;
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId?.startsWith('embedbuilder:')) {
      const { handleBuilderModal } = require('./utils/embedBuilder');
      const handled = await handleBuilderModal(interaction);
      if (handled) return;
    }

    const { handleModal } = require('./utils/modalHandler');
    await handleModal(interaction, client);
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  if (!isLegitCheckChannel(message.channel)) return;

  try {
    const newCount = db.incrementLegitCount();
    console.log(`[LEGIT] Licznik wiadomosci: ${newCount}`);
    await refreshLegitGuide(message.channel, newCount);
    await updateLegitChannelRename(message.guild, message.channel);
  } catch (error) {
    console.error(error);
  }
});

client.once('clientReady', async () => {
  for (const guild of client.guilds.cache.values()) {
    await syncLegitChannelName(guild, db.getLegitCount());
    const channel = await findLegitChannel(guild);
    if (channel) {
      await refreshLegitGuide(channel, db.getLegitCount());
    }
  }
});

client.login(process.env.TOKEN || process.env.DISCORD_TOKEN);

process.on('exit', () => {
  cleanupLockFile();
});
process.once('SIGINT', () => {
  cleanupLockFile();
  process.exit(0);
});
process.once('SIGTERM', () => {
  cleanupLockFile();
  process.exit(0);
});
