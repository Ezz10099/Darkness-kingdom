# Design Doc v5 — Implementation Audit

Date: 2026-04-28

## Implemented at high level
- Core managers and scenes exist for Campaign, Endless Tower, Affinity Towers, Arena, World Boss, Guild/Guild Boss, Awakening Altar, Gear, Elder Tree, Daily Codex, Academy Grounds, and Achievements.

## Still unimplemented or partial vs v5
1. **Affinity matchup table differs from v5 spec**
   - v5: Fire>Earth, Ice>Fire, Earth>Ice, Shadow<->Light only.
   - current constants use a different matrix.

2. **Per-affinity title passives are not implemented**
   - current hero stats apply a flat title bonus multiplier (1.05) rather than affinity-specific passives.

3. **Arena “frozen squad” behavior is not implemented**
   - current arena creates random opponents, but there is no player-side frozen snapshot lock at entry time.

4. **Affinity tower leaderboard is stubbed**
   - UI explicitly marks leaderboard as stub.

5. **Arena shop exclusives are still placeholder/stub content**
   - shop includes a stub cosmetic title entry.

6. **Guild join modes (open vs approval-required closed guilds) are not implemented**
   - current guild flow supports create/join from predefined open guilds; no closed-guild approval flow.

7. **Guild end-of-day reward distribution by member contribution is not implemented**
   - current rewards are immediate per attack; no day-end contribution payout model.

8. **Mythic/Ascended duplicate-merge flow is not implemented as specified**
   - current ascension uses shard thresholds and linear rarity upgrades; no explicit "two identical Legendary -> Mythic" and "two identical Mythic -> Ascended" merge flow.

9. **Advanced Summon unlock timing differs from v5**
   - v5 says unlock at Campaign Region 3; current content unlocks at Region 2 completion.

10. **Some v5 scope items are still pending by design**
   - Bond full pairing list and tuning items are marked TBD in v5 and remain incomplete by nature.
