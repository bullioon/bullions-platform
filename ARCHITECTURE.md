# Bullions Architecture v1.0

## Core Thesis

Bullions is not a copy trading app.

Bullions is a Strategy Economy.

The strategy is the asset.
The manager is the creator.
The allocator assigns capital.
SIX provides independent intelligence.

## Official Language

Use:
- Strategy Manager
- Strategy
- Allocator
- Portfolio
- Allocation
- Strategy Universe
- Challenge Season
- Performance Snapshot
- Strategy Runtime
- SIX Assessment

Avoid:
- Trader as primary entity
- Copier as primary domain term
- Fund unless legally structured
- Signal as product language

## Primary Flow

User
→ Strategy Manager Profile
→ Strategy
→ MT5 / Broker Data
→ Performance Snapshot
→ Strategy Runtime
→ Challenge Ranking
→ Strategy Universe
→ Allocator Portfolio
→ Portfolio Performance
→ Revenue
→ SIX Intelligence

## Firebase Collections

### users
Stores identity, role, tier, and manager profile.

### managerStrategies
Source of truth for each strategy.

### strategyPerformanceSnapshots
Time-series MT5/broker data by strategy.

### strategyRuntimes
Current computed state of each strategy.

### challengeSeasons
Monthly 50k / 300k challenge seasons.

### challengeEntries
Strategies enrolled in a challenge.

### allocatorPortfolios
Allocator-owned portfolios.

### portfolioAllocations
Strategy weights inside a portfolio.

### portfolioSnapshots
Computed portfolio performance over time.

### revenueEvents
Fees, payouts, revenue share, and challenge payments.

## Strategy Runtime

The Strategy Runtime is the central read model.

It combines:
- identity
- manager
- latest performance
- scores
- challenge state
- universe eligibility
- SIX assessment

UI should consume runtime whenever possible.

## MT5 / Broker Rule

MT5 never owns business logic.

Correct flow:

MT5 / Broker
→ Adapter
→ Performance Snapshot
→ Performance Engine
→ Strategy Runtime
→ Firestore

## Allocation Rule

Allocators do not copy trades in MVP.

They copy strategy performance.

Example:

Portfolio deposit: 300 USD

Strategy A: 20%
Strategy B: 10%
Strategy C: 70%

Portfolio return:
A return * 0.20
+ B return * 0.10
+ C return * 0.70

## Challenge Rule

Strategies enter monthly seasons.

Each season has:
- type: 50k or 300k
- max spots: 20
- fee
- status
- top 5 output

Leaderboard is calculated from Strategy Runtime, not raw trader data.

## SIX Rule

SIX does not replace metrics.

SIX translates metrics into conviction.

SIX should explain:
- execution quality
- risk behavior
- consistency
- allocator suitability
- anomalies

## UI Rule

Screens do not calculate core metrics.

Screens display data from:
- Strategy Runtime
- Portfolio Runtime
- Challenge Runtime

## Build Priority

1. Strategy Runtime
2. MT5 Adapter
3. Portfolio Engine
4. Strategy Universe
5. Challenge Engine 2.0
6. SIX Intelligence
7. Revenue Engine
8. Production hardening
