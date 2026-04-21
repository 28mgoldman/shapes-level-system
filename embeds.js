const { EmbedBuilder } = require("discord.js");

// optional emojis (you can customize)
const shapeEmojis = {
  Circle: "⚪",
  Square: "🟨",
  Triangle: "🔺",
  Pentagon: "🟪",
  Hexagon: "🟩",
  Heptagon: "🔷",
  Octagon: "🟧",
  Nonagon: "🟫",
  Decagon: "🟦",
  Dodecagon: "🟥",
  Tridecagon: "🟪",
  Tetradecagon: "⚫"
};

// tier styling (controls vibe, not just color)
function getTierStyle(tier) {
  switch (tier) {
    case "Base":
      return {
        title: "⬢ Level Up",
        tag: "Base Form",
        extra: ""
      };

    case "Beta":
      return {
        title: "⬢ Level Up",
        tag: "Enhanced Form",
        extra: "\n▫️ **Beta Evolution**"
      };

    case "Alpha":
      return {
        title: "⬢ LEVEL UP",
        tag: "Alpha Form",
        extra: "\n🔹 **ALPHA EVOLUTION**"
      };

    case "Omega":
      return {
        title: "⬢ ✨ OMEGA LEVEL UP ✨",
        tag: "Omega Form",
        extra: "\n🌟 **MAX EVOLUTION** 🌟"
      };

    default:
      return {
        title: "⬢ Level Up",
        tag: "",
        extra: ""
      };
  }
}

// MAIN EMBED FUNCTION
function createLevelUpEmbed(user, level, shapeData, color) {
  const style = getTierStyle(shapeData.tier);
  const emoji = shapeEmojis[shapeData.shape] || "🔷";

  return new EmbedBuilder()
    .setTitle(style.title)
    .setDescription(
      `${emoji} **${user.username}** evolved!\n\n` +
      `📊 **Level:** ${level}\n` +
      `🔷 **Form:** **${shapeData.tier} ${shapeData.shape}**\n` +
      `🏷️ **Type:** ${style.tag}` +
      style.extra
    )
    .setColor(color)
    .setFooter({
      text: `${shapeData.shape} Evolution • ${shapeData.tier} Tier`
    })
    .setTimestamp();
}

module.exports = { createLevelUpEmbed };
