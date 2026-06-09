const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('send')
    .setDescription('Wyślij wiadomość jako bot na wybrany kanał (staff only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(o => o.setName('wiadomosc').setDescription('Treść wiadomości').setRequired(true))
    .addChannelOption(o => o.setName('kanal').setDescription('Kanał docelowy').setRequired(false)),

  async execute(interaction) {
    const msg = interaction.options.getString('wiadomosc');
    const channel = interaction.options.getChannel('kanal') || interaction.channel;

    await channel.send(msg);
    await interaction.reply({ content: `✅ Wysłano na ${channel}!`, ephemeral: true });
  }
};
