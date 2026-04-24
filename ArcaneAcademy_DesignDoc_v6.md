# ARCANE ACADEMY — DESIGN DOCUMENT v2
*Companion to v5. Covers all unresolved items + systems never addressed in v5.*
*Status: First draft — subject to tuning.*

---

## PART 1 — RESOLVED V5 OPEN ITEMS

---

### 1.1 CURRENCY THEMATIC NAMES

| Old Name         | New Name          | Rationale                                               |
|------------------|-------------------|---------------------------------------------------------|
| Gold             | **Arcane Marks**  | Academy's internal currency — students earn "marks"     |
| Crystals         | **Ether Shards**  | Free summon fuel, aligns with magic/elemental theme     |
| Premium Crystals | **Lumens**        | Light/premium connotation, short, memorable             |
| Awakening Shards | **Resonance**     | Heroes "resonate" to grow stronger, stars/ascension     |
| Arena Tokens     | **Glory Tokens**  | Earned through combat glory                            |
| Guild Coins      | **Covenant Coins**| Guild = Covenant, heroes bound by oath                  |

---

### 1.2 SOFT PITY CURVE FORMULA

**Basic Summon (Ether Shards → Epic pity at pull 30):**
- Pulls 1–24: base rate applies normally
- Pull 25 onward: Epic rate = base_rate + (base_rate × 10 × (pull - 24))
- Pull 30: Epic guaranteed (hard pity)

**Advanced Summon (Lumens → Legendary pity at pull 80):**
- Pulls 1–59: base rate applies normally
- Pull 60 onward: Legendary rate = base_rate + (base_rate × 10 × (pull - 59))
- Pull 80: Legendary guaranteed (hard pity)

Pity counters persist across sessions. Never reset on trigger — reset only the counter
for the rarity that was triggered, leaving the other counter intact.

**10-pull guarantee:** Every 10-pull on Advanced Summon guarantees at minimum 1 Rare.

---

### 1.3 HERO RESET GOLD FEE SCALING

Formula: `fee = base_fee + (hero_level² × level_multiplier)`

| Hero Level Range | Base Fee (Arcane Marks) | Level Multiplier |
|-----------------|------------------------|-----------------|
| 1–20            | 500                    | 5               |
| 21–50           | 1,000                  | 8               |
| 51–80           | 2,500                  | 12              |
| 81–100          | 5,000                  | 18              |

Example: Level 60 hero → 2,500 + (3,600 × 12) = **45,700 Marks**
Awakening Shards (stars and rarity ascension) are never refunded — permanent investment.

---

### 1.4 ELDER TREE GOLD COSTS PER NODE

All costs in Arcane Marks. Each branch requires the previous node to be purchased first.

**Layer 1 — Economy Branch:**

| Node | Effect | Cost |
|------|--------|------|
| E1 | +10% Gold from all sources | 2,000 |
| E2 | +20% Gold from all sources | 5,000 |
| E3 | +30% Awakening Shard drop rate | 8,000 |
| E4 | Reduced Gear upgrade cost –15% | 12,000 |
| E5 | +15% Daily Codex chest quality | 18,000 |
| E6 | Reduced stage skip cost –20% | 25,000 |
| E7 | Idle cap: 16hr → 22hr | 35,000 |
| E8 | Idle cap: 22hr → 28hr | 55,000 |
| E9 | Idle cap: 28hr → 35hr | 80,000 |
| E10 | Idle cap: 35hr → 45hr (hard cap) | 120,000 |

**Layer 2 — Academy Branch (unlocks at Region 3 completion):**

| Node | Effect | Cost |
|------|--------|------|
| A1 | +1 Arena attempt/day | 30,000 |
| A2 | +25% Academy Grounds passive XP rate | 45,000 |
| A3 | Guild Boss attack cooldown –30min | 60,000 |
| A4 | +20% Guild Coin (Covenant Coin) earnings | 80,000 |
| A5 | +1 Wishlist slot | 100,000 |
| A6 | +1 World Boss attempt/day | 150,000 |

---

