const { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js');
const { BRAND } = require('./embeds');

const SHOP_COLOR = 0x1f35ff;
const SHOP_BANNER = process.env.SHOP_BANNER_URL || BRAND.banners.produkty || BRAND.banners.ticket;
const SHOP_THUMBNAIL = process.env.SHOP_THUMBNAIL_URL || BRAND.icon;

const OFFER_NITRO_GIFT = {
  title: '🛒 OKAZJA × OFERTA N!TRO GIFT',
  description:
    '<a:Nitro:1513951613100757052> × **N!TRO BOOST G!FT**\n' +
    '> Trwanie : 1 Miesiąc\n' +
    '> Cena : `22 PLN`\n' +
    '<a:Nitro:1513951613100757052> × **N!TRO BAS!C G!FT**\n' +
    '> Trwanie : 1 Miesiąc\n' +
    '> Cena : `8 PLN`',
  banner: process.env.SHOP_NITRO_GIFT_BANNER_URL || SHOP_BANNER,
  thumbnail: process.env.SHOP_NITRO_GIFT_THUMBNAIL_URL || SHOP_THUMBNAIL,
  fields: []
};

const OFFER_SERVER_BOOST = {
  title: '🛒 OKAZJA × OFERTA SERVER BOOST',
  description:
      '<a:Boost:1513951493970071634> × **SERVER BOOST**\n' +
    '> Trwanie : 1 Miesiąc\n' +
    '> Cena : `15 PLN`\n' +
    '<a:Boost:1513951493970071634> × **SERVER BOOST**\n' +
    '> Trwanie : 3 Miesiąc\n' +
    '> Cena : `32 PLN`',
  banner: process.env.SHOP_SERVER_BOOST_BANNER_URL || SHOP_BANNER,
  thumbnail: process.env.SHOP_SERVER_BOOST_THUMBNAIL_URL || SHOP_THUMBNAIL,
  fields: []
};

const OFFER_DEKORACJE = {
  title: '🛒 OKAZJA × OFERTA DEKORACJE',
  description:
    '<:Discordlogo:1513981304067199108> × **RANDOM DEKORACJA**\n' +
    '> Trwanie : LIFETIME\n' +
    '> Cena : `10 PLN`\n',
  banner: process.env.SHOP_DEKORACJE_BANNER_URL || SHOP_BANNER,
  thumbnail: process.env.SHOP_DEKORACJE_THUMBNAIL_URL || SHOP_THUMBNAIL,
  fields: []
};

const OFFER_ONLINE_MEMBERS = {
  title: '🛒 OKAZJA × OFERTA ONLINE M3MBERS',
  description:
    '🟢 × **ONLINE M3MBERS**\n' +
    '> Ilośc : 500\n' +
    '> Cena : `6 PLN`\n' +
    '🟢 × **ONLINE M3MBERS**\n' +
    '> Ilośc : 1000\n' +
    '> Cena : `13 PLN`\n',
  banner: process.env.SHOP_ONLINE_MEMBERS_BANNER_URL || SHOP_BANNER,
  thumbnail: process.env.SHOP_ONLINE_MEMBERS_THUMBNAIL_URL || SHOP_THUMBNAIL,
  fields: []
};

const OFFER_OFFLINE_MEMBERS = {
  title: '🛒 OKAZJA × OFERTA ONLINE M3MBERS',
  description:
    '🔴 × **OFFLINE M3MBERS**\n' +
    '> Ilośc : 500\n' +
    '> Cena : `4 PLN`\n' +
    '🔴 × **OFFLINE M3MBERS**\n' +
    '> Ilośc : 1000\n' +
    '> Cena : `7 PLN`\n',
  banner: process.env.SHOP_OFFLINE_MEMBERS_BANNER_URL || SHOP_BANNER,
  thumbnail: process.env.SHOP_OFFLINE_MEMBERS_THUMBNAIL_URL || SHOP_THUMBNAIL,
  fields: []
};

const OFFER_DISCORD_TOKENS = {
  title: '🛒 OKAZJA × AG3D DISCORD',
  description:
    '<:3124memberwhiteblack:1513955151575253062> × **AG3D DISCORD**\n' +
    '> Rok Powstania : 2020\n' +
    '> Dostęp : Full Access\n' +
    '> Cena : `8 PLN`\n' +
    '<:3124memberwhiteblack:1513955151575253062> × **AG3D DISCORD**\n' +
    '> Rok Powstania : 2019\n' +
    '> Dostęp : Full Access\n' +
    '> Cena : `10 PLN`\n' +
    '<:3124memberwhiteblack:1513955151575253062> × **AG3D DISCORD**\n' +
    '> Rok Powstania : 2018\n' +
    '> Dostęp : Full Access\n' +
    '> Cena : `14 PLN`\n' +
    '> <:3124memberwhiteblack:1513955151575253062> × **AG3D DISCORD**\n' +
    '> Rok Powstania : 2017\n' +
    '> Dostęp : Full Access\n' +
    '> Cena : `20 PLN`\n' +
    '<:3124memberwhiteblack:1513955151575253062> × **AG3D DISCORD**\n' +
    '> Rok Powstania : 2016\n' +
    '> Dostęp : Full Access\n' +
    '> Cena : `45 PLN`\n',
  banner: process.env.SHOP_DISCORD_TOKENS_BANNER_URL || SHOP_BANNER,
  thumbnail: process.env.SHOP_DISCORD_TOKENS_THUMBNAIL_URL || SHOP_THUMBNAIL,
  fields: []
};

const OFFER_STREAMING = {
  title: '🛒 OKAZJA × OFERTA STREAMING',
  description: 
    '> <:Netflix:1513981076677333012> × **NETFLIX**\n' +
    '> Trwanie : Lifetime\n' +
    '> Cena : `30 PLN`\n' +
    '> <:Hbomax:1513981163742429184> × **HBO MAX**\n' +
    '> Trwanie : Lifetime\n' +
    '> Cena : `20 PLN`\n' +
    '> <:Disney:1513981432891048129> × **DISNEY+**\n' +
    '> Trwanie : Lifetime\n' +
    '> Cena : `15 PLN`\n' +
    '> <:Spotify:1513981027398455508> × **SPOTIFY PREMIUM**\n' +
    '> Trwanie : Lifetime\n' +
    '> Cena : `25 PLN`\n' +
    '> <:Youtube:1513981411592507574> × **YOUTUBE PREMIUM**\n' +
    '> Trwanie : Lifetime\n' +
    '> Cena : `20 PLN`\n' +
    '> <:Crunchyroll:1513981279983505628> × **CRUNCHYROLL**\n' +
    '> Trwanie : Lifetime\n' +
    '> Cena : `15 PLN`\n' +
    '> <:Primevideo:1513981212849475785> × **PRIME VIDEO**\n' +
    '> Trwanie : 6 Miesięcy\n' +
    '> Cena : `15 PLN`\n',
  banner: process.env.SHOP_NETFLIX_BANNER_URL || SHOP_BANNER,
  thumbnail: process.env.SHOP_NETFLIX_THUMBNAIL_URL || SHOP_THUMBNAIL,
  fields: []
};

const OFFER_VPN = {
  title: '🛒 OKAZJA × OFERTA VPN',
  description: 
    '> <:Nordvpn:1513980985090244708> × **NORD VPN**\n' +
    '> Trwanie : Lifetime\n' +
    '> Cena : `20 PLN`\n' +
    '> <:Mullvad:1513981235117035701> × **MULLVAD**\n' +
    '> Trwanie : Lifetime\n' +
    '> Cena : `20 PLN`\n' +
    '> <:0x0:1513986921817313443> × **PUREVPN**\n' +
    '> Trwanie : Lifetime\n' +
    '> Cena : `15 PLN`\n' +
    '> <:0x01:1513986999411806318> × **CYPHER GHOST VPN**\n' +
    '> Trwanie : Lifetime\n' +
    '> Cena : `15 PLN`\n',
  banner: process.env.SHOP_VPN_BANNER_URL || SHOP_BANNER,
  thumbnail: process.env.SHOP_VPN_THUMBNAIL_URL || SHOP_THUMBNAIL,
  fields: []
};

const OFFER_INNE = {
  title: '🛒 OKAZJA × OFERTA INNE',
  description:
    '> <:Geminiai:1513981337739067442> × **GEMINI**\n' +
    '> Trwanie : 18 Miesiąc\n' +
    '> Cena : `50 PLN`\n' +
    '> <:Chatgpt:1513981389152714882> × **CHATGPT**\n' +
    '> Trwanie : 1 Miesiąc\n' +
    '> Cena : `22 PLN`\n' +
    '> <:Canva:1513981049607295099> × **CANVA**\n' +
    '> Trwanie : Lifetime\n' +
    '> Cena : `20 PLN`\n' +
    '> <:Capcut:1513981189315104918> × **CAPCUT**\n' +
    '> Trwanie : Lifetime\n' +
    '> Cena : `20 PLN`\n' +
    '> <:Duolingo:1513980895324012717> × **DUOLINGO**\n' +
    '> Trwanie : Lifetime\n' +
    '> Cena : `15 PLN`\n',
  banner: process.env.SHOP_INNE_BANNER_URL || SHOP_BANNER,
  thumbnail: process.env.SHOP_INNE_THUMBNAIL_URL || SHOP_THUMBNAIL,
  fields: []
};

const OFFER_GAME_KEYS = {
  title: '🛒 OKAZJA × OFERTA KONTA DO GIER',
  description:
  '> <:Fortnite:1513981123271721030> × **FORTNITE SKINS**\n' +
  '> Dostęp : 5-600\n' +
  '> Cena : `5-200 PLN`\n' +
  '> <:Robux:1513951858501226628> × **ROBLOX ACCOUNTS ROBUX**\n' +
  '> Dostęp : 500-500000 Robux\n' +
  '> Cena : `10-100 PLN`\n' +
  '> <:Fortnite:1513981123271721030> × **FORTNITE V-BUCKS**\n' +
  '> Dostęp : 500-10000\n' +
  '> Cena : `7-80 PLN`\n' +
  '> <:Cs2:1513981006846230668> × **KONTO PRIME CS**\n' +
  '> Dostęp : Full Access\n' +
  '> Cena : `40 PLN`\n' +
  '> <:Rust:1513980921752064262> × **RUST*\n' +
  '> Dostęp : Full Access\n' +
  '> Cena : `40 PLN`\n' +
  '> <:Valorant:1513981592316674300> × **VALORANT**\n' +
  '> Dostęp : Full Access\n' +
  '> Cena : `30 PLN`\n' +
  '> <:Minecraft:1513980959333154956> × **MINECRAFT**\n' +
  '> Dostęp : Full Access\n' +
  '> Cena : `20 PLN`\n' +
  '> <:Fivem:1513951745703805051> × **FIVEM SOCIAL**\n' +
  '> Dostęp : Full Access\n' +
  '> Cena : `0.50 PLN`\n',
  banner: process.env.SHOP_GAME_KEYS_BANNER_URL || SHOP_BANNER,
  thumbnail: process.env.SHOP_GAME_KEYS_THUMBNAIL_URL || SHOP_THUMBNAIL,
  fields: []
};

const SHOP_CATEGORIES = {
  nitro: {
    label: 'N!TRO',
    icon: '<a:Nitro:1513951613100757052>',
    description: 'Kliknij, aby zobaczyć ofertę N!TRO',
    banner: process.env.SHOP_NITRO_BANNER_URL || SHOP_BANNER,
    thumbnail: process.env.SHOP_NITRO_THUMBNAIL_URL || SHOP_THUMBNAIL,
    items: [
      { key: 'nitro_gift', label: 'N!TRO GIFT', icon: '<a:Nitro:1513951613100757052>', offer: OFFER_NITRO_GIFT },
      { key: 'server_boost', label: 'SERVER BOOST', icon: '<a:Boost:1513951493970071634>', offer: OFFER_SERVER_BOOST },
      { key: 'dekoracje', label: 'DEKORACJE', icon: '<:Discordlogo:1513981304067199108>', offer: OFFER_DEKORACJE }
    ]
  },
  members: {
    label: 'M3MBERS',
    icon: '<:3124memberwhiteblack:1513955151575253062>',
    description: 'Kliknij, aby zobaczyć ofertę M3MBERS',
    items: [
      { key: 'online_members', label: 'ONLINE M3MBERS', icon: '🟢', offer: OFFER_ONLINE_MEMBERS },
      { key: 'offline_members', label: 'OFFLINE M3MBERS', icon: '🔴', offer: OFFER_OFFLINE_MEMBERS }
    ]
  },
  discord_accounts: {
    label: 'KONTA DISCORD',
    icon: '<:membericon:1513988069496324187>',
    description: 'Kliknij, aby zobaczyć ofertę KONTA DISCORD',
    items: [
      { key: 'discord_tokens', label: 'AG3D DISCORD', icon: '<:membericon:1513988069496324187>', offer: OFFER_DISCORD_TOKENS },
    ]
  },
  accounts: {
    label: 'STREAMING',
    icon: '<:internet:1513988099640659978>',
    description: 'Kliknij, aby zobaczyć ofertę KONTA',
    items: [
      { key: 'STREAMING', label: 'STREAMING', icon: '<:internet:1513988099640659978>', offer: OFFER_STREAMING },
      { key: 'VPN', label: 'VPN', icon: '<:40820hacker:1513988429317410876>', offer: OFFER_VPN },
      { key: 'INNE', label: 'INNE', icon: '<a:Staff:1513951887513223250>', offer: OFFER_INNE }
    ]
  },
  games: {
    label: 'GRY',
    icon: '🎮',
    description: 'Kliknij, aby zobaczyć ofertę GRY',
    items: [
      { key: 'game_keys', label: 'KLUCZE DO GIER', icon: '🔑', offer: OFFER_GAME_KEYS },
    ]
  },
};

function optionLabel(item) {
  return item.label;
}

function optionEmoji(item) {
  const match = item.icon?.match(/^<(?<animated>a?):(?<name>[^:]+):(?<id>\d+)>$/);

  if (match) {
    return {
      id: match.groups.id,
      name: match.groups.name,
      animated: match.groups.animated === 'a'
    };
  }

  return item.icon || undefined;
}

function shopBaseEmbed(title, image = SHOP_BANNER, thumbnail = SHOP_THUMBNAIL) {
  const embed = new EmbedBuilder()
    .setColor(SHOP_COLOR)
    .setTitle(title)
    .setFooter({ text: BRAND.footer, iconURL: BRAND.icon });

  if (image) embed.setImage(image);
  return embed;
}

function shopMainEmbed() {
  const lines = Object.values(SHOP_CATEGORIES)
    .map((category) => `> ${category.icon} × **${category.label}**`)
    .join('\n');

  return shopBaseEmbed('```🛒 ALL IN ONE | SHOP EXCHANGER × PRODUKTY```').setDescription(`${lines}`);
}

function shopMainRow() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('shop:main')
      .setPlaceholder('Kliknij, aby zobaczyć ofertę')
      .addOptions(
        Object.entries(SHOP_CATEGORIES).map(([key, category]) => ({
          label: optionLabel(category),
          description: category.description,
          value: key,
          emoji: optionEmoji(category)
        }))
      )
  );
}

