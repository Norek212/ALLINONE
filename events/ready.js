module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {
    console.log(`✅ Zalogowano jako ${client.user.tag}`);
    client.user.setActivity('ALL IN ONE | SHOP EXCHANGER | /help', { type: 0 });
  }
};