### 1.5 GUILD MAX LEVEL CAP

**Hard cap: Level 30**
Rationale: Mirrors the 30-member max. A full, active guild reaches Level 30 in roughly 8–10 months of daily boss activity — aspirational but achievable, creating long-term guild loyalty.

Level progression slows significantly after Level 20 to sustain the goal:
- Levels 1–10: ~1–2 weeks each
- Levels 11–20: ~3–4 weeks each
- Levels 21–30: ~6–8 weeks each

---

### 1.6 ACHIEVEMENT PREMIUM CRYSTAL (LUMEN) REWARD AMOUNTS

Amounts in Lumens.

**Progression Achievements:**
| Achievement | Reward |
|-------------|--------|
| First hero summoned | 10 |
| First Legendary pulled | 30 |
| First Ascended hero | 100 |
| Reach Campaign Region 3 | 50 |
| Reach Campaign Region 5 | 100 |
| Clear 100 Endless Tower floors | 80 |
| Clear Floor 50 on any Affinity Tower | 60 |

**Collection Achievements:**
| Achievement | Reward |
|-------------|--------|
| Own 10 heroes | 20 |
| Own 25 heroes | 40 |
| Own 50 heroes | 80 |
| Complete a full affinity roster | 60 |
| Own a hero of every class | 60 |

**Combat Achievements:**
| Achievement | Reward |
|-------------|--------|
| Win 10 Arena matches | 30 |
| Defeat World Boss on Hard | 50 |
| Deal 1M damage to Guild Boss in one attack | 50 |

**Gear Achievements:**
| Achievement | Reward |
|-------------|--------|
| Equip full 5-slot gear set on one hero | 20 |
| Obtain a Legendary gear piece | 40 |
| Obtain a Mythic gear piece | 80 |

**Social Achievements:**
| Achievement | Reward |
|-------------|--------|
| Join a guild | 10 |
| Participate in 10 Guild Boss attacks | 20 |
| Reach Guild Level 10 | 50 |

**Total max earnable from achievements (one-time): 1,040 Lumens**
This is intentionally meaningful — a dedicated F2P player can save toward a focused multi-pull over time.

---

## PART 2 — HERO ROSTER (FIRST BATCH: 15 LAUNCH HEROES)

The full roster is designed in classes of 3 per affinity to ensure tower viability.
Each hero has a unique name, class, affinity, innate abilities (described conceptually here —
exact numbers tuned during balance pass), and bond link partners.

---

### FIRE AFFINITY

**1. CINDER VALE** — Warrior / Fire / Common
*"The ember that refused to go out."*
- Innate Abilities: Ash Strike (moderate melee damage + minor burn), Heated Guard (brief defense boost)
- Ultimate: Blazing Charge — rushes the highest-HP enemy, deals heavy damage and applies burn
- Bond: None (solo)
- Note: Starter hero gifted at campaign open. Designed to carry players through Region 1.

**2. PYRETH THE BRANDED** — Mage / Fire / Rare
*"He burned his past. Now he burns everything else."*
- Innate Abilities: Ember Bolt (ranged magic damage + burn), Ignite (amplifies burn on already-burning enemies)
- Ultimate: Conflagration — channels for 1s then detonates all burn stacks on all enemies for massive AoE damage
- Bond: "The Branded Pair" with Cinder Vale — both gain +12% damage when deployed together

**3. SERA ASHVEIL** — Healer / Fire / Epic
*"She heals with the same flame that destroys."*
- Innate Abilities: Cauterize (heals an ally, removes bleed debuffs), Fire Ward (AoE resist aura vs. ice attacks)
- Ultimate: Pyre Bloom — heals all allies for moderate HP and grants them a brief burn-immunity shield
- Bond: "The Hearthbound" with Pyreth the Branded — Pyreth gains +20% ability power, Sera gains +15% heal potency

---

### ICE AFFINITY

