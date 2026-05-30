export type EngineState =
  | "STABLE"
  | "EUPHORIA"
  | "RECOVERY"
  | "LOSS_DAY"
  | "BREAKER";

export const engineStateConfig = {
  STABLE: {
    color: "#b6ff00",
    label: "STABLE",
    desc: "AI following stable market momentum.",
  },
  EUPHORIA: {
    color: "#a855f7",
    label: "EUPHORIA",
    desc: "Breakout sequence active.",
  },
  RECOVERY: {
    color: "#facc15",
    label: "RECOVERY",
    desc: "Recovery logic stabilizing exposure.",
  },
  LOSS_DAY: {
    color: "#ff4d4d",
    label: "LOSS DAY",
    desc: "Protection layer active.",
  },
  BREAKER: {
    color: "#ffffff",
    label: "BREAKER",
    desc: "Emergency survival protocol engaged.",
  },
};

export function resolveEngineState(roi: number): EngineState {
  const day = new Date().getDay();

  if (roi <= -45) return "BREAKER";
  if (roi < -12) return "RECOVERY";

  // profitable expansion
  if (roi > 65) return "EUPHORIA";

  // red days: Tuesday + Friday
  if (day === 2 || day === 5) return "LOSS_DAY";

  return "STABLE";
}

export function generateMove(state: EngineState) {
  let move = 0;

  switch (state) {
    case "STABLE":
      move =
        Math.random() > 0.25
          ? 2.2 + Math.random() * 6.8
          : -(0.8 + Math.random() * 2.8);
      break;

    case "EUPHORIA":
      move =
        Math.random() > 0.14
          ? 8 + Math.random() * 26
          : -(2 + Math.random() * 6);
      break;

    case "RECOVERY":
      move =
        Math.random() > 0.2
          ? 3 + Math.random() * 10
          : -(0.8 + Math.random() * 2.4);
      break;

    case "LOSS_DAY":
      move =
        Math.random() > 0.72
          ? 2 + Math.random() * 5
          : -(4 + Math.random() * 16);
      break;

    case "BREAKER":
      move =
        Math.random() > 0.62
          ? 0.8 + Math.random() * 2.2
          : -(0.6 + Math.random() * 2.8);
      break;
  }

  return Number(move.toFixed(2));
}

export const engineEvents = {
  STABLE: [
    "AI tracking clean momentum",
    "Risk stable",
    "Position flow healthy",
    "Smart exposure calibrated",
  ],
  EUPHORIA: [
    "Breakout sequence active",
    "Momentum expansion detected",
    "Volatility captured",
    "TORION acceleration online",
  ],
  RECOVERY: [
    "Recovery logic engaged",
    "Drawdown absorbed",
    "Rebalancing active",
    "Survival protocol repairing exposure",
  ],
  LOSS_DAY: [
    "Protection layer active",
    "Reducing exposure",
    "Volatility exceeded threshold",
    "Loss day pressure detected",
  ],
  BREAKER: [
    "Emergency breaker enabled",
    "Capital preservation active",
    "Engine temporarily slowed",
    "Hard risk lock engaged",
  ],
};
