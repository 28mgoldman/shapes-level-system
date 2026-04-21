const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

// ===== CONFIG IMPORTS =====
const { XP_MODE, XP_CHANNELS } = require("./config/channels");
const roleIds = require("./config/roles");

// ===== SYSTEM IMPORTS =====
const { getShapeData } = require("./systems/shapes");
const { xpNeeded, getXP } = require("./systems/leveling");

// ===== UTILS =====
const { getTierColor } = require("./utils/colors");
const { createLevelUpEmbed } = require("./utils/embeds");

// ===== CLIENT SETUP =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const DATA_FILE = "./xp.json";

// ===== LOAD DATA =====
let xpData = {};
if (fs.existsSync(DATA_FILE)) {
  xpData = JSON.parse(fs.readFileSync(DATA_FILE));
}

// ===== SAVE FUNCTION =====
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(xpData, null, 2));
}

// ===== ROLE UPDATE =====
async function updateRoles(member, level) {
  if (!member) return;

  // remove all shape roles
  for (const id of roleIds) {
    if (member.roles.cache.has(id)) {
      await member.roles.remove(id).catch(() => {});
    }
  }

  // add correct role
  const roleId = roleIds[level];
  if (roleId) {
    await member.roles.add(roleId).catch(() => {});
  }
}

// ===== COOLDOWN =====
const cooldown = new Map();

// ===== MESSAGE EVENT =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // ===== CHANNEL FILTER =====
  if (XP_MODE === "whitelist" && !XP_CHANNELS.includes(message.channel.id)) return;
  if (XP_MODE === "blacklist" && XP_CHANNELS.includes(message.channel.id)) return;

  const userId = message.author.id;

  // ===== COOLDOWN CHECK =====
  if (cooldown.has(userId)) {
    if (Date.now() - cooldown.get(userId) < 5000) return;
  }
  cooldown.set(userId, Date.now());

  // ===== INIT USER =====
  if (!xpData[userId]) {
    xpData[userId] = { xp: 0, level: 0, prestige: 0 };
  }

  const user = xpData[userId];

  // ===== ADD XP =====
  user.xp += getXP(user.prestige);

  let needed = xpNeeded(user.level);

  // ===== LEVEL LOOP =====
  while (user.xp >= needed) {
    user.xp -= needed;
    user.level++;

    // ===== GET SHAPE DATA =====
    const shapeData = getShapeData(user.level);

    // ===== UPDATE ROLES =====
    await updateRoles(message.member, user.level);

    // ===== GET COLOR =====
    const color = getTierColor(shapeData.shape, shapeData.tier);

    // ===== CREATE EMBED (YOUR SYSTEM) =====
    const embed = createLevelUpEmbed(
      message.author,
      user.level,
      shapeData,
      color
    );

    // ===== SEND EMBED =====
    message.channel.send({ embeds: [embed] });

    needed = xpNeeded(user.level);
  }

  saveData();

  // ===== COMMANDS =====
  if (!message.content.startsWith("!")) return;

  const cmd = message.content.slice(1).trim().toLowerCase();

  // ===== RANK COMMAND =====
  if (cmd === "rank") {
    const shapeData = getShapeData(user.level);
    const neededXP = xpNeeded(user.level);

    const color = getTierColor(shapeData.shape, shapeData.tier);

    const embed = createLevelUpEmbed(
      message.author,
      user.level,
      shapeData,
      color
    ).setTitle("📊 Your Rank");

    message.reply({ embeds: [embed] });
  }
});

// ===== AUTO SAVE =====
setInterval(saveData, 10000);

// ===== READY =====
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
