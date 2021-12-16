const { SlashCommandBuilder } = require('@discordjs/builders');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randompause')
    .setDescription('Start the chair timer'),
  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply('Please join a voice channel and try again!');
    }

    const player = interaction.client.playerManager.get(interaction.guildId);
    if (!player) {
      return interaction.reply('There is no song playing right now!');
    }
    if (player.audioPlayer.state.status == AudioPlayerStatus.Paused) {
      return interaction.reply('You already paused this song!');
    } else if (voiceChannel.id !== interaction.guild.me.voice.channel.id) {
      return interaction.reply(
        'You must be in the same voice channel as the bot in order to pause!'
      );
    }


    const message = await interaction.deferReply({
      fetchReply: true
    });

    let time = 

    setTimeout(() => {const success = player.audioPlayer.pause();

    if (success) {
      return interaction.editReply(
        ':pause_button: Song was paused! To unpause, use the resume command'
      );
    } else {
      return interaction.editReply(
        'I was unable to pause this song, please try again soon'
      );
    }
  }, randInt(3000, 10000));
  }
};


const randInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}