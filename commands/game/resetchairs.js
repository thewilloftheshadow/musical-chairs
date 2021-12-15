const { SlashCommandBuilder } = require('@discordjs/builders');
const { AudioPlayerStatus } = require('@discordjs/voice');

const player = "845715367908474922"
const music = "920720759872180246"

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetchairs')
    .setDescription('Move all players in chairs to the Music VC'),
  execute(interaction) {
    let players = interaction.guild.members.cache.filter(x => x.roles.cache.has(player))
    players.forEach(x => x.voice.setChannel(music).catch(() => {}))
    interaction.reply(`Chairs have been reset!`)
  }
};
