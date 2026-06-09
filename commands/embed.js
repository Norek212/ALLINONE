const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Wyślij własny embed (tylko staff)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(o => o.setName('tytul').setDescription('Tytuł embeda').setRequired(true))
    .addStringOption(o => o.setName('opis').setDescription('Opis embeda').setRequired(true))
    .addStringOption(o => o.setName('kolor').setDescription('Kolor HEX (np. #0099ff)').setRequired(false))
    .addStringOption(o => o.setName('obrazek').setDescription('URL obrazka').setRequired(false))
    .addStringOption(o => o.setName('miniatura').setDescription('URL miniatury').setRequired(false))
    .addChannelOption(o => o.setName('kanal').setDescription('Kanał docelowy (domyślnie: obecny)').setRequired(false)),

  async execute(interaction) {
    const title = interaction.options.getString('tytul');
    const description = interaction.options.getString('opis');
    const color = interaction.options.getString('kolor') || '#0099ff';
    const image = interaction.options.getString('obrazek');
    const thumbnail = interaction.options.getString('miniatura');
    const channel = interaction.options.getChannel('kanal') || interaction.channel;

    let colorInt;
    try {
      colorInt = parseInt(color.replace('#', ''), 16);
      if (isNaN(colorInt)) colorInt = 0x0099ff;
    } catch {
      colorInt = 0x0099ff;
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(colorInt)
      .setTimestamp()
      .setFooter({ text: 'ALL IN ONE | SHOP EXCHANGER • 2026' });

    if (image) embed.setImage(image);
    if (thumbnail) embed.setThumbnail(thumbnail);

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ Embed wysłany na ${channel}!`, ephemeral: true });
  }
};
