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
  if (roi > 45) return "EUPHORIA";

  // martes y viernes: días rojos potenciales
  if (day === 2 || day === 5) return "LOSS_DAY";

  return "STABLE";
}

export function generateMove(state: EngineState) {
  let move = 0;

  switch (state) {
    case "STABLE":
      move =
        Math.random() > 0.28
          ? 1.8 + Math.random() * 5.2
          : -(0.6 + Math.random() * 2.4);
      break;

    case "EUPHORIA":
      move =
        Math.random() > 0.16
          ? 6 + Math.random() * 18
          : -(1.5 + Math.random() * 5);
      break;

    case "RECOVERY":
      move =
        Math.random() > 0.22
          ? 2.5 + Math.random() * 7.5
          : -(0.5 + Math.random() * 2);
      break;

    case "LOSS_DAY":
      move =
        Math.random() > 0.68
          ? 1.5 + Math.random() * 5
          : -(3 + Math.random() * 12);
      break;

    case "BREAKER":
      move =
        Math.random() > 0.55
          ? 0.5 + Math.random() * 2
          : -(0.4 + Math.random() * 2);
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
