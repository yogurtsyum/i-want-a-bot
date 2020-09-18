module.exports.config = {
  description: 'This is the command description!',
  aliases: ['test']
}
module.exports.run = async (client, message, args) => {
  return message.channel.send('Hey!');
}
