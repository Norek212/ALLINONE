const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');
const {
  prowizjeMethodEmbed,
  ticketOpenedEmbed,
  regulaminGeneralEmbed,
  regulaminExchangeEmbed,
  regulaminFeesEmbed
} = require('./embeds');
const {
  shopCategoryEmbed,
  shopCategoryRow,
  shopItemEmbed
} = require('./shop');
const db = require('./db');

const PROWIZJE_DATA = {
  BLIK: { CRYPTO: 7, PAYPAL: 3, SKRILL: 3, REVOLUT: 3, ZEN: 3, PSC: 5, WISE: 5, NETELLER: 3, VCC: 5 },
  KOD_BLIK: { BLIK: 3, PAYPAL: 5, CRYPTO: 8, REVOLUT: 3, ZEN: 3 },
  PAYPAL: { BLIK: 3, CRYPTO: 7, SKRILL: 3, REVOLUT: 3, ZEN: 3 },
  CRYPTO: { BLIK: 3, PAYPAL: 3, SKRILL: 3, REVOLUT: 3, ZEN: 3, WISE: 5 },
  PSC: { BLIK: 5, PAYPAL: 5, CRYPTO: 8, REVOLUT: 5 },
  MY_PSC: { BLIK: 5, PAYPAL: 5, CRYPTO: 8, REVOLUT: 5 },
  SKRILL: { BLIK: 3, PAYPAL: 3, CRYPTO: 7, REVOLUT: 3, ZEN: 3 },
  ZEN: { BLIK: 3, PAYPAL: 3, CRYPTO: 7, SKRILL: 3 },
  REVOLUT: { BLIK: 3, PAYPAL: 3, CRYPTO: 7, SKRILL: 3, ZEN: 3 },
  WISE: { BLIK: 5, PAYPAL: 3, CRYPTO: 7, REVOLUT: 3 },
  NETELLER: { BLIK: 3, PAYPAL: 3, CRYPTO: 7, SKRILL: 3 },
  VCC: { BLIK: 5, PAYPAL: 5, CRYPTO: 8 },
  VINTED: { BLIK: 5, PAYPAL: 5, CRYPTO: 10 }
};

const DEFAULT_CALC_FROM = process.env.CALC_FROM_METHOD || 'BLIK';
const DEFAULT_CALC_TO = process.env.CALC_TO_METHOD || 'CRYPTO';

function buildCalcModal(action) {
  const isReceive = action === 'otrzymam';
  return new ModalBuilder()
    .setCustomId(`calc:${action}`)
    .setTitle(isReceive ? 'OBLICZ PROWIZJE - OTRZYMAM' : 'OBLICZ PROWIZJE - WYSLIJ')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('kwota')
          .setLabel(isReceive ? 'Kwota, ktora chcesz otrzymac' : 'Kwota, ktora chcesz wyslac')
          .setPlaceholder('Np. 100')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    );
}

function buildExchangeTicketModal() {
  return new ModalBuilder()
    .setCustomId('ticket:create_exchange')
    .setTitle('Potrzebne informacje.')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('amount')
          .setLabel('JAKA KWOTA?')
          .setPlaceholder('Przyklad: 250')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('owned_currency')
          .setLabel('JAKA WALUTE POSIADASZ?')
          .setPlaceholder('Przyklad: PLN / EUR / USD')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('from_method')
          .setLabel('Z CZEGO?')
          .setPlaceholder('Przyklad: BLIK')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('to_method')
          .setLabel('NA CO?')
          .setPlaceholder('Przyklad: CRYPTO')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    );
}

function buildPurchaseTicketModal() {
  return new ModalBuilder()
    .setCustomId('ticket:create_purchase')
    .setTitle('Zakup')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('product')
          .setLabel('Jaki produkt chcesz zakupić?')
          .setPlaceholder('Np. Spotify Lifetime')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      )
    );
}

function parseAmount(value) {
  const amount = Number(String(value).replace(',', '.'));
  return Number.isFinite(amount) ? amount : NaN;
}

