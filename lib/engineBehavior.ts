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

  if (roll < 0.42) {
    phase = "grind";
    move = 0.35 + Math.random() * 1.8;
  } else if (roll < 0.68) {
    phase = "pullback";
    move = -(0.8 + Math.random() * 3.8);
  } else if (roll < 0.78) {
    phase = "fake_crash";
    move = -(6 + Math.random() * 12);
  } else if (roll < 0.93) {
    phase = "recovery";
    move = 5 + Math.random() * 12;
  } else {
    phase = "breakout";
    move = 8 + Math.random() * 18;
  }

  return {
    phase,
    move: Number(move.toFixed(2)),
  };
}

export const engineEvents = [
  "TORION detected momentum",
  "Liquidity sweep survived",
  "Risk engine recalibrated",
  "Smart hedge activated",
  "Profit lock engaged",
  "Volatility spike detected",
  "Fakeout absorbed",
  "Recovery sequence active",
];
