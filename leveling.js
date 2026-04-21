function xpNeeded(level) {
  return Math.floor(100 * Math.pow(1.15, level));
}

function getXP(prestige) {
  const base = Math.floor(Math.random() * 10) + 15;
  return Math.floor(base * (1 + prestige * 0.05));
}

module.exports = { xpNeeded, getXP };
