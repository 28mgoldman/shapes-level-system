const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const { XP_MODE, XP_CHANNELS } = require("./config/channels");
const roleIds = require("./config/roles");

const { getShapeData } = require("./systems/shapes");
const { xpNeeded, getXP } = require("./systems/leveling");

const { getTierColor } = require("./utils/colors");
const { createLevelUpEmbed } = require("./utils/embeds");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let xpData = {};
if (fs.existsSync("./xp.json")) {
  xpData = JSON.parse(fs.readFileSync("./xp.json"));
}

// ===== ROLE UPDATE =====
async function updateRoles(member, level) {
  for (const id of roleIds) {
    if (member.roles.cache.has(id)) {
      await member.roles.remove(id).catch(() => {});
    }
  }

  const roleId = roleIds[level];
  if (roleId) {
    await member.roles.add(roleId).catch(() => {});
  }
}

// ===== MESSAGE EVENT =====
const cooldown = new Map();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // CHANNEL FILTER
  if (XP_MODE === "whitelist" && !XP_CHANNELS.includes(message.channel.id)) return;
  if (XP_MODE === "blacklist" && XP_CHANNELS.includes(message.channel.id)) return;

  const userId = message.author.id;

  if (cooldown.has(userId)) {
    if (Date.now() - cooldown.get(userId) < 5000) return;
  }
  cooldown.set(userId, Date.now());

  if (!xpData[userId]) {
    xpData[userId] = { xp: 0, level: 0, prestige: 0 };
  }

  const user = xpData[userId];

  user.xp += getXP(user.prestige);

  let needed = xpNeeded(user.level);

  while (user.xp >= needed) {
    user.xp -= needed;
    user.level++;

    const shapeData = getShapeData(user.level);

    await updateRoles(message.member, user.level);

    const color = getTierColor(shapeData.shape, shapeData.tier, require("./utils/colors").shapeColors);

    const embed = createLevelUpEmbed(message.author, user.level, shapeData, color);

    message.channel.send({ embeds: [embed] });

    needed = xpNeeded(user.level);
  }

  fs.writeFileSync("./xp.json", JSON.stringify(xpData, null, 2));
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
