const Discord = require('discord.js');
const client = new Discord.Client();
const chalk = require('chalk');
const figlet = require('figlet');
const fs = require('fs');
const config = require('./config.js');
const assets = require('./assets.js');
client.config = config;
client.assets = assets;

let commandlist = [];
client.commandlist = commandlist;

fs.readdir('./commands/', async (err, files) => {
  if(err){
      return console.log(chalk.red('An error occured when checking the commands folder for commands to load: ' + err));
  }
  files.forEach(async (file) => {
      if(!file.endsWith('.js')) return;
      let commandFile = require(`./commands/${file}`);
      commandlist.push({
        file: commandFile,
        name: file.split('.')[0],
        config: commandFile.config
      });
  });
});

client.on('ready', async () => {
  console.log(chalk.yellow(figlet.textSync('Bot', { horizontalLayout: 'full' })));
  console.log(chalk.red(`Bot started!\n---\n`
  + `> Users: ${client.users.cache.size}\n`
  + `> Channels: ${client.channels.cache.size}\n`
  + `> Servers: ${client.guilds.cache.size}`));
  let botstatus = fs.readFileSync('./bot-status.json');
  botstatus = JSON.parse(botstatus);
  if(botstatus.activity == 'false') return;
  if(botstatus.activitytype == 'STREAMING'){
    client.user.setActivity(botstatus.activitytext, {
      type: botstatus.activitytype,
      url: botstatus.activityurl
    });
  } else {
    client.user.setActivity(botstatus.activitytext, {
      type: botstatus.activitytype
    });
  }
});

client.on('message', async (message) => {
  if(message.author.bot) return;
  if(message.channel.type === 'dm') return;
  
  if(!message.content.startsWith(client.config.prefix)){
    if(!message.content.startsWith(`${client.user.id}>`)){
      return;
    }
  }
  let args = message.content.slice(client.config.prefix.length).split(' ');
  let commandName = args[0].toLowerCase();
  args.shift();
  if(!commandName){
    commandName = args[0].toLowerCase();
    args.shift();
  }
  let command = commandlist.find((cmd) => cmd.name === commandName);
  if(!command){
    command = commandlist.find((cmd) => cmd.config.aliases.includes(commandName));
    if(!command) return;
  }
  command.file.run(client, message, args);
});

client.login(config.token);
