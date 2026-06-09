const { EmbedBuilder } = require('discord.js');
const { BLUE, BRAND, repEmbed } = require('./embeds');
const db = require('./db');
const { PROWIZJE_DATA, DEFAULT_CALC_FROM, DEFAULT_CALC_TO, parseAmount, createTicketChannel } = require('./selectHandler');

function formatLegitName(count) {
  return `✅｜legit-check --> ${count}`;
}

function formatOpinieName(count) {
  return `✅｜opinie --> ${count}`;
}

function getRate(from, to) {
  return PROWIZJE_DATA[from]?.[to];
}

function calcReceive(amount, rate) {
  const fee = Math.max(amount * (rate / 100), 3);
  return { fee, result: Math.max(amount - fee, 0) };
}

function calcSend(amount, rate) {
  const fee = Math.max((amount * rate) / (100 - rate), 3);
  return { fee, result: amount + fee };
}

async function syncRepChannels(guild) {
  const totalRep = db.getTotalRep();
  const legitChannelId = process.env.LEGIT_CHECK_CHANNEL_ID || '1513663849478488147';
  const opinieChannelId = process.env.OPINIE_CHANNEL_ID;

  const legitChannel = await guild.channels.fetch(legitChannelId).catch(() => null);
  if (legitChannel) {
    await legitChannel.setName(formatLegitName(totalRep)).catch(console.error);
  }

  if (opinieChannelId) {
    const opinieChannel = await guild.channels.fetch(opinieChannelId).catch(() => null);
    if (opinieChannel) {
      await opinieChannel.setName(formatOpinieName(totalRep)).catch(console.error);
    }
  }
}

async function sendRepToChannels(guild, target, embed) {
  const opinieChannelId = process.env.OPINIE_CHANNEL_ID;
  const legitChannelId = process.env.LEGIT_CHECK_CHANNEL_ID || '1513663849478488147';
  const opinieChannel = opinieChannelId ? await guild.channels.fetch(opinieChannelId).catch(() => null) : null;
  const legitChannel = await guild.channels.fetch(legitChannelId).catch(() => null);
  const channel = opinieChannel || legitChannel;

  if (channel) {
    await channel.send({ content: `+rep <@${target.id}>`, embeds: [embed] });
  }
}

async function handleTicketApproveExchange(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const method = interaction.fields.getTextInputValue('method').trim();
  const amount = parseAmount(interaction.fields.getTextInputValue('amount'));
  const userId = interaction.channel?.topic?.match(/ticketOwner:(\d{17,20})/)?.[1];

  if (!userId) {
    await interaction.editReply('❌ Nie mogę odczytać właściciela ticketa. Utwórz nowy ticket z panelu.');
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    await interaction.editReply('❌ Podaj poprawną kwotę większą od zera.');
    return;
  }

  const targetUser = await interaction.client.users.fetch(userId).catch(() => null);
  if (!targetUser) {
    await interaction.editReply('❌ Nie znalazłem właściciela ticketa.');
    return;
  }

  const totalRep = db.addRep(targetUser.id, {
    from: interaction.user.tag,
    to: targetUser.tag,
    method,
    amount,
    giver: interaction.user.id
  });

  const embed = repEmbed(interaction.user, targetUser, method, amount, totalRep);
  await sendRepToChannels(interaction.guild, targetUser, embed);
  await syncRepChannels(interaction.guild);

  await interaction.editReply(`✅ Zatwierdzono wymianę dla **${targetUser.tag}**. Ticket zamknie się za 3 sekundy.`);
  setTimeout(async () => {
    await interaction.channel?.delete().catch(console.error);
  }, 3000);
}

async function handleCalculator(interaction) {
  const action = interaction.customId.split(':')[1];
  const amount = parseAmount(interaction.fields.getTextInputValue('kwota'));

  if (!Number.isFinite(amount) || amount <= 0) {
    await interaction.reply({ content: '❌ Podaj poprawną kwotę większą od zera.', ephemeral: true });
    return;
  }

  const from = DEFAULT_CALC_FROM;
  const to = DEFAULT_CALC_TO;
  const rate = getRate(from, to);

  if (rate === undefined) {
    await interaction.reply({
      content: `❌ Brak ustawionej prowizji dla **${from} → ${to}**.`,
      ephemeral: true
    });
    return;
  }

  const calculation = action === 'otrzymam'
    ? calcReceive(amount, rate)
    : calcSend(amount, rate);

  const embed = new EmbedBuilder()
    .setColor(BLUE)
    .setTitle('💵 ALL IN ONE | SHOP EXCHANGER × OBLICZ PROWIZJĘ')
    .setDescription('💲 × Oblicz prowizję swojej wymiany w kilka sekund dzięki naszemu kalkulatorowi!')
    .addFields(
      { name: 'Metoda', value: `${from} → ${to}`, inline: true },
      { name: 'Prowizja', value: `${rate}%`, inline: true },
      { name: 'Minimalna opłata', value: '3 PLN', inline: true }
    )
    .setFooter({ text: BRAND.footer, iconURL: BRAND.icon });

  if (action === 'otrzymam') {
    embed.addFields(
      { name: 'Wysyłasz', value: `${amount.toFixed(2)} PLN`, inline: true },
      { name: 'Prowizja', value: `${calculation.fee.toFixed(2)} PLN`, inline: true },
      { name: 'Otrzymasz', value: `${calculation.result.toFixed(2)} PLN`, inline: true }
    );
  } else {
    embed.addFields(
      { name: 'Chcesz otrzymać', value: `${amount.toFixed(2)} PLN`, inline: true },
      { name: 'Prowizja', value: `${calculation.fee.toFixed(2)} PLN`, inline: true },
      { name: 'Musisz wysłać', value: `${calculation.result.toFixed(2)} PLN`, inline: true }
    );
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleCreateExchangeTicket(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const details = {
    amount: interaction.fields.getTextInputValue('amount').trim(),
    ownedCurrency: interaction.fields.getTextInputValue('owned_currency').trim(),
    fromMethod: interaction.fields.getTextInputValue('from_method').trim(),
    toMethod: interaction.fields.getTextInputValue('to_method').trim()
  };

  try {
    const ticketChannel = await createTicketChannel(interaction, 'wymiana', 'Wymiana', details);
    await interaction.editReply({ content: `✅ Ticket stworzony: ${ticketChannel}` });
  } catch (error) {
    console.error(error);
    await interaction.editReply({ content: '❌ Nie udalo sie stworzyc ticketa wymiany.' });
  }
}

async function handleCreatePurchaseTicket(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const details = {
    type: 'purchase',
    product: interaction.fields.getTextInputValue('product').trim()
  };

  try {
    const ticketChannel = await createTicketChannel(interaction, 'zakup', 'Zakup', details);
    await interaction.editReply({ content: `✅ Ticket stworzony: ${ticketChannel}` });
  } catch (error) {
    console.error(error);
    await interaction.editReply({ content: '❌ Nie udalo sie stworzyc ticketa zakupu.' });
  }
}

async function handleModal(interaction) {
  if (interaction.customId === 'ticket:create_exchange') {
    await handleCreateExchangeTicket(interaction);
    return;
  }

  if (interaction.customId === 'ticket:create_purchase') {
    await handleCreatePurchaseTicket(interaction);
    return;
  }

  if (interaction.customId === 'ticket:approve_exchange') {
    await handleTicketApproveExchange(interaction);
    return;
  }

  if (interaction.customId.startsWith('calc:')) {
    await handleCalculator(interaction);
  }
}

module.exports = { handleModal };
