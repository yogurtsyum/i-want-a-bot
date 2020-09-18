module.exports.config = {
  description: 'Sends a bot message.',
  usage: '<message>',
  aliases: ['send']
}
module.exports.run = async (client, message, args) => {
  if(!args[0]) return message.channel.send('You must specify a message.');
  return message.channel.send(`**${message.author.tag} says:** ${args.join(' ')}`);
}
