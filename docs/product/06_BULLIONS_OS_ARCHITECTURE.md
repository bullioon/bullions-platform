# Bullions OS Architecture

Bullions has two user experiences and one shared engine layer.

## User Experiences

### 1. BullPad

For allocators.

Purpose:
- Manage money
- View balance
- Track copied strategies
- Deposit
- Withdraw
- Discover Top Traders
- Open Trader Profiles
- Copy Strategies

Route:
- /bullpad

### 2. Trader Dashboard

For traders.

Purpose:
- Manage trader career
- Manage profile
- Buy challenge
- Manage strategies
- Publish research
- View performance
- View revenue

Future route:
- /trader

Current route:
- /workspace/[id]

### 3. Trader Profile

Public-facing reputation page.

Purpose:
- Build trust
- Show identity
- Show strategies
- Show research
- Show gallery
- Show activity

Future route:
- /t/[username]

### 4. Strategy Profile

Public-facing product page.

Purpose:
- Show performance
- Show challenge rank
- Show risk
- Show research
- Allow copy

Future route:
- /s/[strategySlug]

## Product Flow

Allocator:

BullPad
→ Top Traders
→ Trader Profile
→ Strategy Profile
→ Copy

Trader:

Trader Dashboard
→ Buy Challenge
→ Launch Strategy
→ Trade
→ Rank Top 5
→ Receive Allocators
→ Earn Revenue

## Domain Ownership

Trader owns:
- Profile
- Gallery
- Research
- Strategies
- Challenge access
- Revenue

Strategy owns:
- Performance
- Challenge ranking
- Risk profile
- Copy status
- Allocator capital

Allocator owns:
- Portfolio
- Deposits
- Withdrawals
- Copied strategies
- BullPad activity

## Core Rule

Do not create a new screen unless it belongs to:

- BullPad
- Trader Dashboard
- Trader Profile
- Strategy Profile

Everything else must be a component, engine, service, repository, or adapter.
