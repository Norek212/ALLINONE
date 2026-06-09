const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { BLUE } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Lista wszystkich komend bota'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(BLUE)
      .setTitle('📋 ALL IN ONE | SHOP EXCHANGER × KOMENDY')
      .setDescription('Lista dostępnych komend:')
      .addFields(
        {
          name: '👤 Dla wszystkich',
          value:
            '`+rep @user metoda kwota` — Dodaj opinię po wymianie'
        },
        {
          name: '🛠️ Staff only',
          value:
            '`/send <wiadomosc> [#kanal]` — Wyślij wiadomość jako bot\n' +
            '`/embed <tytul> <opis> [kolor] [obrazek]` — Wyślij embed\n' +
            '`/setup <typ> [#kanal]` — Ustaw panel (weryfikacja, klient, prowizje, ticket, oblicz)'
        }
      )
      .setFooter({ text: 'ALL IN ONE | SHOP EXCHANGER • 2026' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
