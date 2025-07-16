require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Slash command registration
const commands = [
  new SlashCommandBuilder()
    .setName('evemail')
    .setDescription('Generate a Silver EVEmail for a neutral kill')
    .addStringOption(opt => opt.setName('victim').setDescription('Neutral Capsuleer Name').setRequired(true))
    .addStringOption(opt => opt.setName('system').setDescription('System Name').setRequired(true))
    .addStringOption(opt => opt.setName('date').setDescription('Date of Engagement (YYYY-MM-DD)').setRequired(true))
    .addStringOption(opt => opt.setName('killer').setDescription('Your Operative Name').setRequired(true))
].map(cmd => cmd.toJSON());

// Register the slash command
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
client.once('ready', async () => {
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('Slash command registered.');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'evemail') {
    const victim = interaction.options.getString('victim');
    const system = interaction.options.getString('system');
    const dateStr = interaction.options.getString('date');
    const killer = interaction.options.getString('killer');

    const date = new Date(dateStr);
    const yc = 131 + (date.getFullYear() - 2025);

    const body = `**Subject:** Incident Report: Unauthorized Operations in Silver Territory\n\n` +
      `To: ${victim}\n\n` +
      `Capsuleer,\n\n` +
      `This message serves as a formal post-engagement notice following your recent destruction within ${system}, a territory patrolled and maintained by the Silver corporation.\n\n` +
      `Our records indicate your presence and resource extraction activities were conducted without prior clearance. Silver operates on a standing-first, invitation-second basis. You were classified under a Kill-On-Sight enforcement protocol, and your vessel was neutralized accordingly.\n\n` +
      `If this was a misunderstanding or you wish to open diplomatic relations, contact Commander Nahrix or Operative Cassius Silver.\n\n` +
      `Silver does not rust. Silver does not beg. Silver pays its own.\n\n` +
      `Respectfully,\n${killer}\nOperative, Silver\nYC.${yc}`;

    await interaction.reply({ content: `📨 **Generated EVEmail:**\n\n${body}`, ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);
