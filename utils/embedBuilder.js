const {
  ActionRowBuilder,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');

const sessions = new Map();
const cleanupTimers = new Map();
const SESSION_TTL = 5 * 60 * 1000;
const DEFAULT_COLOR = 0x336861;

function createDefaultState() {
  return {
    title: '',
    description: '',
    color: DEFAULT_COLOR,
    authorName: '',
    authorIcon: '',
    authorUrl: '',
    footerText: '',
    footerIcon: '',
    thumbnail: '',
    image: '',
    timestamp: false,
    fields: []
  };
}

function normalizeColor(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const hex = raw.startsWith('#') ? raw.slice(1) : raw;
  const parsed = Number.parseInt(hex, 16);
  return Number.isNaN(parsed) ? null : parsed;
}

function getSession(messageId) {
  return sessions.get(messageId) || null;
}

function canEdit(interaction, session) {
  return interaction.user.id === session.ownerId || interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages);
}

function resetExpiry(messageId, channel) {
  if (cleanupTimers.has(messageId)) clearTimeout(cleanupTimers.get(messageId));

  cleanupTimers.set(
    messageId,
    setTimeout(async () => {
      sessions.delete(messageId);
      cleanupTimers.delete(messageId);
      const message = await channel.messages.fetch(messageId).catch(() => null);
      if (message) await message.delete().catch(() => {});
    }, SESSION_TTL)
  );
}

function renderPreview(session) {
  const embed = new EmbedBuilder().setColor(session.state.color);

  if (session.state.title) embed.setTitle(session.state.title);
  if (session.state.description) embed.setDescription(session.state.description);
  if (session.state.authorName) {
    embed.setAuthor({
      name: session.state.authorName,
      iconURL: session.state.authorIcon || undefined,
      url: session.state.authorUrl || undefined
    });
  }
  if (session.state.footerText) {
    embed.setFooter({
      text: session.state.footerText,
      iconURL: session.state.footerIcon || undefined
    });
  }
  if (session.state.thumbnail) embed.setThumbnail(session.state.thumbnail);
  if (session.state.image) embed.setImage(session.state.image);
  if (session.state.timestamp) embed.setTimestamp();
  if (session.state.fields.length) embed.addFields(session.state.fields.slice(0, 25));

  if (!session.state.title && !session.state.description && !session.state.fields.length) {
    embed.setDescription('Pusty podglad. Wybierz akcje z menu ponizej.');
  }

  return embed;
}

function renderPanel(session) {
  const state = session.state;

  return new EmbedBuilder()
    .setColor(0x4c6fff)
    .setTitle('🛠️ Panel budowy embeda')
    .addFields(
      { name: 'Tytuł', value: state.title || 'Nie ustawiono', inline: true },
      { name: 'Opis', value: state.description ? `${state.description.length} znaków` : 'Nie ustawiono', inline: true },
      { name: 'Kolor', value: `${state.color}`, inline: true },
      { name: 'Autor', value: state.authorName || 'Nie ustawiono', inline: true },
      { name: 'Stopka', value: state.footerText || 'Nie ustawiono', inline: true },
      { name: 'Miniatura', value: state.thumbnail ? 'Ustawiona' : 'Nie ustawiono', inline: true },
      { name: 'Obraz', value: state.image ? 'Ustawiony' : 'Nie ustawiono', inline: true },
      { name: 'Znacznik czasu', value: state.timestamp ? 'Włączony' : 'Wyłączony', inline: true },
      { name: 'Pola', value: `${state.fields.length}/25`, inline: true }
    )
    .setFooter({ text: 'Podgląd odświeża się na bieżąco • znika po 5 minutach bezczynności' });
}

function buildMenu() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('embedbuilder:menu')
    .setPlaceholder('Wybierz akcję...')
    .addOptions([
      { label: 'Edytuj treść', description: 'Tytuł i opis embeda.', value: 'content' },
      { label: 'Ustaw kolor', description: 'Wpisz kolor HEX albo liczbę.', value: 'color' },
      { label: 'Ustaw autora', description: 'Nazwa, ikonka i link autora.', value: 'author' },
      { label: 'Ustaw stopkę', description: 'Tekst i ikonka stopki.', value: 'footer' },
      { label: 'Ustaw obrazy', description: 'Miniatura i główny obraz.', value: 'images' },
      { label: 'Dodaj pole', description: 'Nazwa, wartość i inline.', value: 'field' },
      { label: 'Przełącz timestamp', description: 'Włącza albo wyłącza znacznik czasu.', value: 'timestamp' },
      { label: 'Opublikuj embed', description: 'Wysyła gotowy embed na kanał.', value: 'post' },
      { label: 'Dane surowe', description: 'Pokazuje surowe dane embeda.', value: 'raw' },
      { label: 'Wyczyść wszystko', description: 'Resetuje cały panel.', value: 'reset' }
    ]);

  return new ActionRowBuilder().addComponents(menu);
}

