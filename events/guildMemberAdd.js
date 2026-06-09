const { witamyEmbed } = require('../utils/embeds');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const channelId = process.env.WELCOME_CHANNEL_ID || '1513663838279434340';
    if (!channelId) return;

    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const count = member.guild.memberCount;
    await channel.send({ embeds: [witamyEmbed(member, count)] });
  }
};
