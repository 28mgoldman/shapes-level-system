function getTierColor(shape, tier, shapeColors) {
  const c = shapeColors[shape];
  if (!c) return 0xffffff;

  switch (tier) {
    case "Base": return parseInt(c.main.replace("#",""),16);
    case "Beta": return parseInt(c.mid.replace("#",""),16);
    case "Alpha": return parseInt(c.border.replace("#",""),16);
    case "Omega": return parseInt(c.highlight.replace("#",""),16);
  }
}

module.exports = { getTierColor };