function buildModal(messageId, action) {
  const modal = new ModalBuilder().setCustomId(`embedbuilder:${action}:${messageId}`);

  if (action === 'content') {
    modal.setTitle('Edytuj treść');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('title')
          .setLabel('Tytuł')
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('description')
          .setLabel('Opis')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
      )
    );
    return modal;
  }

  if (action === 'color') {
    modal.setTitle('Ustaw kolor');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('color')
          .setLabel('Kolor HEX albo liczba')
          .setPlaceholder('#336861 albo 3368601')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    );
    return modal;
  }

  if (action === 'author') {
    modal.setTitle('Ustaw autora');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('name')
          .setLabel('Nazwa autora')
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('icon')
          .setLabel('URL ikonki autora')
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('url')
          .setLabel('URL autora')
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      )
    );
    return modal;
  }

  if (action === 'footer') {
    modal.setTitle('Ustaw stopkę');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('text')
          .setLabel('Tekst stopki')
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('icon')
          .setLabel('URL ikonki stopki')
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      )
    );
    return modal;
  }

  if (action === 'images') {
    modal.setTitle('Ustaw obrazy');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('thumbnail')
          .setLabel('URL miniatury')
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('image')
          .setLabel('URL głównego obrazu')
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      )
    );
    return modal;
  }

  if (action === 'field') {
    modal.setTitle('Dodaj pole');
    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('name')
          .setLabel('Nazwa pola')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('value')
          .setLabel('Wartość pola')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('inline')
          .setLabel('Inline? (tak / nie)')
          .setPlaceholder('tak')
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      )
    );
    return modal;
  }

  return null;
}

function buildPreviewObject(state) {
  const embed = new EmbedBuilder().setColor(state.color);
  if (state.title) embed.setTitle(state.title);
  if (state.description) embed.setDescription(state.description);
  if (state.authorName) {
    embed.setAuthor({
      name: state.authorName,
      iconURL: state.authorIcon || undefined,
      url: state.authorUrl || undefined
    });
  }
  if (state.footerText) {
    embed.setFooter({
      text: state.footerText,
      iconURL: state.footerIcon || undefined
    });
  }
  if (state.thumbnail) embed.setThumbnail(state.thumbnail);
  if (state.image) embed.setImage(state.image);
  if (state.timestamp) embed.setTimestamp();
  if (state.fields.length) embed.addFields(state.fields.slice(0, 25));
  return embed.toJSON();
}

async function refreshBuilder(messageId, channel) {
  const session = getSession(messageId);
  if (!session) return null;

  const message = await channel.messages.fetch(messageId).catch(() => null);
  if (!message) return null;

  await message.edit({
    content: '(Pusty podglad - uzyj menu ponizej, aby dodac tresc)',
    embeds: [renderPreview(session), renderPanel(session)],
    components: [buildMenu()]
  }).catch(() => {});

  resetExpiry(messageId, channel);
  return message;
}

async function openBuilderPanel(interaction) {
  const targetChannel = interaction.options.getChannel('kanal') || interaction.channel;
  const session = {
    ownerId: interaction.user.id,
    channelId: targetChannel.id,
    state: createDefaultState()
  };

  const message = await targetChannel.send({
    content: '(Pusty podglad - uzyj menu ponizej, aby dodac tresc)',
    embeds: [renderPreview(session), renderPanel(session)],
    components: [buildMenu()]
  });

  sessions.set(message.id, session);
  resetExpiry(message.id, targetChannel);
  return message;
}