function normalizeMethod(value) {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');

  if (normalized === 'KOD_BLIK' || normalized === 'KOD_BLIKU') return 'KOD_BLIK';
  if (normalized === 'KOD_BLIKOWY') return 'KOD_BLIK';
  if (normalized === 'KOD_PAYSAFECARD' || normalized === 'PAYSAFECARD') return 'PSC';
  if (normalized === 'KOD_PSC') return 'PSC';
  if (normalized === 'MY_PAYSAFECARD') return 'MY_PSC';
  if (normalized === 'MY_PSC') return 'MY_PSC';
  if (normalized === 'REVOULT') return 'REVOLUT';
  if (normalized === 'PAYSAFECARD') return 'PSC';
  return normalized;
}

function getCommissionRate(fromMethod, toMethod) {
  const from = normalizeMethod(fromMethod);
  const to = normalizeMethod(toMethod);

  if (!from || !to) return null;
  if (from === to) return 0;
  if (PROWIZJE_DATA[from]?.[to] !== undefined) return PROWIZJE_DATA[from][to];
  if (PROWIZJE_DATA[to]?.[from] !== undefined) return PROWIZJE_DATA[to][from];
  return null;
}

function calculateExchangeResult(amountValue, fromMethod, toMethod) {
  const amount = parseAmount(amountValue);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'Podaj poprawna kwote, np. 2500.' };
  }

  const rate = getCommissionRate(fromMethod, toMethod);
  if (rate === null) {
    return { error: 'Nie znaleziono prowizji dla tej pary metod.' };
  }

  const fee = Math.max(amount * (rate / 100), 3);
  return {
    rate,
    fee,
    result: Math.max(amount - fee, 0)
  };
}

async function resetSelectMenu(interaction) {
  if (!interaction.message?.components?.length) return;
  const components = interaction.message.components.map((row) =>
    typeof row.toJSON === 'function' ? row.toJSON() : row
  );
  await interaction.message.edit({ components }).catch(() => {});
}

function ticketButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket:claim')
      .setLabel('Przejmij')
      .setEmoji('🙋')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('ticket:approve_ticket')
      .setLabel('Zatwierdz ticket')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Zamknij ticket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger)
  );
}

async function createTicketChannel(interaction, category, categoryName, details = null) {
  const guild = interaction.guild;
  const ticketCategory = process.env.TICKET_CATEGORY_ID
    ? guild.channels.cache.get(process.env.TICKET_CATEGORY_ID)
    : null;

  const safeName = interaction.user.username
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 20);

  const ticketChannel = await guild.channels.create({
    name: `ticket-${category}-${safeName}`,
    type: ChannelType.GuildText,
    topic: `ticketOwner:${interaction.user.id};ticketType:${category}`,
    parent: ticketCategory?.id,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      ...(process.env.STAFF_ROLE_ID ? [{
        id: process.env.STAFF_ROLE_ID,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
      }] : [])
    ]
  });

  const embed = ticketOpenedEmbed(interaction.user, categoryName);
  if (details) {
    if (details.type === 'purchase') {
      embed.addFields({ name: 'Produkt', value: details.product, inline: false });
    } else {
      const calculation = calculateExchangeResult(details.amount, details.fromMethod, details.toMethod);
      embed.addFields(
        { name: 'Kwota', value: details.amount, inline: true },
        { name: 'Waluta', value: details.ownedCurrency, inline: true },
        { name: 'Z czego', value: details.fromMethod, inline: true },
        { name: 'Na co', value: details.toMethod, inline: true },
        {
          name: 'Po prowizji otrzyma',
          value: calculation && !calculation.error
            ? `${calculation.result.toFixed(2)} ${details.ownedCurrency}\nProwizja: ${calculation.fee.toFixed(2)} ${details.ownedCurrency} (${calculation.rate}%)`
            : calculation?.error || 'Nie znaleziono prowizji dla tej pary metod.',
          inline: false
        }
      );
    }
  }

  await ticketChannel.send({
    content: `${interaction.user} ${process.env.STAFF_ROLE_ID ? `<@&${process.env.STAFF_ROLE_ID}>` : ''}`,
    embeds: [embed],
    components: [ticketButtons()]
  });

  return ticketChannel;
}

