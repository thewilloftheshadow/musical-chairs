const { SlashCommandBuilder } = require('@discordjs/builders');
const { AudioPlayerStatus } = require('@discordjs/voice');
const eliminate = {
  role: "835899979443994644", vc: "836078176001851463"
} 

const player = "845715367908474922"

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eliminate')
    .setDescription('Eliminate a user').addUserOption(option => option.setName('user').setDescription('The user to eliminate').setRequired(true)),
  execute(interaction) {
    let userId = interaction.options.get("user").value

    let user = interaction.guild.members.resolve(userId)
    user.roles.add(eliminate.role).catch(() => {})
    user.roles.remove(player).catch(() => {})
    user.voice.setChannel(eliminate.vc).catch(() => {})
    interaction.reply(`<@${userId}> has been eliminated!`)
  }
};
