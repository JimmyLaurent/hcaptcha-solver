// Randomize function
function rdn(start, end) {
  return Math.round(Math.random() * (end - start) + start);
}

// Generate random Mouse Movements
function getMouseMovements(timestamp) {
  let lastMovement = timestamp;
  const motionCount = rdn(1000, 10000);
  const mouseMovements = [];
  for (let i = 0; i < motionCount; i++) {
    lastMovement += rdn(0, 10);
    mouseMovements.push([rdn(0, 500), rdn(0, 500), lastMovement]);
  }
  return mouseMovements;
}

module.exports = { rdn, getMouseMovements };