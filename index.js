const express = require('express');
const app = express();

app.get('/', (request, response) => {
  response.sendStatus(200);
});

let listener = app.listen(process.env.PORT, () => {
  console.log('Your app is currently listening on port: ' + listener.address().port);
});

const Discord = require('discord.js');
const client = new Discord.Client();
const chalk = require('chalk');
const figlet = require('figlet');
const fs = require('fs');
const config = require('./config.js');
const colors = require('./colors.js');
client.config = config;
client.colors = colors;

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
        name: file.split('.')[0]
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

async function secdif(endDate, startDate){
  return (endDate.getTime() - startDate.getTime()) / 1000;
}

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
  let command = commandlist.findIndex((cmd) => cmd.name === commandName);
  if(command == -1){
    command = commandlist.findIndex((cmd) => cmd.file.aliases.includes(commandName));
    if(command == -1) return;
  }
  commandlist[command].file.run(client, message, args);
});

client.login(process.env.token);
