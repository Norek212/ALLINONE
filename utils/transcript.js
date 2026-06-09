const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

const TRANSCRIPT_CHANNEL_ID = process.env.TRANSCRIPT_CHANNEL_ID || '1513663891740164158';
const MAX_FETCHED_MESSAGES = 1000;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseTopic(topic = '') {
  return {
    ownerId: topic.match(/ticketOwner:(\d{17,20})/)?.[1],
    type: topic.match(/ticketType:([^;]+)/)?.[1],
    claimedBy: topic.match(/claimedBy:(\d{17,20})/)?.[1]
  };
}

async function fetchTicketMessages(channel) {
  const messages = [];
  let before;

  while (messages.length < MAX_FETCHED_MESSAGES) {
    const batch = await channel.messages.fetch({ limit: 100, before }).catch(() => null);
    if (!batch?.size) break;

    messages.push(...batch.values());
    before = batch.last().id;
    if (batch.size < 100) break;
  }

  return messages
    .slice(0, MAX_FETCHED_MESSAGES)
    .sort((a, b) => a.createdTimestamp - b.createdTimestamp);
}

function buildTranscriptHtml({ guild, channel, messages }) {
  const rows = messages.map((message) => {
    const attachments = message.attachments.size
      ? `<div class="attachments">${message.attachments.map((file) =>
          `<a href="${escapeHtml(file.url)}">${escapeHtml(file.name || file.url)}</a>`
        ).join('<br>')}</div>`
      : '';

    const embeds = message.embeds.length
      ? `<div class="embeds">Embeds: ${message.embeds.length}</div>`
      : '';

    return `
      <article class="message">
        <div class="meta">
          <strong>${escapeHtml(message.author?.tag || 'Unknown')}</strong>
          <span>${new Date(message.createdTimestamp).toLocaleString('pl-PL')}</span>
        </div>
        <div class="content">${escapeHtml(message.content || '[brak tekstu]').replace(/\n/g, '<br>')}</div>
        ${attachments}
        ${embeds}
      </article>`;
  }).join('\n');

  return `<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <title>Transcript ${escapeHtml(channel.name)}</title>
  <style>
    body { margin: 0; background: #111318; color: #eceef3; font-family: Arial, sans-serif; }
    header { padding: 22px 28px; background: #1b1f2a; border-bottom: 1px solid #2d3342; }
    h1 { margin: 0 0 8px; font-size: 22px; }
    .sub { color: #aeb6c7; font-size: 13px; }
    main { padding: 18px 28px 36px; }
    .message { padding: 14px 0; border-bottom: 1px solid #2a2f3d; }
    .meta { display: flex; gap: 12px; align-items: baseline; margin-bottom: 6px; }
    .meta span { color: #9aa3b8; font-size: 12px; }
    .content { white-space: normal; line-height: 1.45; }
    a { color: #7aa2ff; }
    .attachments, .embeds { margin-top: 8px; color: #b9c1d6; font-size: 13px; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(guild.name)} / #${escapeHtml(channel.name)}</h1>
    <div class="sub">Messages: ${messages.length} | Channel ID: ${channel.id}</div>
  </header>
  <main>${rows || '<p>Brak wiadomosci w tickecie.</p>'}</main>
</body>
</html>`;
}

function countAttachments(messages) {
  return messages.reduce((total, message) => total + message.attachments.size, 0);
}

function usersInTranscript(messages) {
  const users = new Map();

  for (const message of messages) {
    const id = message.author?.id;
    if (!id) continue;
    const current = users.get(id) || {
      id,
      tag: message.author.tag || message.author.username || id,
      count: 0
    };
    current.count += 1;
    users.set(id, current);
  }

  return [...users.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((user) => `${user.count} - <@${user.id}> - ${user.tag}`)
    .join('\n') || 'Brak';
}

async function sendTicketTranscript(interaction, reason = 'closed') {
  const channel = interaction.channel;
  const guild = interaction.guild;
  const logChannel = await guild.channels.fetch(TRANSCRIPT_CHANNEL_ID).catch(() => null);

  if (!logChannel?.isTextBased?.()) {
    throw new Error(`Transcript channel not found: ${TRANSCRIPT_CHANNEL_ID}`);
  }

  const topic = parseTopic(channel.topic);
  const messages = await fetchTicketMessages(channel);
  const attachmentsSaved = countAttachments(messages);
  const attachmentsSkipped = 0;
  const fileName = `transcript-${channel.name}.html`;
  const html = buildTranscriptHtml({ guild, channel, messages });
  const attachment = new AttachmentBuilder(Buffer.from(html, 'utf8'), { name: fileName });

  const serverInfo = [
    '<Server-Info>',
    `  Server: ${guild.name} (${guild.id})`,
    `  Channel: ${channel.name} (${channel.id})`,
    `  Messages: ${messages.length}`,
    `  Attachments Saved: ${attachmentsSaved}`,
    `  Attachments Skipped: ${attachmentsSkipped} (due maximum file size limits.)`
  ].join('\n');

  const panelName = topic.type || 'ticket';
  const embed = new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle(interaction.user.tag)
    .addFields(
      { name: 'Ticket Owner', value: topic.ownerId ? `<@${topic.ownerId}>` : 'Nieznany', inline: true },
      { name: 'Ticket Name', value: channel.name, inline: true },
      { name: 'Panel Name', value: panelName, inline: true },
      { name: 'Direct Transcript', value: 'Use Button', inline: true },
      { name: 'Users in transcript', value: usersInTranscript(messages).slice(0, 1024), inline: true },
      { name: 'Status', value: `${reason}${topic.claimedBy ? ` przez <@${topic.claimedBy}>` : ''}`, inline: true }
    )
    .setTimestamp();

  const sent = await logChannel.send({
    content: `\`\`\`\n${serverInfo}\n\`\`\``,
    embeds: [embed],
    files: [attachment]
  });

  const transcriptUrl = sent.attachments.first()?.url;
  if (transcriptUrl) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Direct Link')
        .setEmoji('📎')
        .setStyle(ButtonStyle.Link)
        .setURL(transcriptUrl)
    );

    await sent.edit({ components: [row] }).catch(console.error);
  }

  return sent;
}

module.exports = {
  sendTicketTranscript
};