function shopCategoryEmbed(categoryKey) {
  const category = SHOP_CATEGORIES[categoryKey];
  if (!category) return null;

  const lines = category.items
    .map((item) => `> ${item.icon} × **${item.label}**`)
    .join('\n');

  return shopBaseEmbed(
    `🛒 OKAZJA × CENNIK ${category.label}`,
    category.banner || SHOP_BANNER,
    category.thumbnail || SHOP_THUMBNAIL
  ).setDescription(`${lines}`);
}

function shopCategoryRow(categoryKey) {
  const category = SHOP_CATEGORIES[categoryKey];
  if (!category) return null;

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`shop:category:${categoryKey}`)
      .setPlaceholder(`Kliknij, aby zobaczyć ofertę ${category.label}`)
      .addOptions(
        category.items.map((item) => ({
          label: optionLabel(item),
          description: `Kliknij, aby zobaczyć ofertę ${item.label}`,
          value: item.key,
          emoji: optionEmoji(item)
        }))
      )
  );
}

function shopItemEmbed(categoryKey, itemKey) {
  const category = SHOP_CATEGORIES[categoryKey];
  const item = category?.items.find((entry) => entry.key === itemKey);
  if (!category || !item) return null;

  const offer = item.offer;
  const embed = shopBaseEmbed(
    offer.title,
    offer.banner || category.banner || SHOP_BANNER,
    offer.thumbnail || category.thumbnail || SHOP_THUMBNAIL
  ).setDescription(offer.description);

  if (Array.isArray(offer.fields) && offer.fields.length > 0) {
    embed.addFields(offer.fields);
  }

  return embed;
}

module.exports = {
  SHOP_CATEGORIES,
  shopMainEmbed,
  shopMainRow,
  shopCategoryEmbed,
  shopCategoryRow,
  shopItemEmbed
};
