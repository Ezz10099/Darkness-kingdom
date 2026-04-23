# Arcane Academy — Design v5 Sanity & Progress Check

Date: 2026-04-23 (UTC)
Scope: repository-wide implementation check against `ArcaneAcademy_DesignDoc_v5.md`.

## Executive Summary

- **Implemented / mostly aligned:** core combat loop, class+affinity scaffolding, formation rows, campaign progression scaffolding, summon rates/pity/wishlist, endless tower, affinity tower, arena core loop, world boss, guild+guild boss, awakening/ascension basics, gear equip/transfer/salvage, elder tree, daily/weekly codex, academy grounds, achievements, currencies.
- **Partially aligned:** reward tuning details, leaderboard/social backend depth, some shop exclusivity details, exact milestone payloads.
- **Missing / not yet represented in code:** Bond Links system, true Arena-exclusive hero pipeline, Affinity Tower floor-200/floor-500 exclusive hero unlock behavior, richer Guild join approval flow, full visual class-icon card language from design.

Estimated alignment: **~78% feature-complete vs v5 design intent** (systems present, many details still simplified).

## Detailed Progress Matrix

### Core Unit / Meta Systems

| Design area | Status | Notes |
|---|---|---|
| Heroes (class, affinity, rarity, stars, level) | ✅ Implemented | Present in constants + hero model + compute scaling. |
| Titles (Legendary+ flavor/passive) | 🟡 Partial | Titles exist and apply flat 5% stat multiplier, but generation rules are static/data-defined. |
| Ability model (normal auto + player-triggered ult) | ✅ Implemented | Battle engine supports auto abilities + manual ultimate trigger flow. |
| 5 gear slots | ✅ Implemented | Weapon/Robe/Accessory/Relic/Sigil supported. |
| Bond Links | ❌ Missing | No bond data model or combat passive linking found. |
| Star caps + level caps per rarity | ✅ Implemented | Rarity config matches design table. |
| Rarity ascension ceiling by origin rarity | ✅ Implemented | Enforced via `ASCENSION_CEILING`. |

### System 1–12

| System | Status | Notes |
|---|---|---|
| 1 Campaign | ✅ Implemented | 5 regions / 80 stages scaffolding, unlock milestones, stage skip, battle flow present. |
| 2 Endless Tower | ✅ Implemented | Persistent floor progression + rewards + boss cadence by floor 10. |
| 3 Affinity Towers | 🟡 Partial | 5 towers + milestones exist; leaderboard is stubbed, exclusive hero rewards not wired. |
| 4 Arena | 🟡 Partial | Daily attempts/rank/match loop exists; “exclusive heroes” via shop not fully realized (shop has mostly packs/cosmetic stub). |
| 5 World Boss | ✅ Implemented | Tiered boss, damage-based rewards, attempt limits, daily reset, Elder Tree attempt bonus. |
| 6 Guild Boss | 🟡 Partial | Shared HP + contribution-ish rewards exist; fully detailed member contribution distribution/true multiplayer not present. |
| 7 Awakening Altar | 🟡 Partial | Duplicate conversion, stars, ascension, hero reset exist; full-screen ascension event is not explicit. |
| 8 Gear Forge | 🟡 Partial | Equip/upgrade/transfer/salvage present; drop-table depth gating is simplified/not fully content-driven. |
| 9 Elder Tree | ✅ Implemented | Economy + academy nodes align strongly including idle cap ladder and attempt bonuses. |
| 10 Daily Codex | ✅ Implemented | Daily reset, 6 tasks, weekly task/chest implemented. |
| 11 Guild | 🟡 Partial | Guild create/join/level/perks/shop supported; open/closed approval and full leaderboard social layer are simplified. |
| 12 Academy Grounds | ✅ Implemented | Bench XP catch-up logic + cap to lowest active squad member implemented. |

### Achievements + Currency

| Area | Status | Notes |
|---|---|---|
| Achievement categories + one-time rewards | ✅ Implemented | Progression/collection/combat/gear/social achievements included. |
| Currency set + sinks/sources | ✅ Implemented | All listed currency types exist and are consumed across systems. |

## Key Gaps (Highest Impact)

1. **Bond Links missing entirely** (data + activation + passive math + UI).
2. **Affinity Tower milestone exclusives not matching v5** (design calls for exclusive heroes at floors 200/500).
3. **Arena exclusive hero economy not implemented** (shop contains placeholder/currency packs instead of exclusive roster loop).
4. **Leaderboard/back-end social systems are mostly local placeholders** (Arena/Affinity/Guild rank visibility depth is limited).
5. **Guild approval flow + open/closed governance is simplified** (no request queue/approval state machine).

## Sanity Check Notes (Architecture Quality)

- Good separation of concerns: managers are modular and persisted through `GameState` serialization.
- Most v5 systems have at least one dedicated manager + scene, which is strong progress for breadth.
- Main risk now is **depth parity**, not breadth parity: many systems exist but need richer rules/content to match exact v5 spec language.

## Recommended Next Milestone (v5 parity sprint)

1. Ship **Bond Links v1** (data schema + passive activation + roster UI indicators).
2. Replace Arena shop placeholder with **exclusive hero rotation** pipeline.
3. Add **Affinity Tower milestone reward resolver** for floor 200/500 exclusive heroes.
4. Implement shared leaderboard adapter interface (local now, backend-ready later).
5. Expand guild join mode handling (open/closed + approval queue abstraction).
