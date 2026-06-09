const { EmbedBuilder } = require('discord.js');

const BLUE = 0x1f35ff;
const GREEN = 0x22c55e;
const RED = 0xff315e;
const GOLD = 0xf7b731;
const DARK = 0x2b2d31;

const BRAND = {
  name: 'ALL IN ONE | SHOP EXCHANGER',
  footer: 'ALL IN ONE | SHOP EXCHANGER • 2026',
  icon: 'https://i.imgur.com/TRdgdSE.png',
  banners: {
    weryfikacja: 'https://i.imgur.com/hhneNpD.png',
    witamy: 'https://i.imgur.com/TRdgdSE.png',
    panelKlienta: 'https://i.imgur.com/tmg8ONZ.png',
    prowizje: 'https://i.imgur.com/SbtjTGx.png',
    oblicz: 'https://i.imgur.com/EK2l7K5.png',
    ticket: 'https://i.imgur.com/dLWZfTB.png',
    produkty: 'https://i.imgur.com/dQtNAPp.png',
    regulamin: 'https://i.imgur.com/0mFQAzT.png'
  }
};

const METHODS = {
  BLIK: { emoji: '<:Blik:1513951770068652032>', label: 'BLIK' },
  KOD_BLIK: { emoji: '<:Blik:1513951770068652032>', label: 'KOD BLIK' },
  PAYPAL: { emoji: '<:Paypal:1513951960729128970>', label: 'PAYPAL' },
  CRYPTO: { emoji: '<:Crypto:1513951457307656273>', label: 'CRYPTO' },
  PSC: { emoji: '<:294951psc:1513990391903555656>', label: 'KOD PAYSAFECARD' },
  MY_PSC: { emoji: '<:294951psc:1513990391903555656>', label: 'MY PAYSAFECARD' },
  SKRILL: { emoji: '<:skrilllogoroundedappiconfreepng:1513990362648281088>', label: 'SKRILL' },
  ZEN: { emoji: '<:ZENCOMTVN24Statementremovebgprev:1513990421087260843>', label: 'ZEN' },
  REVOLUT: { emoji: '<:Revolut:1513951419047219351>', label: 'REVOLUT' },
  WISE: { emoji: '<:payment:1513951561972453508>', label: 'WISE' },
  NETELLER: { emoji: '<:payment:1513951561972453508>', label: 'NETELLER' },
  VCC: { emoji: '<:payment:1513951561972453508>', label: 'VCC' },
  VINTED: { emoji: '<:Vinted:1513951660207112233>', label: 'VINTED' }
};

function baseEmbed(title, color = BLUE, image) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setFooter({ text: BRAND.footer, iconURL: BRAND.icon });

  if (image) embed.setImage(image);
  return embed;
}

function weryfikacjaEmbed() {
  return baseEmbed('```🎫 ALL IN ONE | SHOP EXCHANGER × WERYFIKACJA```', BLUE, BRAND.banners.weryfikacja)
    .setDescription('> ✅ × Aby się zweryfikować, **kliknij przycisk poniżej!**');
}

function witamyEmbed(member, count) {
  return baseEmbed('👋 ALL IN ONE | SHOP EXCHANGER × WITAMY', BLUE, BRAND.banners.witamy)
    .setDescription(
      `• 🧑‍🤝‍🧑 × Witaj **${member.user.username}** na ALL IN ONE | SHOP EXCHANGER\n` +
      `• 🔮 × Jesteś **${count} osobą** na naszym serwerze!\n` +
      '• ✨ × Liczymy, że zostaniesz z nami na dłużej!'
    );
}

function panelKlientaEmbed() {
  return baseEmbed('```🔎 ALL IN ONE | SHOP EXCHANGER × PANEL KLIENTA```', BLUE, BRAND.banners.panelKlienta)
    .setDescription('> 💾 × Poniżej znajdziesz panel, który umożliwia zarządzanie Twoim kontem.');
}