**4. FROST WARDEN KAEL** — Tank / Ice / Uncommon
*"Cold does not hate. Cold simply stops."*
- Innate Abilities: Glacier Shield (reduces damage taken, small freeze chance), Permafrost Aura (slows all enemy attack speed)
- Ultimate: Absolute Zero — freezes the entire front row of enemies for 2s
- Bond: "The Cold Front" with Yssa Driftborn — Kael gains +18% HP, Yssa gains +15% crit rate

**5. YSSA DRIFTBORN** — Archer / Ice / Rare
*"She doesn't aim. She calculates."*
- Innate Abilities: Cryo Shot (ranged pierce, applies chill), Shatter Arrow (bonus damage to frozen/chilled targets)
- Ultimate: Blizzard Barrage — fires 5 rapid arrows at random enemies, each applying chill
- Bond: "The Cold Front" with Frost Warden Kael

**6. VALE COLDMANTLE** — Assassin / Ice / Epic
*"You'll feel the cold long after she's gone."*
- Innate Abilities: Frostblade (bypasses row protection, applies chill), Hypothermia (chilled targets take +20% damage from all sources)
- Ultimate: Winter's Edge — vanishes, then strikes the enemy back row's highest-damage hero for massive burst + freeze
- Bond: None (solo) — designed as a standalone investment piece for Ice tower

---

### EARTH AFFINITY

**7. STONE SENTINEL GORR** — Tank / Earth / Common
*"He has stood here longer than the walls around him."*
- Innate Abilities: Earthwall (AoE damage reduction for front row), Tremor Stomp (low damage, brief stun chance)
- Ultimate: Bedrock Fortress — all front row allies gain a large HP shield for 3s
- Bond: "The Unbroken" with Briar Thornguard — both gain +15% defense

**8. BRIAR THORNGUARD** — Warrior / Earth / Rare
*"The forest grows back. So does she."*
- Innate Abilities: Thornstrike (melee attack, reflects small damage on hit), Overgrowth (passive HP regen over time)
- Ultimate: Thorn Eruption — damages all enemies and applies a thorns debuff (reflected damage) to the front row
- Bond: "The Unbroken" with Stone Sentinel Gorr

**9. MUDRA THE SHAPER** — Mage / Earth / Uncommon
*"She doesn't cast spells. She rearranges the world."*
- Innate Abilities: Rockslide (delayed AoE damage, hits back row), Sinkhole (single target stuck — cannot move for 1.5s)
- Ultimate: Avalanche — massive AoE earth damage, knocks all enemies back (interrupting any ability being cast)
- Bond: None (solo)

---

### SHADOW AFFINITY

**10. DUSK** — Assassin / Shadow / Rare
*"No title. No history. Just the dark."*
- Innate Abilities: Shadow Step (bypasses row protection, high crit rate), Bleed (leaves a damage-over-time effect on hit)
- Ultimate: Nightfall — targets the enemy with the highest Ultimate charge, deals heavy damage and resets their charge to zero
- Bond: "The Eclipse" with Vesper — Dusk gains +25% crit damage, Vesper gains +20% evasion

**11. VESPER** — Healer / Shadow / Epic
*"She mends wounds that shouldn't exist."*
- Innate Abilities: Dark Mend (heals lowest HP ally, applies a brief evasion buff), Shadow Shroud (makes one ally untargetable for 1.5s)
- Ultimate: Siphon Life — drains HP from the two weakest enemies and distributes it among the two weakest allies
- Bond: "The Eclipse" with Dusk

**12. HOLLOW GRAVYN** — Warrior / Shadow / Uncommon
*"He fights because stopping means thinking."*
- Innate Abilities: Void Slash (moderate melee damage, applies silence — blocks ultimate charge temporarily), Iron Resolve (briefly immune to stun/freeze)
- Ultimate: Cursed Surge — deals heavy melee damage to the front row and silences all hit targets for 2s
- Bond: None (solo)

---

### LIGHT AFFINITY

**13. LUMEN SOLIS** — Healer / Light / Rare
*"The Academy's first graduate. Its proudest memory."*
- Innate Abilities: Radiant Pulse (AoE heal over time), Cleanse (removes one debuff from the most-debuffed ally)
- Ultimate: Divine Resonance — fully heals the two most injured allies and grants all allies a brief damage boost
- Bond: "The Founders' Bond" with Crest of Dawning — both gain +20% to all stats (trio bond, see below)

