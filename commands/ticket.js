const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { BRAND, BLUE } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Wysyla panel legit check do ticketu')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addChannelOption((option) =>
      option
        .setName('kanal')
        .setDescription('Kanal docelowy (domyslnie: obecny)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('kanal') || interaction.channel;

    if (channel?.setTopic && channel?.isTextBased?.()) {
      const topic = channel.topic || '';
      if (!topic.includes('legitCheckPanelAt:')) {
        const nextTopic = `${topic ? `${topic};` : ''}legitCheckPanelAt:${Date.now()}`;
        await channel.setTopic(nextTopic).catch(() => {});
      }
    }

    const embed = new EmbedBuilder()
      .setColor(BLUE)
      .setTitle('✅ ALL IN ONE | SHOP EXCHANGER × LEGIT CHECK')
      .setDescription(
        '📝 **WZÓR:**\n' +
        '```+rep @exchanger Exchanged [Z CZEGO] to [NA CO] [KWOTA]```\n\n' +
        '🔎 **PRZYKŁAD:**\n' +
        '```+rep @weklo Exchanged BLIK to CRYPTO 350.00 PLN```\n\n' +
        'ℹ️ Po wystawieniu legit checka ticket zamknie się sam.'
      )
      .setFooter({ text: BRAND.footer, iconURL: BRAND.icon });

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ Panel wysłany na ${channel}!`, ephemeral: true });
  }
};