function prowizjeEmbed() {
  return baseEmbed('```💸 ALL IN ONE | SHOP EXCHANGER × PROWIZJE```', BLUE)
    .setDescription(
      '**Wybierz metodę z menu pod panelem, aby sprawdzić dokładną prowizję wymiany**.'
    )
    .addFields(
      {
        name: '**Metody podstawowe**',
        value:
          '<:Blik:1513951770068652032> × **BLIK**\n' +
          '<:Blik:1513951770068652032> × **KOD BLIK**\n' +
          '<:Paypal:1513951960729128970> × **PAYPAL**\n' +
          '<:Crypto:1513951457307656273> × **CRYPTO**\n' +
          '<:294951psc:1513990391903555656> × **KOD PAYSAFECARD**\n' +
          '<:skrilllogoroundedappiconfreepng:1513990362648281088> × **SKRILL**\n' +
          '<:ZENCOMTVN24Statementremovebgprev:1513990421087260843> × **ZEN**\n' +
          '<:Revolut:1513951419047219351> × **REVOLUT**\n' +
          '<:payment:1513951561972453508> × **WISE**\n' +
          '<:payment:1513951561972453508> × **NETELLER**\n' +
          '<:payment:1513951561972453508> × **VCC**\n' +
          '<:Vinted:1513951660207112233> × **VINTED**',
        inline: true
      }
    );
}

function prowizjeMethodEmbed(methodKey, rows) {
  const from = METHODS[methodKey] || { emoji: '💱', label: methodKey };
  const lines = Object.entries(rows || {})
    .map(([targetKey, fee]) => {
      const target = METHODS[targetKey] || { emoji: '💱', label: targetKey };
      return `• ${from.emoji} **${from.label}** » ${target.emoji} **${target.label}** × Prowizja: **${fee}**`;
    })
    .join('\n') || 'Brak danych dla tej metody.';

  return baseEmbed(`🌊 ALL IN ONE | SHOP EXCHANGER × PROWIZJE ${from.label}`, BLUE)
    .setDescription(`${lines}\n\n🚨 **MINIMALNA PROWIZJA WYMIANY WYNOSI 3 PLN** 🚨`);
}

function prowizjeBlikEmbed() {
  return prowizjeMethodEmbed('BLIK', {
    CRYPTO: '7%',
    PAYPAL: '3%',
    SKRILL: '3%',
    REVOLUT: '3%',
    ZEN: '3%',
    PSC: '5%',
    WISE: '5%',
    NETELLER: '3%',
    VCC: '5%'
  });
}

function obliczProwizjeEmbed() {
  return baseEmbed('```💵 ALL IN ONE | SHOP EXCHANGER × OBLICZ PROWIZJĘ```', BLUE, BRAND.banners.oblicz)
    .setDescription('> 💲 × Oblicz prowizję swojej wymiany w kilka sekund dzięki naszemu kalkulatorowi!');
}

function stworzTicketEmbed() {
  return baseEmbed('```🎫 ALL IN ONE | SHOP EXCHANGER × STWÓRZ TICKET```', BLUE, BRAND.banners.ticket)
    .setDescription('> 📩 × Wybierz odpowiednią kategorię, aby stworzyć ticketa!');
}

function regulaminEmbed() {
  return baseEmbed('```📜 ALL IN ONE | SHOP EXCHANGER × REGULAMIN```', BLUE, BRAND.banners.regulamin)
    .setDescription('> 📜 × Wybierz sekcję z listy poniżej, aby zapoznać się z regulaminem serwisu.');
}

function regulaminGeneralEmbed() {
  return baseEmbed('📜 ALL IN ONE | SHOP EXCHANGER × POSTANOWIENIA OGÓLNE', BLUE)
    .addFields(
      {
        name: 'Akceptacja regulaminu',
        value:
          'Dołączenie do serwera oznacza pełną akceptację niniejszego regulaminu oraz zasad funkcjonowania serwisu. ' +
          'Każdy użytkownik ma obowiązek zapoznać się z jego treścią.'
      },
      {
        name: 'Zgodność z ToS Discord',
        value:
          'Wszyscy członkowie muszą przestrzegać Warunków Korzystania z Usługi (ToS) Discord. ' +
          'Naruszenia zasad globalnych skutkują konsekwencjami administracyjnymi.'
      },
      {
        name: 'Zakaz reklam',
        value:
          'Zabronione jest promowanie zewnętrznych usług, serwerów lub produktów na kanałach publicznych oraz w wiadomościach prywatnych do członków. ' +
          'Skutkuje to natychmiastowym banem oraz wpisaniem na blacklistę bez możliwości odwołania.'
      }
    );
}