**14. CREST OF DAWNING** — Warrior / Light / Epic
*"She carries the Academy's crest not on her shield but in every decision."*
- Innate Abilities: Radiant Blade (melee + brief stun on critical hit), Aegis of Light (brief AoE ally damage reduction)
- Ultimate: Judgement Strike — targets the enemy with the most kills this battle, dealing true damage (ignores defense) proportional to kills dealt
- Bond: "The Founders' Bond" with Lumen Solis and Archmage Eloris (trio — all 3 gain +20% to all stats)

**15. ARCHMAGE ELORIS** — Mage / Light / Legendary
*"She wrote the spellbook every other mage is still reading."*
- Innate Abilities: Holy Bolt (strong magic damage, bonus vs. shadow affinity), Arcane Amplify (buffs next ability of any ally)
- Ultimate 1: Starfall — massive AoE magic damage to all enemies, ignores affinity resistance
- Ultimate 2: Arcane Rift — resets the Ultimate charge of all allies to 50% (powerful chain setup)
- Bond: "The Founders' Bond" with Lumen Solis and Crest of Dawning
- Note: First Legendary in the summon pool. Guaranteed in the Newcomer Banner.

---

### BOND LINKS — FULL LAUNCH LIST

| Bond Name | Heroes | Bonus |
|-----------|--------|-------|
| The Branded Pair | Cinder Vale + Pyreth the Branded | +12% damage both |
| The Hearthbound | Pyreth the Branded + Sera Ashveil | Pyreth +20% ability power, Sera +15% heal |
| The Cold Front | Frost Warden Kael + Yssa Driftborn | Kael +18% HP, Yssa +15% crit |
| The Unbroken | Stone Sentinel Gorr + Briar Thornguard | Both +15% defense |
| The Eclipse | Dusk + Vesper | Dusk +25% crit damage, Vesper +20% evasion |
| The Founders' Bond | Lumen Solis + Crest of Dawning + Archmage Eloris | All three +20% all stats |

Note: Archmage Eloris is in two bonds — this is intentional. Players who pull her get immediate
synergy with whichever Foundation member they already own. It's a "gravitational" Legendary —
she makes nearby heroes more valuable and incentivizes collecting her bond partners.

---

## PART 3 — BATTLE STAT FORMULAS

### 3.1 BASE STATS BY CLASS AND RARITY

Base stats at Level 1, Star 1 (scale multiplicatively as level and stars increase).

| Class | Base HP | Base DEF | Base DMG |
|-------|---------|----------|----------|
| Tank | 1,200 | 120 | 80 |
| Warrior | 900 | 90 | 110 |
| Healer | 800 | 80 | 70 |
| Mage | 600 | 60 | 160 |
| Archer | 700 | 65 | 150 |
| Assassin | 550 | 55 | 190 |

**Rarity multiplier applied to above base stats:**

| Rarity | Multiplier |
|--------|-----------|
| Common | ×1.0 |
| Uncommon | ×1.15 |
| Rare | ×1.35 |
| Epic | ×1.65 |
| Legendary | ×2.1 |
| Mythic | ×2.8 |
| Ascended | ×3.8 |

---

### 3.2 LEVEL SCALING

Each level grants: `+2% HP, +1.8% DEF, +2.2% DMG` (compounding, applied to rarity-modified base)

Level 100 hero at Epic rarity (Warrior example):
- Base: 900 HP × 1.65 = 1,485 HP → scaled to Level 100 ≈ **~10,700 HP**
- This is a deliberate design ceiling — gear and stars push well beyond this

---

### 3.3 STAR RATING BONUS

Each star grants a flat +15% to all stats (not compounding — additive per star):

| Stars | Stat Bonus |
|-------|-----------|
| 1★ | +0% (baseline) |
| 2★ | +15% |
| 3★ | +30% |
| 4★ | +45% |
| 5★ | +60% |
| 6★ | +75% (soft ceiling for most players) |

