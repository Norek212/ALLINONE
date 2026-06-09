const { PermissionFlagsBits, MessageFlags, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { sendTicketTranscript } = require('./transcript');

function canManageTickets(interaction) {
  return (
    interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages) ||
    (process.env.STAFF_ROLE_ID && interaction.member.roles?.cache?.has(process.env.STAFF_ROLE_ID))
  );
}

function getTicketMeta(interaction) {
  const topic = interaction.channel?.topic || '';
  return {
    ownerId: topic.match(/ticketOwner:(\d{17,20})/)?.[1] || null,
    type: topic.match(/ticketType:([^;]+)/)?.[1] || null
  };
}

function canCloseOwnTicket(interaction) {
  const { ownerId } = getTicketMeta(interaction);
  return (
    interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ||
    interaction.guild?.ownerId === interaction.user.id ||
    (ownerId && ownerId === interaction.user.id)
  );
}

async function closeTicket(interaction, reason) {
  const notice = reason === 'approved'
    ? 'Ticket zamykam za 3 sekundy...'
    : 'Ticket zamykam za 3 sekundy...';

  if (!interaction.deferred && !interaction.replied) {
    await interaction.reply({
      content: notice,
      flags: MessageFlags.Ephemeral
    }).catch((error) => {
      if (![10062, 40060].includes(error?.code)) {
        console.error(error);
      }
    });
  }

  try {
    await sendTicketTranscript(interaction, reason);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply('✅ Transcript wyslany. Ticket zamyka sie za 3 sekundy...').catch(() => {});
    }

    const channel = interaction.channel;
    setTimeout(async () => {
      await channel?.delete().catch(console.error);
    }, 3000);
  } catch (error) {
    console.error(error);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply('❌ Nie udalo sie wyslac transcriptu. Sprawdz kanal logow i uprawnienia bota.').catch(() => {});
    }
  }
}

async function openApproveExchangeModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('ticket:approve_exchange')
    .setTitle('Zatwierdz wymiane');

  const methodRow = new ActionRowBuilder().addComponents(
    new TextInputBuilder()
      .setCustomId('method')
      .setLabel('Metoda wymiany')
      .setPlaceholder('Np. BLIK')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
  );

  const amountRow = new ActionRowBuilder().addComponents(
    new TextInputBuilder()
      .setCustomId('amount')
      .setLabel('Kwota wymiany')
      .setPlaceholder('Np. 350')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
  );

  modal.addComponents(methodRow, amountRow);
  await interaction.showModal(modal);
}

async function handleButton(interaction) {
  const { customId } = interaction;

  if (customId === 'verify') {
    const roleId = process.env.VERIFIED_ROLE_ID;
    if (!roleId) {
      await interaction.reply({ content: 'Brakuje VERIFIED_ROLE_ID w pliku .env.', flags: MessageFlags.Ephemeral });
      return;
    }

    const member = interaction.member;
    if (member.roles.cache.has(roleId)) {
      await interaction.reply({ content: 'Jestes juz zweryfikowany!', flags: MessageFlags.Ephemeral });
      return;
    }

    try {
      await member.roles.add(roleId);
      await interaction.reply({ content: 'Zostales zweryfikowany. Witaj na serwerze!', flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Nie udalo sie nadac roli.', flags: MessageFlags.Ephemeral });
    }
    return;
  }

  if (customId === 'ticket:claim') {
    if (!canManageTickets(interaction)) {
      await interaction.reply({ content: 'Nie masz uprawnien do przejmowania ticketow.', flags: MessageFlags.Ephemeral });
      return;
    }

    const currentClaim = interaction.channel?.topic?.match(/claimedBy:(\d{17,20})/)?.[1];
    const newTopicBase = interaction.channel?.topic?.replace(/;?claimedBy:\d{17,20}/, '') || '';
    const updatedTopic = `${newTopicBase}${newTopicBase ? ';' : ''}claimedBy:${interaction.user.id}`;
    await interaction.channel.setTopic(updatedTopic).catch(console.error);

    await interaction.reply({
      content: currentClaim
        ? `Ticket byl juz przejety, teraz prowadzi go: <@${interaction.user.id}>.`
        : `Przejales ticket: <@${interaction.user.id}>.`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  if (customId === 'ticket:approve_ticket' || customId === 'ticket:approve_exchange') {
    if (!canManageTickets(interaction)) {
      await interaction.reply({ content: 'Nie masz uprawnien do zatwierdzania ticketow.', flags: MessageFlags.Ephemeral });
      return;
    }

    const { type } = getTicketMeta(interaction);
    if (customId === 'ticket:approve_ticket' && type === 'wymiana') {
      await openApproveExchangeModal(interaction);
      return;
    }

    await closeTicket(interaction, 'approved');
    return;
  }

  if (customId === 'close_ticket') {
    if (!canCloseOwnTicket(interaction)) {
      await interaction.reply({
        content: 'Tylko wlasciciel ticketu albo admin moze go zamknac.',
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    await closeTicket(interaction, 'closed');
  }
}

module.exports = { handleButton };
