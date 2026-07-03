export type SixTone =
  | "observation"
  | "opportunity"
  | "attention"
  | "risk"
  | "achievement";

export type SixInput = {
  engineOn: boolean;
  selectedManagers: number;
  copiedTraderName?: string;
  depositedUsd: number;
  profitUsd: number;
  topTraderName?: string;
  hasBullionsAiAccess?: boolean;
};

export type SixMessage = {
  tone: SixTone;
  title: string;
  body: string;
  priority: number;
};

type SixRule = {
  priority: number;
  condition: (input: SixInput) => boolean;
  message: (input: SixInput) => Omit<SixMessage, "priority">;
};

const roi = (input: SixInput) =>
  input.depositedUsd > 0 ? (input.profitUsd / input.depositedUsd) * 100 : 0;

const rules: SixRule[] = [
  {
    priority: 100,
    condition: (input) => !input.engineOn,
    message: (input) => ({
      tone: "attention",
      title: "Your engine is offline.",
      body: input.topTraderName
        ? `${input.topTraderName} is leading the Strategy Universe. Review the opportunity before the next execution window.`
        : "You're currently missing live execution opportunities.",
    }),
  },
  {
    priority: 90,
    condition: (input) => Boolean(input.hasBullionsAiAccess),
    message: () => ({
      tone: "opportunity",
      title: "Institutional access confirmed.",
      body: "Bullions AI is ready for allocation.",
    }),
  },
  {
    priority: 80,
    condition: (input) => !input.copiedTraderName && input.selectedManagers === 0,
    message: () => ({
      tone: "attention",
      title: "No strategy selected.",
      body: "Choose up to three verified managers before enabling allocation.",
    }),
  },
  {
    priority: 70,
    condition: (input) => roi(input) <= -20,
    message: () => ({
      tone: "risk",
      title: "Drawdown requires patience.",
      body: "Avoid increasing exposure until recovery structure improves.",
    }),
  },
  {
    priority: 60,
    condition: (input) => roi(input) >= 20,
    message: () => ({
      tone: "achievement",
      title: "Consistency beats intensity.",
      body: "Your strategy is performing strongly. Maintain discipline before increasing exposure.",
    }),
  },
  {
    priority: 50,
    condition: (input) => input.selectedManagers === 1 || Boolean(input.copiedTraderName),
    message: () => ({
      tone: "attention",
      title: "Your allocation is becoming concentrated.",
      body: "Consider adding a second manager before increasing exposure.",
    }),
  },
  {
    priority: 40,
    condition: (input) => input.selectedManagers >= 3,
    message: () => ({
      tone: "observation",
      title: "Allocation is diversified.",
      body: "Your structure is balanced across managers. Keep risk sizing consistent.",
    }),
  },
];

export function getSixMessage(input: SixInput): SixMessage {
  const rule = [...rules]
    .sort((a, b) => b.priority - a.priority)
    .find((candidate) => candidate.condition(input));

  if (!rule) {
    return {
      tone: "observation",
      title: "Maintain discipline.",
      body: "Capital decisions should be based on structure, not impulse.",
      priority: 0,
    };
  }

  return {
    ...rule.message(input),
    priority: rule.priority,
  };
}