---

### 3.4 DAMAGE FORMULA

```
raw_damage = attacker_DMG × ability_power_multiplier
reduced_damage = raw_damage × (1 - (defender_DEF / (defender_DEF + 500)))
final_damage = reduced_damage × affinity_multiplier
```

**Affinity multiplier:**
- Strong vs (e.g., Fire vs Ice): ×1.3
- Neutral: ×1.0
- Weak vs (e.g., Ice vs Fire): ×0.75

**Affinity wheel (strong → weak → strong):**
Fire → Ice → Earth → Shadow → Light → Fire

---

### 3.5 ABILITY POWER MULTIPLIERS (REFERENCE SCALE)

| Ability Type | Multiplier Range |
|--------------|-----------------|
| Light auto-attack | 0.5–0.8 |
| Normal ability (single target) | 1.2–1.8 |
| Normal ability (AoE) | 0.7–1.0 per target |
| Ultimate (single target) | 2.5–4.0 |
| Ultimate (AoE) | 1.2–2.0 per target |
| Heal (% of healer's DMG stat) | 1.5–2.5 |

Ultimate charge rate: Ultimates charge by 20 points per normal ability cast by any ally.
Ultimates cost 100 points. A hero passively gains 5 charge/second in battle.
Player taps to trigger when full — if not tapped, it triggers automatically at 150 points.

---

## PART 4 — MAIN HUB UI LAYOUT

### 4.1 SCREEN ZONES

The Main Hub uses a fixed portrait layout (480×854). No scrolling. Everything accessible in 2 taps max.

```
┌─────────────────────────────────┐
│  [⚙]          ARCANE ACADEMY  [👤]│  ← Header: Settings left, Profile right
│─────────────────────────────────│
│                                  │
│     [ACADEMY ART / ANIMATED]     │  ← Central art zone (animated idle scene)
│                                  │
│  💛 Marks: 12,450  ✨ Lumens: 48 │  ← Currency bar (persistent)
│  🔵 Ether: 320     🌀 Resonance:9│
│─────────────────────────────────│
│  [COLLECT IDLE GOLD]  [CAMPAIGN] │  ← Primary action buttons
│─────────────────────────────────│
│  [SUMMON]  [ROSTER]  [FORGE]     │  ← Second row: core systems
│─────────────────────────────────│
│  [TOWER]  [ARENA]  [GUILD BOSS]  │  ← Third row: content modes
│─────────────────────────────────│
│  [CODEX]  [ELDER TREE]  [MORE▼] │  ← Fourth row: meta + overflow
└─────────────────────────────────│
```

**[MORE▼] expands to:**
- Achievements
- Guild
- Affinity Towers
- Awakening Altar
- Login Streak
- Settings

**Notification badge rules:**
- Red dot on COLLECT button when idle gold is available
- Red dot on CODEX when tasks completed or daily reset
- Red dot on SUMMON when a free pull is available (login bonus, etc.)
- Never more than 3 dots visible at once — surplus queues silently

### 4.2 ANIMATED IDLE SCENE

The central art shows a top-down academy courtyard. Your deployed squad heroes animate
in the space (idle animations only — walking, training, sitting). As you unlock more
heroes, the courtyard fills. Empty early = visible motivation to summon.
This is a cosmetic layer — no interaction, no tap reward — purely atmosphere.

---

## PART 5 — ONBOARDING FLOW

### 5.1 DESIGN PHILOSOPHY

- Total guided time: under 6 minutes before first real idle reward
- No unskippable text walls — every step is an action, not a lecture
- System introductions are gated naturally by campaign milestones (as designed in v5)
- First monetization prompt: not before minute 15 of total play time
- First Lumen pack shown only after: player clears Stage 1-5 AND attempts one summon

### 5.2 STEP-BY-STEP FIRST SESSION

**Step 1 — Cold Open (0:00–0:45)**
Screen fades in on the Academy courtyard. Narrator voice line (2 seconds, skippable):
*"The Academy has stood for centuries. Today, it needs a champion."*
Player is shown Cinder Vale's hero card. A single tap prompt: **[SEND TO BATTLE]**
No explanation — the action is obvious. Tap → campaign battle begins immediately.

**Step 2 — First Battle Tutorial (0:45–2:00)**
Stage 1-1 auto-resolves with Cinder Vale.
- Highlight: "Your hero fights automatically. Watch their HP bar."
- When Ultimate charges: pulsing glow + "TAP NOW!" tooltip appears once
- Player taps ultimate. Big visual payoff. Enemy defeated.
- Reward screen: Gold + XP. Big numbers. Generous first-clear reward.
- One text card: "Idle rewards now active. Come back later to collect."

**Step 3 — Campaign Selection (2:00–2:30)**
Stage 1-2 is highlighted. Tap to select. No narration. Player drives it.
Stage 1-2 auto-resolves. Reward. 2nd hero gifted (prompted via animated card reveal).
Brief: "Your roster grows. Two heroes, two rows."

**Step 4 — Roster Introduction (2:30–3:30)**
Arrow points to ROSTER button. Player taps. Sees both heroes.
Highlight: stats, class icons. One tooltip: "Equip a hero to your squad from here."
No gear yet — gear intro comes at Stage 1-5.

**Step 5 — Idle Collection Prompt (3:30–4:30)**
Idle rewards have been accumulating since Step 2. Arrow points to COLLECT button.
Collect is tapped → big gold pile animation. "Your Academy earns even when you rest."
This is the emotional anchor for the idle loop — established in session 1.

**Step 6 — Summon Introduction (4:30–6:00)**
Cleared Stage 1-3 triggers Basic Summon unlock.
Arrow points to SUMMON. Player enters Summon scene.
A free 1-pull is already queued (gifted as a welcome reward). Player taps it.
Gets a hero. Reveal animation plays.
Tooltip: "More heroes. Stronger squads." Done.

**Step 7 — Systems Unlock (organic, post-onboarding)**
All remaining systems surface through:
- Campaign milestone pop-ups ("Arena unlocked!")
- Daily Codex tasks pointing to new systems
- Elder Tree early nodes acting as a meta-progression guide

Nothing is forced. The Codex task system acts as the soft tutorial for everything after Region 1.

---

## PART 6 — MONETIZATION DESIGN

### 6.1 PHILOSOPHY

Arcane Academy targets three spending segments:
- **Explorers (F2P):** Never hit a hard wall. Lose in arena and high-difficulty content only.
- **Supporters (Dolphin, $5–30/mo):** Battle Pass + occasional Value Packs. Meaningful advantage without dominance.
- **Collectors (Whale, $30+/mo):** Hero targeting via Wishlist banners. Ascended rarity feels prestigious.

**No ads.** Ads are not part of the monetization model.
Rationale: RPG players tolerate ads at far lower rates than casual players. Ads degrade the premium atmosphere the game's art direction establishes. Revenue model is 100% IAP.

> ⚠️ **Google Play Policy Flag:** All randomized purchase mechanics (summons) **must** display drop rates
> before purchase. The Summon scene must show a visible rates table (accessible in one tap from the
> summon banner screen). This is a hard policy requirement — missing it risks rejection.

---

### 6.2 BATTLE PASS — THE CODEX PASS

**Price: $4.99/month (auto-renewable subscription)**

This is the most important monetization product. Targets the Dolphin segment. Designed to be
the first purchase a new player makes.

**Free Path (all players):**
- Tracks Daily Codex tasks
- Grants Ether Shards, Arcane Marks, small Resonance amounts
- Existing Codex design from v5 serves as the free tier

**Paid Path (Codex Pass holders):**
All free path rewards PLUS:

| Pass Benefit | Amount |
|-------------|--------|
| Daily Lumens bonus (login) | +5 Lumens/day (~150/month) |
| Weekly advanced summon ticket | 1× guaranteed Rare+ pull ticket |
| Monthly exclusive cosmetic | 1× hero portrait frame OR player title |
| Bonus Codex Chest quality | +50% reward value on chest claims |
| Academy Grounds XP boost | +20% passive bench XP rate |

**Monthly value breakdown:**
~150 Lumens + 4 Rare+ tickets + cosmetics — equivalent to ~$10–12 of standalone purchases at
standard rates. Pass at $4.99 = clear value proposition.

> ⚠️ **Play Policy:** Subscriptions require a clear cancellation path, restore purchases flow,
> and cannot promise items that aren't delivered. Ensure subscription benefits are exactly
> as described and revoke correctly on cancellation. Test lapse/restore flows before launch.

---

### 6.3 IAP PACKS — LUMEN STORE

**Standard Pack Tiers:**

| Pack Name | Lumens | Price (USD) | Notes |
|-----------|--------|-------------|-------|
| Spark | 60 | $0.99 | Entry point — impulse buy |
| Ember | 160 | $2.99 | "Best deal for new players" badge |
| Blaze | 330 | $5.99 | ~10% bonus over Ember rate |
| Inferno | 680 | $11.99 | ~15% bonus |
| Firestorm | 1,400 | $24.99 | ~20% bonus |
| Arcane Vault | 3,000 | $49.99 | Best unit rate — whale tier |

Standard packs are always available. No time limit.

**Lumen-to-pull conversion:**
- Advanced Summon costs 300 Lumens per pull (or 2,700 for 10-pull)
- Inferno ($11.99) ≈ 2.27 pulls — intentional: $11.99 doesn't reach a 10-pull, nudges to Firestorm
- Firestorm ($24.99) ≈ 4.67 pulls — two Firestorms = 9 pulls, pushes to Arcane Vault

---

### 6.4 STARTER PACK (ONE-TIME OFFER)

**Shown to new players at first Summon visit after Stage 1-5 (never before).**

**The Academy Welcome Pack — $2.99 (one-time only)**

Contents:
- Archmage Eloris (Legendary) — direct grant, no pull required
- 200 Lumens
- 50,000 Arcane Marks
- 5× Gear (one per slot, all Rare rarity)

Value justification: Eloris is worth far more via summons. Giving her directly creates
an emotional anchor ("I own a Legendary already") and immediately validates the formation
system with a Bond-capable hero.

> ⚠️ **Play Policy:** Direct character grants in paid packs are legal. However, if the character
> is ALSO available via summon, the listing is compliant. Do NOT make Eloris permanently
> exclusive to the pack — she must remain obtainable via summons. The pack just guarantees her.

---

### 6.5 VALUE PACKS (TIME-LIMITED, ROTATING)

Appear in a "Limited Offers" shelf on the Shop screen. One pack active at a time.
Rotates every 7 days. Never pressure-countdown style — just "available this week."

**Example rotation:**

| Week | Pack Name | Contents | Price |
|------|-----------|----------|-------|
| 1 | Resonance Bundle | 30 Resonance + 80 Lumens | $3.99 |
| 2 | Forge Kit | 50,000 Marks + 3× Epic Gear | $2.99 |
| 3 | Guild Starter | 500 Covenant Coins + 1× Glory Token ×50 | $1.99 |
| 4 | Tower Climber | 40 Lumens + 100 Ether Shards | $2.99 |

These target players who are mid-game and want acceleration in a specific system.
Low price keeps them impulse-friendly.

---

### 6.6 WISHLIST BANNER (LIMITED EVENTS — POST-LAUNCH)

**Not at launch.** Introduced in Month 2.

A limited-time banner featuring a new or rotated Legendary hero.
Player's Wishlist applies to this banner. Duration: 14 days.
Separate pity counter from standard Advanced Summon.
Cosmetic visual treatment: unique background, animated portrait.

> ⚠️ Ensure limited banner pity counter is clearly explained in-game and
> tracked transparently. Obscuring pity counters is a pattern regulators target.

---

### 6.7 MONETIZATION FLOW SUMMARY

```
New Player
  ↓
Day 1: First 6 min onboarding → see Starter Pack offer
  ↓
Day 1–3: Organic play → Codex Pass offer surfaced at Stage 2-1 unlock
  ↓
Week 1: If no purchase yet → rotating Value Pack offer (Forge Kit or Resonance Bundle)
  ↓
Ongoing: Standard Lumens store always available, never forced
  ↓
Month 2+: Wishlist Banner events → primary whale conversion moment
```

---

## PART 7 — SAVE AND CLOUD SYNC STRATEGY

### 7.1 SAVE ARCHITECTURE

All game state lives in `GameState.js` (existing). Serialized to:
- **Primary:** Android local storage (localStorage / IndexedDB via Phaser's built-in persistence)
- **Secondary:** Google Play Games Services (GPGS) cloud save — implemented post-launch as a v1.1 feature

**At launch: local-only save.** This is acceptable for initial submission.
Flag in Settings: "Cloud save coming soon."

### 7.2 DATA LOSS RISK MITIGATION

Since launch is local-only:
- Remind players in Settings that uninstalling the app deletes save data
- Prompt players to "screenshot their roster" before major updates (simple in-game reminder)
- Log `lastSaved` timestamp to detect corrupted/missing state on boot and gracefully reset

### 7.3 CLOUD SAVE (v1.1 PLAN)

Google Play Games Services v2 SDK allows cloud save slots. Plan:
- Slot 0: Full GameState JSON (max ~100KB — well within GPGS limits)
- Auto-sync on app open and app background
- Conflict resolution: always use the save with the higher campaign stage cleared

> ⚠️ GPGS requires a Google Play developer account in good standing and
> SHA-1 fingerprint registration. Add this to the pre-launch checklist.

---

## PART 8 — GOOGLE PLAY PUBLISHING CHECKLIST

Flagged issues specific to Arcane Academy's design.

### 8.1 MANDATORY BEFORE SUBMISSION

| Item | Requirement | Status |
|------|-------------|--------|
| Summon odds disclosure | All rarities displayed before purchase, in-app | ❌ Not implemented |
| Privacy Policy URL | Required even for no-account games (collect device data) | ❌ Needs creation |
| Data Safety Form | Declare: no user data collected, no data shared | ❌ Complete in Play Console |
| Age Rating | Complete IARC questionnaire — expect Teen (13+) due to fantasy combat + IAP | ❌ Not started |
| Subscription setup | Google billing library integrated, restore purchases tested | ❌ Post-monetization task |
| App icon | Must be 512×512 PNG, no rounded corners applied by developer | ❌ Art task |
| Feature graphic | 1024×500 PNG for Play Store listing | ❌ Art task |
| Screenshots | Min 2, max 8, portrait, 16:9 or 9:16 | ❌ Art task |

### 8.2 POLICY COMPLIANCE FLAGS

- **Gacha odds disclosure:** Required. Non-negotiable. In-app screen accessible from the summon banner. Must show exact percentages per rarity AND per specific character if Wishlist/limited banners are added.
- **Subscription cancellation:** Must be clearly accessible from within the app (not only through Play Store). Add a "Manage Subscription" button in Settings that deeplinks to Play Store subscription management.
- **No fake urgency:** Countdown timers on packs are fine; fake "Only 3 left!" on digital goods is a deceptive practice flag.
- **In-app purchase targeting minors:** If age rating comes back as Everyone or Everyone 10+, review IAP flows for COPPA compliance. Targeting Teen (13+) is recommended — easier compliance path.
- **Real-money purchase confirmation:** Google handles the payment dialog. Do not add a second "Are you sure?" overlay — it creates double-confirmation confusion and can trigger refund policy issues.

### 8.3 RECOMMENDED APP METADATA

**App Name:** Arcane Academy: Idle Hero RPG
**Short Description (80 chars):** Build your squad. Train your heroes. Conquer the Academy.
**Category:** Role Playing
**Content Rating:** Teen (target)
**Tags:** idle RPG, hero collector, gacha, fantasy, auto battle

---

*End of Document — v2*
*Next: Implement battle stat system, update currency names in codebase, build summon odds UI.*
