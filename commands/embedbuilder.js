const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { openBuilderPanel } = require('../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embedbuilder')
    .setDescription('Otwiera polski kreator embeda')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addChannelOption((option) =>
      option
        .setName('kanal')
        .setDescription('Kanał docelowy dla publikacji embeda')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      await openBuilderPanel(interaction);
      await interaction.reply({
        content: '✅ Kreator embeda został otwarty.',
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ Nie udało się otworzyć kreatora embeda.',
        flags: MessageFlags.Ephemeral
      }).catch(() => {});
    }
  }
};
