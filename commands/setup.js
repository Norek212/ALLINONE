const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  MessageFlags
} = require('discord.js');
const {
  weryfikacjaEmbed,
  panelKlientaEmbed,
  prowizjeEmbed,
  obliczProwizjeEmbed,
  stworzTicketEmbed,
  regulaminEmbed
} = require('../utils/embeds');
const { shopMainEmbed, shopMainRow } = require('../utils/shop');

const PROWIZJE_OPTIONS = [
  { label: '× BLIK', value: 'BLIK' },
  { label: '× KOD BLIK', value: 'KOD_BLIK' },
  { label: '× PAYPAL', value: 'PAYPAL' },
  { label: '× CRYPTO', value: 'CRYPTO' },
  { label: '× KOD PAYSAFECARD', value: 'PSC' },
  { label: '× MY PAYSAFECARD', value: 'MY_PSC' },
  { label: '× SKRILL', value: 'SKRILL' },
  { label: '× ZEN', value: 'ZEN' },
  { label: '× REVOLUT', value: 'REVOLUT' },
  { label: '× WISE', value: 'WISE' },
  { label: '× NETELLER', value: 'NETELLER' },
  { label: '× VCC', value: 'VCC' },
  { label: '× VINTED', value: 'VINTED' }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Wysyla panel na wybranym kanale')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName('typ')
        .setDescription('Ktory panel wyslac?')
        .setRequired(true)
        .addChoices(
          { name: 'Weryfikacja', value: 'weryfikacja' },
          { name: 'Regulamin', value: 'regulamin' },
          { name: 'Panel Klienta', value: 'panel_klienta' },
          { name: 'Prowizje', value: 'prowizje' },
          { name: 'Oblicz Prowizje', value: 'oblicz' },
          { name: 'Stworz Ticket', value: 'ticket' },
          { name: 'Shop', value: 'shop' }
        )
    )
    .addChannelOption((option) =>
      option
        .setName('kanal')
        .setDescription('Kanal docelowy')
        .setRequired(false)
    ),

  async execute(interaction) {
    const typ = interaction.options.getString('typ');
    const channel = interaction.options.getChannel('kanal') || interaction.channel;

    try {
      if (typ === 'weryfikacja') {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('verify')
            .setLabel('Zweryfikuj sie')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success)
        );
        await channel.send({ embeds: [weryfikacjaEmbed()], components: [row] });
      } else if (typ === 'panel_klienta') {
        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('panel_klienta_select')
            .setPlaceholder('Wybierz opcje...')
            .addOptions([
              { label: '× SPRAWDZ, ILE WYMIENILES', description: 'Pokazuje laczna liczbe i kwote wymian.', value: 'sprawdz' },
              { label: '× HISTORIA TWOICH WYMIAN', description: 'Pokazuje historie twoich wymian.', value: 'historia' }
            ])
        );
        await channel.send({ embeds: [panelKlientaEmbed()], components: [row] });
      } else if (typ === 'regulamin') {
        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('regulamin_select')
            .setPlaceholder('Wybierz sekcje regulaminu...')
            .addOptions([
              { label: '× POSTANOWIENIA OGOLNE', description: 'Akceptacja, ToS Discord, reklamy.', value: 'general' },
              { label: '× REGULAMIN WYMIAN', description: 'Odpowiedzialnosc, zwroty, limity.', value: 'exchange' },
              { label: '× PROWIZJE', description: 'Informacje o prowizjach.', value: 'fees' }
            ])
        );
        await channel.send({ embeds: [regulaminEmbed()], components: [row] });
      } else if (typ === 'prowizje') {
        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('prowizje_select')
            .setPlaceholder('Wybierz metode...')
            .addOptions(PROWIZJE_OPTIONS)
        );
        await channel.send({ embeds: [prowizjeEmbed()], components: [row] });
      } else if (typ === 'oblicz') {
        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('oblicz_select')
            .setPlaceholder('Wybierz opcje...')
            .addOptions([
              { label: '× Jaka kwote otrzymam?', value: 'otrzymam' },
              { label: '× Ile musze wyslac, aby otrzymac kwote ktora chce?', value: 'wyslac' }
            ])
        );
        await channel.send({ embeds: [obliczProwizjeEmbed()], components: [row] });
      } else if (typ === 'ticket') {
        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Nie wybrano zadnej opcji')
            .addOptions([
              { label: '× WYMIANA', description: 'Utworz ticket dotyczacy wymiany', value: 'wymiana' },
              { label: '× ZAKUP', description: 'Utworz ticket dotyczacy zakupu', value: 'zakup' },
              { label: '× POMOC', description: 'Utworz ticket dotyczacy pomocy', value: 'pomoc' },
              { label: '× REKRUTACJA', description: 'Utworz ticket rekrutacji', value: 'rekrutacja' }
            ])
        );
        await channel.send({ embeds: [stworzTicketEmbed()], components: [row] });
      } else if (typ === 'shop') {
        await channel.send({ embeds: [shopMainEmbed()], components: [shopMainRow()] });
      }

      const reply = { content: `✅ Panel **${typ}** wyslany na ${channel}!`, flags: MessageFlags.Ephemeral };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(reply);
      } else {
        await interaction.reply(reply);
      }
    } catch (error) {
      console.error(error);
      const reply = { content: '❌ Nie udalo sie wyslac panelu.', flags: MessageFlags.Ephemeral };
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(reply).catch(() => {});
      } else {
        await interaction.reply(reply).catch(() => {});
      }
    }
  }
};
