import { registerChallengeListener } from "./ChallengeListener";

let registered = false;

export function registerBullionsListeners() {
  if (registered) return;
  registered = true;

  registerChallengeListener();
}
