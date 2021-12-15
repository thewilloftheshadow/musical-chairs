const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, Intents } = require('discord.js');
const { token, client_id } = require('./config.json');

const rest = new REST({ version: '9' }).setToken(token);

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ]
});

client.commands = new Collection();
const commands = [];

const commandFiles = fs
  .readdirSync('./commands')
  .map(folder =>
    fs
      .readdirSync(`./commands/${folder}`)
      .filter(file => file.endsWith('.js'))
      .map(file => `./commands/${folder}/${file}`)
  )
  .flat();

for (const file of commandFiles) {
  const command = require(`${file}`);
  if (Object.keys(command).length === 0) continue;
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

const prefix = "[]"
client.on("messageCreate", async (message) => {
  if (message.author.id != "439223656200273932") return
  if (!message.content.startsWith(prefix)) return
  const args = message.content.slice(prefix.length).split(/ +/)
  console.log(args)
  let cmd = args.shift().toLowerCase()
  if (cmd == "") cmd = args.shift().toLowerCase()

  console.log(message.content)
  console.log(`command: `, cmd)
  console.log(args)

  if (cmd == "updateslash") {
    const type = args[0] ?? "default"
    console.log("Updating slash commands...")

    try {
      let done = 0
      if (type == "global") {
        client.commands
          .filter((x) => !x.command.adminGuild)
          .each((cmd) => {
            client.application.commands.create(cmd.data)
            done += 1
            console.log(`Loaded global command`, cmd.data.name)
          })
      } else if (type == "admin") {
        client.commands
          .filter((x) => x.command.adminGuild)
          .each((cmd) => {
            if (!cmd.permissions) cmd.permissions = []
            let doPerms = [...cmd.permissions, { id: ids.server, type: "ROLE", permission: false }, { id: ids.admin, type: "ROLE", permission: true }]
            client.application.commands.create(cmd.data, message.guild.id, doPerms).then((command) => command.permissions.set({ command: command, permissions: doPerms }))
            done += 1
            console.log(`Loaded admin command`, cmd.data.name)
          })
      } else {
        client.commands.each((cmd) => {
          //client.application.commands.create(cmd.data, message.guild.id)
          client.application.commands.create(cmd.data, message.guild.id).then((command) => {
            if (!cmd.permissions) cmd.permissions = []
            let doPerms = [...cmd.permissions, { id: message.guild.id, type: "ROLE", permission: false }, { id: "834806517449883720", type: "ROLE", permission: true }]
            console.log(`Loaded command`, cmd.data.name, doPerms)
            command.permissions.set({ command: command, permissions: doPerms })
          })
          done += 1
        })
      }
      message.reply({ content: `${done} slash commands queued to be deployed in ${type}. Check console for live updates` })
    } catch (err) {
      console.error(err)
    }
  }

  if (cmd == "eval") {
    try {
      if (!args[0]) return message.channel.send("undefined", { code: "js" })

      let codeArr = args.slice(0).join(" ").split("\n")
      if (!codeArr[codeArr.length - 1].startsWith("return")) codeArr[codeArr.length - 1] = `return ${codeArr[codeArr.length - 1]}`

      const code = `async () => { ${codeArr.join("\n")} }`

      let out = await eval(code)()
      if (typeof out !== "string") out = require("util").inspect(out)
      out = out.replace(process.env.TOKEN, "[TOKEN REDACTED]").replace(process.env.MONGODB, "[DB URI REDACTED]")

      message.channel.send(`Typeof output: **${typeof out}**`)
      message.channel.send({ content: out ? out : "null", split: true, code: "js" })
    } catch (err) {
      message.channel.send("An error occurred when trying to execute this command.")
      console.log(err)
      return message.channel.send(`${err}`, { code: "js" })
    }
  }
})

const eventFiles = fs
  .readdirSync('./events')
  .filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(token);