async function handleSelect(interaction) {
  const { customId, values } = interaction;

  if (customId === 'shop:main') {
    const embed = shopCategoryEmbed(values[0]);
    const row = shopCategoryRow(values[0]);

    if (!embed || !row) {
      await interaction.reply({ content: 'Nie znaleziono tej kategorii sklepu.', ephemeral: true });
      await resetSelectMenu(interaction);
      return;
    }

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    await resetSelectMenu(interaction);
    return;
  }

  if (customId.startsWith('shop:category:')) {
    const categoryKey = customId.split(':')[2];
    const embed = shopItemEmbed(categoryKey, values[0]);

    if (!embed) {
      await interaction.reply({ content: 'Nie znaleziono tej oferty.', ephemeral: true });
      return;
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (customId === 'prowizje_select') {
    await interaction.reply({
      embeds: [prowizjeMethodEmbed(values[0], PROWIZJE_DATA[values[0]])],
      ephemeral: true
    });
    await resetSelectMenu(interaction);
    return;
  }

  if (customId === 'panel_klienta_select') {
    const option = values[0];
    const summary = db.getUserSummary(interaction.user.id);

    if (option === 'sprawdz') {
      await interaction.reply({
        content: `Masz **${summary.exchangesCount}** wymian.\nLaczna kwota wymieniona: **${summary.totalAmount.toFixed(2)} PLN**.`,
        ephemeral: true
      });
      await resetSelectMenu(interaction);
      return;
    }

    if (option === 'historia') {
      if (summary.exchanges.length === 0) {
        await interaction.reply({ content: 'Nie masz jeszcze zadnych wymian.', ephemeral: true });
        await resetSelectMenu(interaction);
        return;
      }

      const list = summary.exchanges
        .slice(-10)
        .reverse()
        .map((exchange, index) => {
          const date = exchange.date ? new Date(exchange.date).toLocaleDateString('pl-PL') : 'brak daty';
          return `**${index + 1}.** ${exchange.method || '?'} | ${Number(exchange.amount || 0).toFixed(2)} PLN | ${date}`;
        })
        .join('\n');

      await interaction.reply({
        content: `**Historia Twoich wymian**\nLiczba: **${summary.exchangesCount}**\nSuma: **${summary.totalAmount.toFixed(2)} PLN**\n\n${list}`,
        ephemeral: true
      });
      await resetSelectMenu(interaction);
      return;
    }
  }

  if (customId === 'regulamin_select') {
    const renderers = {
      general: regulaminGeneralEmbed,
      exchange: regulaminExchangeEmbed,
      fees: regulaminFeesEmbed
    };
    const render = renderers[values[0]];

    if (!render) {
      await interaction.reply({ content: 'Nieznana sekcja regulaminu.', ephemeral: true });
      await resetSelectMenu(interaction);
      return;
    }

    await interaction.reply({ embeds: [render()], ephemeral: true });
    await resetSelectMenu(interaction);
    return;
  }

  if (customId === 'oblicz_select') {
    await interaction.showModal(buildCalcModal(values[0]));
    await resetSelectMenu(interaction);
    return;
  }

  if (customId === 'ticket_select') {
    const category = values[0];
    const categoryNames = {
      wymiana: 'Wymiana',
      zakup: 'Zakup',
      pomoc: 'Pomoc',
      rekrutacja: 'Rekrutacja'
    };
    const categoryName = categoryNames[category] || category;

    if (category === 'wymiana') {
      await interaction.showModal(buildExchangeTicketModal());
      await resetSelectMenu(interaction);
      return;
    }

    if (category === 'zakup') {
      await interaction.showModal(buildPurchaseTicketModal());
      await resetSelectMenu(interaction);
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const ticketChannel = await createTicketChannel(interaction, category, categoryName);
      await interaction.editReply({ content: `✅ Ticket stworzony: ${ticketChannel}` });
      await resetSelectMenu(interaction);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ content: '❌ Nie udalo sie stworzyc ticketu.' });
      await resetSelectMenu(interaction);
    }
  }
}

module.exports = {
  handleSelect,
  PROWIZJE_DATA,
  DEFAULT_CALC_FROM,
  DEFAULT_CALC_TO,
  parseAmount,
  getCommissionRate,
  calculateExchangeResult,
  createTicketChannel
};
