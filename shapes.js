const shapes = [
  "Circle","Square","Triangle","Pentagon","Hexagon","Heptagon",
  "Octagon","Nonagon","Decagon","Dodecagon","Tridecagon","Tetradecagon"
];

const tiers = ["Base","Beta","Alpha","Omega"];

function getShapeData(level) {
  const shapeIndex = Math.floor(level / 4);
  const tierIndex = level % 4;

  if (!shapes[shapeIndex]) {
    return { shape: "Infinite", tier: "Omega" };
  }

  return {
    shape: shapes[shapeIndex],
    tier: tiers[tierIndex]
  };
}

module.exports = { getShapeData };
