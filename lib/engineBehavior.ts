export const phases = [
  "grind",
  "pullback",
  "fake_crash",
  "recovery",
  "breakout",
] as const;

export function generateMove() {
  const roll = Math.random();

  let phase: typeof phases[number] = "grind";
  let move = 0;

  if (roll < 0.45) {
    phase = "grind";
    move = 0.8 + Math.random() * 3.2;
  } else if (roll < 0.65) {
    phase = "pullback";
    move = -(1.5 + Math.random() * 5.5);
  } else if (roll < 0.75) {
    phase = "fake_crash";
    move = -(10 + Math.random() * 18);
  } else if (roll < 0.9) {
    phase = "recovery";
    move = 12 + Math.random() * 24;
  } else {
    phase = "breakout";
    move = 18 + Math.random() * 32;
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
  "Fakeout absorbed",
  "Recovery sequence active",
];
