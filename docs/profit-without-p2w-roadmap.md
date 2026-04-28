# Profit-First (Without Pay-to-Win) Roadmap

## Product guardrails (do not break)
1. **No power-only paywalls:** any paid gameplay resource must also be earnable in-game.
2. **Competitive fairness:** paid offers can save time, not create exclusive PvP stat advantages.
3. **Transparent EV:** disclose rates/pity and expected time-to-earn for key currencies.
4. **Retention over extraction:** optimize D30 and payer conversion quality, not only first-week ARPPU.

## Current repo status (what you already have)
- Core multi-currency economy exists (`GOLD`, `CRYSTALS`, `PREMIUM_CRYSTALS`, etc.).
- Strong mode loop coverage already exists (Campaign, Tower, Arena, Guild, Codex, Boss).
- Idle + offline rewards are implemented with cap logic via `IdleManager` and Elder Tree bonuses.
- Save/load is local only (no analytics or economy telemetry yet).

## Next implementation steps (priority order)

### Step 1 — Instrumentation before monetization (Week 1)
Goal: know where users churn and where they feel scarcity.

- Add `AnalyticsManager` with events:
  - `session_start`, `session_end`
  - `idle_collect`, `summon_started`, `summon_result`
  - `shop_view`, `shop_purchase_attempt`, `shop_purchase_success`
  - `progression_blocked` (stage loss streak, resource shortage)
- Track key economy KPIs per day:
  - earned/spent by currency
  - free vs paid currency usage (reserve a source field now)
  - progression velocity (stages/day, hero power/day)
- Add lightweight logging hooks in `MainHubScene`, `SummonScene`, `ArenaShopScene`, `GuildShopScene`, `IdleManager`, `CurrencyManager`.

**Definition of done:** CSV/JSON export from sessions to review funnels manually.

### Step 2 — Build a non-P2W storefront skeleton (Week 2)
Goal: monetize convenience + identity first.

- Add `MonetizationCatalog` data file:
  - `cosmetics` (skins, frames, emotes)
  - `time_savers` (idle claim multipliers, queue slots, auto-clear tickets)
  - `subscriptions` (daily QoL package with capped value)
- Add strict offer metadata:
  - `purchasableWith`: `real_money | premium_currency | both`
  - `earnable`: boolean (must be true for gameplay-impacting items)
  - `earnPath`: where/how to earn free
  - `powerImpact`: `none | low | high` (disallow `high` behind cash)
- Implement first screens in `Settings` or a new `ShopScene`.

**Definition of done:** all paid gameplay-affecting entries have an earn path and visible note.

### Step 3 — Add long-horizon earn paths for premium items (Week 3)
Goal: keep trust while preserving monetization urgency.

- Expand `DailyCodexManager` + weekly quest equivalents to grant small premium currency.
- Add pity/guarantee mechanics to summoning and surface progress in UI.
- Add “choice token” systems in Tower/Guild/Boss modes so consistent play can target desired outcomes.
- Add anti-hoarding sinks that are optional (cosmetic crafting, profile prestige), not mandatory for power.

**Definition of done:** a fully free player can model a credible path to any gameplay item.

### Step 4 — Live-ops cadence (Week 4)
Goal: increase engagement without predatory pressure.

- 7-day mini-events with:
  - free track (power-neutral + some progression)
  - paid track (mostly cosmetics + convenience)
- Monthly season pass:
  - never contains exclusive, permanent PvP power
  - paid track includes faster completion and vanity rewards
- Re-engagement bundles only after inactivity windows; cap popups/session.

**Definition of done:** event system template + pass config, with anti-spam display limits.

### Step 5 — Fairness balancing pass (Week 5)
Goal: protect gameplay integrity while improving revenue.

- Add economy simulator script for 30/60/90-day F2P vs spender curves.
- Set guardrail thresholds:
  - max paid acceleration factor in PvE progression (e.g., <=2x)
  - PvP win-rate delta at matched skill stays inside target band
- Run A/B variants on offer price, not on hidden odds.

**Definition of done:** balancing report with pass/fail against guardrails before scaling ads/UAs.

## Metrics dashboard (first 90 days)
- Retention: D1, D7, D30
- Monetization: payer conversion, ARPPU, revenue/day
- Fairness sentiment: refund rate, negative store-review % mentioning P2W, support tickets tagged fairness
- Economy health: premium earn rate, premium spend rate, summon pity completion rate
- Engagement: sessions/day, mode participation mix, event completion rate

## Red lines (profit-killing if crossed)
- Hidden odds or unclear pity.
- Time-limited paid power with no future free path.
- Stackable passes that multiply combat power.
- Aggressive popup frequency after losses.

## Immediate backlog tickets to create now
1. `feat(analytics): add AnalyticsManager event pipeline`
2. `feat(shop): add MonetizationCatalog with earnPath + powerImpact metadata`
3. `feat(summon): add pity progress + UI disclosure`
4. `feat(codex): add premium-currency weekly earn track`
5. `feat(liveops): add event/pass config schema with free+paid tracks`
6. `chore(balance): create economy simulation script and guardrail tests`


## External references used (April 28, 2026)
- PocketGamer.biz reported AFK Arena surpassing **$1.5B lifetime revenue** at its 7th anniversary (signal: long-tail live-ops works).
- Sensor Tower's Aug 2024 recap highlighted strong AFK Journey revenue growth after regional launch (signal: cadence + market expansion matters).
- MobileGamer.biz 2025 top-grossing analysis shows stable spend concentration in live-service titles with strong retention loops.

Use these as directional market inputs, not exact design copies.