async function handleBuilderSelect(interaction) {
  const session = getSession(interaction.message.id);
  if (!session) {
    await interaction.reply({ content: 'Sesja embeda wygasła.', flags: MessageFlags.Ephemeral });
    return true;
  }

  if (!canEdit(interaction, session)) {
    await interaction.reply({ content: 'To nie jest Twój kreator embeda.', flags: MessageFlags.Ephemeral });
    return true;
  }

  const action = interaction.values[0];

  if (action === 'timestamp') {
    session.state.timestamp = !session.state.timestamp;
    await refreshBuilder(interaction.message.id, interaction.channel);
    await interaction.reply({
      content: session.state.timestamp ? 'Znacznik czasu włączony.' : 'Znacznik czasu wyłączony.',
      flags: MessageFlags.Ephemeral
    });
    return true;
  }

  if (action === 'reset') {
    session.state = createDefaultState();
    await refreshBuilder(interaction.message.id, interaction.channel);
    await interaction.reply({ content: 'Panel wyczyszczony.', flags: MessageFlags.Ephemeral });
    return true;
  }

  if (action === 'raw') {
    await interaction.reply({
      content: '```json\n' + JSON.stringify(buildPreviewObject(session.state), null, 2).slice(0, 1900) + '\n```',
      flags: MessageFlags.Ephemeral
    });
    return true;
  }

  if (action === 'post') {
    const targetChannel = await interaction.guild.channels.fetch(session.channelId).catch(() => null);
    if (!targetChannel) {
      await interaction.reply({ content: 'Nie mogę znaleźć kanału docelowego.', flags: MessageFlags.Ephemeral });
      return true;
    }

    await targetChannel.send({ embeds: [renderPreview(session)] });
    await interaction.reply({ content: 'Embed wysłany.', flags: MessageFlags.Ephemeral });
    return true;
  }

  const modal = buildModal(interaction.message.id, action);
  if (!modal) {
    await interaction.reply({ content: 'Nieznana akcja.', flags: MessageFlags.Ephemeral });
    return true;
  }

  await interaction.showModal(modal);
  return true;
}

async function handleBuilderModal(interaction) {
  const match = interaction.customId.match(/^embedbuilder:([^:]+):(.+)$/);
  if (!match) return false;

  const action = match[1];
  const messageId = match[2];
  const session = getSession(messageId);

  if (!session) {
    await interaction.reply({ content: 'Sesja embeda wygasła.', flags: MessageFlags.Ephemeral });
    return true;
  }

  if (!canEdit(interaction, session)) {
    await interaction.reply({ content: 'To nie jest Twój kreator embeda.', flags: MessageFlags.Ephemeral });
    return true;
  }

  if (action === 'content') {
    const title = interaction.fields.getTextInputValue('title').trim();
    const description = interaction.fields.getTextInputValue('description').trim();
    session.state.title = title;
    session.state.description = description;
  }

  if (action === 'color') {
    const color = normalizeColor(interaction.fields.getTextInputValue('color'));
    if (color === null) {
      await interaction.reply({ content: 'Podaj poprawny kolor HEX albo liczbę.', flags: MessageFlags.Ephemeral });
      return true;
    }
    session.state.color = color;
  }

  if (action === 'author') {
    session.state.authorName = interaction.fields.getTextInputValue('name').trim();
    session.state.authorIcon = interaction.fields.getTextInputValue('icon').trim();
    session.state.authorUrl = interaction.fields.getTextInputValue('url').trim();
  }

  if (action === 'footer') {
    session.state.footerText = interaction.fields.getTextInputValue('text').trim();
    session.state.footerIcon = interaction.fields.getTextInputValue('icon').trim();
  }

  if (action === 'images') {
    session.state.thumbnail = interaction.fields.getTextInputValue('thumbnail').trim();
    session.state.image = interaction.fields.getTextInputValue('image').trim();
  }

  if (action === 'field') {
    if (session.state.fields.length >= 25) {
      await interaction.reply({ content: 'Masz już maksymalną liczbę pól.', flags: MessageFlags.Ephemeral });
      return true;
    }

    const name = interaction.fields.getTextInputValue('name').trim();
    const value = interaction.fields.getTextInputValue('value').trim();
    const inlineRaw = interaction.fields.getTextInputValue('inline')?.trim().toLowerCase();
    const inline = ['tak', 't', 'yes', 'y'].includes(inlineRaw);
    session.state.fields.push({ name, value, inline });
  }

  await interaction.reply({ content: 'Zaktualizowano podgląd.', flags: MessageFlags.Ephemeral });
  await refreshBuilder(messageId, interaction.channel);
  return true;
}

module.exports = {
  openBuilderPanel,
  handleBuilderSelect,
  handleBuilderModal
};