function regulaminExchangeEmbed() {
  return baseEmbed('📜 ALL IN ONE | SHOP EXCHANGER × REGULAMIN WYMIAN', BLUE)
    .addFields(
      {
        name: 'Odpowiedzialność za wymianę',
        value:
          'Każda wymiana odbywa się na odpowiedzialność użytkownika. Zaleca się dokładne sprawdzenie danych przed potwierdzeniem transakcji.'
      },
      {
        name: 'Zwroty i reklamacje',
        value:
          'Zwroty są możliwe wyłącznie po indywidualnej weryfikacji przez administrację. ' +
          'Brak wcześniejszego uzgodnienia warunków może skutkować odmową.'
      },
      {
        name: 'Limity i bezpieczeństwo',
        value:
          'Serwis może stosować limity transakcji i dodatkową weryfikację w celu ochrony użytkowników. ' +
          'W przypadku podejrzenia nadużycia transakcja może zostać wstrzymana.'
      }
    );
}

function regulaminFeesEmbed() {
  return baseEmbed('📜 ALL IN ONE | SHOP EXCHANGER × PROWIZJE', BLUE)
    .addFields(
      {
        name: 'Prowizje',
        value:
          'Aktualne prowizje wymiany są publikowane w panelu `PROWIZJE`. ' +
          'Użytkownik akceptuje możliwość ich aktualizacji przez administrację.'
      },
      {
        name: 'Informacje o opłatach',
        value:
          'Przed wysłaniem środków zalecane jest zapoznanie się z obowiązującą stawką. ' +
          'W razie wątpliwości należy skontaktować się ze staffem.'
      }
    );
}

function ticketOpenedEmbed(user, category) {
  return baseEmbed(`🎫 Ticket | ${category}`, BLUE)
    .setDescription(
      `👤 Użytkownik: ${user}\n` +
      `📋 Kategoria: **${category}**\n\n` +
      'Opisz dokładnie sprawę. Staff odpowie tak szybko, jak będzie mógł.'
    );
}

function repEmbed(fromUser, toUser, method, amount, totalRep) {
  return baseEmbed('+rep × Wymiana', GREEN)
    .addFields(
      { name: '👤 Od', value: `${fromUser}`, inline: true },
      { name: '👤 Dla', value: `${toUser}`, inline: true },
      { name: '💱 Metoda', value: method, inline: true },
      { name: '💰 Kwota', value: `${amount} PLN`, inline: true },
      { name: '⭐ Łączne reputacje', value: `${totalRep}`, inline: true }
    );
}

function legitCheckGuideEmbed() {
  return baseEmbed('✅ ALL IN ONE | SHOP EXCHANGER × LEGIT CHECK', BLUE)
    .setDescription(
      '📝 × **WZÓR:**\n' +
      '> `+rep @exchanger Exchanged [Z CZEGO] to [NA CO] [KWOTA]`\n\n' +
      '🔎 × **PRZYKŁAD:**\n' +
      '> **+rep @weklo Exchanged BLIK to CRYPTO 350.00 PLN**\n\n' +
      '✅・legit-check➜',
    );
}

function customEmbed(data) {
  const embed = new EmbedBuilder()
    .setColor(parseInt(data.color?.replace('#', '') || '1f35ff', 16))
    .setFooter({ text: BRAND.footer, iconURL: BRAND.icon });

  if (data.title) embed.setTitle(data.title);
  if (data.description) embed.setDescription(data.description);
  if (data.image) embed.setImage(data.image);
  if (data.thumbnail) embed.setThumbnail(data.thumbnail);
  if (data.fields) {
    data.fields.forEach(f => embed.addFields({ name: f.name, value: f.value, inline: f.inline || false }));
  }
  return embed;
}

module.exports = {
  BRAND,
  METHODS,
  weryfikacjaEmbed,
  witamyEmbed,
  panelKlientaEmbed,
  prowizjeEmbed,
  prowizjeMethodEmbed,
  prowizjeBlikEmbed,
  obliczProwizjeEmbed,
  stworzTicketEmbed,
  regulaminEmbed,
  regulaminGeneralEmbed,
  regulaminExchangeEmbed,
  regulaminFeesEmbed,
  ticketOpenedEmbed,
  repEmbed,
  legitCheckGuideEmbed,
  customEmbed,
  BLUE,
  GREEN,
  RED,
  GOLD,
  DARK
};
