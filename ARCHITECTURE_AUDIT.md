# Bullions Architecture Audit

## Existing Core
- core/v2/kernel/BullionsKernel.ts
- core/v2/runtime/RuntimeEngine.ts
- core/v2/runtime/RuntimeRepository.ts
- core/v2/runtime/capital-rankings.ts
- core/v2/challenge/ChallengeEngine.ts
- core/v2/adapters/MT5Adapter.ts
- core/v2/services/PerformanceScheduler.ts

## UI Generations
- components/v2: new product UI
- components/terminal: BullPad / terminal UI
- components/layout: shared layout

## Rule
No new duplicated leaderboard.
Capital Rankings must power:
- Mission Control
- BullPad
- Strategy Universe
- Challenge
