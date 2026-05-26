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

  // hard protection
  if (roi <= -45) {
    return "BREAKER";
  }

  // recovery after drawdown
  if (roi < -12) {
    return "RECOVERY";
  }

  // strong profitable phase
  if (roi > 35) {
    return "EUPHORIA";
  }

  // weekly rough days
  if (day === 2 || day === 5) {
    return "LOSS_DAY";
  }

  return "STABLE";
}

export function generateMove(state: EngineState) {
  let move = 0;

  switch (state) {
    case "STABLE":
      move =
        Math.random() > 0.35
          ? 0.5 + Math.random() * 3
          : -(0.2 + Math.random() * 1.8);
      break;

    case "EUPHORIA":
      move =
        Math.random() > 0.18
          ? 3 + Math.random() * 12
          : -(1 + Math.random() * 4);
      break;

    case "RECOVERY":
      move =
        Math.random() > 0.25
          ? 1 + Math.random() * 5
          : -(0.2 + Math.random() * 1.2);
      break;

    case "LOSS_DAY":
      move =
        Math.random() > 0.75
          ? 1 + Math.random() * 3
          : -(2 + Math.random() * 8);
      break;

    case "BREAKER":
      move =
        Math.random() > 0.5
          ? 0.2 + Math.random() * 1
          : -(0.2 + Math.random() * 1.5);
      break;
  }

  return Number(move.toFixed(2));
}

export const engineEvents = {
  STABLE: [
    "AI following stable momentum",
    "Risk stable",
    "Position flow healthy",
  ],

  EUPHORIA: [
    "Breakout sequence active",
    "Momentum expansion detected",
    "Volatility captured",
  ],

  RECOVERY: [
    "Recovery logic engaged",
    "Drawdown absorbed",
    "Rebalancing active",
  ],

  LOSS_DAY: [
    "Protection layer active",
    "Reducing exposure",
    "Volatility exceeded threshold",
  ],

  BREAKER: [
    "Emergency breaker enabled",
    "Capital preservation active",
    "Engine temporarily slowed",
  ],
};
