export const phases = [
  "pump",
  "dump",
  "consolidation",
  "breakout",
  "fakeout",
] as const;

export function randomPhase() {
  return phases[Math.floor(Math.random() * phases.length)];
}

export function generateMove() {
  const phase = randomPhase();

  let move = 0;

  switch (phase) {
    case "pump":
      move = 3 + Math.random() * 8;
      break;

    case "dump":
      move = -(2 + Math.random() * 6);
      break;

    case "breakout":
      move = 8 + Math.random() * 12;
      break;

    case "fakeout":
      move =
        (Math.random() > 0.5 ? 1 : -1) *
        (4 + Math.random() * 5);
      break;

    default:
      move = Math.random() * 2 - 1;
  }

  return {
    phase,
    move: Number(move.toFixed(2)),
  };
}

export const engineEvents = [
  "TORION detected breakout momentum",
  "Liquidity sweep survived",
  "Risk engine recalibrated",
  "Smart hedge activated",
  "Profit lock engaged",
  "Volatility spike detected",
];
