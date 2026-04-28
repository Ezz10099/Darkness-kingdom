# Design Doc v5 — Implementation Audit

Date: 2026-04-28

## Targeted verification of the 10 flagged items

1. **Affinity matchup table differs from v5 spec** — **Implemented (now aligned)**
   - `AFFINITY_ADVANTAGES` matches v5 relationships: Fire>Earth, Ice>Fire, Earth>Ice, and Shadow<->Light.

2. **Per-affinity title passives are not implemented** — **Implemented**
   - `TITLE_AFFINITY_BONUS` is affinity-specific and `HeroInstance.computeStats()` applies those per-affinity multipliers when a title exists.

3. **Arena “frozen squad” behavior is not implemented** — **Implemented**
   - Arena freezes player squad snapshots at battle start via `freezeSquadFromEntries(...)` and fights with frozen stat snapshots.

4. **Affinity tower leaderboard is stubbed** — **Implemented (local/simulated leaderboard)**
   - `AffinityTowerManager` maintains per-affinity leaderboards and updates them on floor clear; tower UI surfaces top rank line.

5. **Arena shop exclusives are still placeholder/stub content** — **Implemented**
   - Arena shop sells two exclusive hero entries (`hero_arena_valtora`, `hero_arena_nox`) plus materials; no stub title placeholder remains.

6. **Guild join modes (open vs approval-required closed guilds) are not implemented** — **Partially implemented**
   - Open guild joins exist.
   - Closed guild request flow exists (`requestJoinClosedGuild` + UI button), but there is no leader-side approve/reject workflow yet.

7. **Guild end-of-day reward distribution by member contribution is not implemented** — **Partially implemented**
   - A daily contribution payout is computed and claimable.
   - Immediate per-attack coin rewards are still granted, so behavior is hybrid rather than pure day-end distribution.

8. **Mythic/Ascended duplicate-merge flow is not implemented as specified** — **Partially implemented / differs from v5 exact rule**
   - Duplicate Legendary -> Mythic is implemented.
   - Ascended upgrade currently triggers on **existing Mythic + new Legendary duplicate**, not explicit **two Mythics merge**.
   - Shard-based ascension path still exists separately.

9. **Advanced Summon unlock timing differs from v5** — **Implemented (now aligned)**
   - Campaign region schedule unlocks `ADVANCED_SUMMON` at Region 3 completion.

10. **Some v5 scope items are still pending by design** — **Still pending by design**
   - Bond and balancing scope remains intentionally incomplete in places (design-level TBD remains true).
