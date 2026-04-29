# Darkness Kingdoms — Full Game Design Document

## 1. High Concept

**Darkness Kingdoms** is a mobile portrait idle RPG / hero collector / gacha game inspired by the AFK Arena core loop.

The player is the resurrected ruler of a fallen dark kingdom. After death, betrayal, and the collapse of their throne, the ruler returns through forbidden abyssal magic. Their goal is to rebuild power, summon heroes, recover relics, fight through rival kingdoms, and reclaim dominion over a world divided by ancient crowns, curses, bloodlines, and hidden gods.

The game should feel premium, gothic, royal, dangerous, and highly collectible.

## 2. Core Player Fantasy

The player should feel like:

- a fallen ruler returning from death
- a commander rebuilding a cursed kingdom
- a collector of legendary heroes
- a strategist forming teams across rival kingdoms
- a long-term account builder gaining power daily
- a ruler reclaiming lost lands through campaign progression

The player is not a student, academy mage, school master, or classroom hero. Any old academy identity must be replaced.

## 3. Core Loop

Primary loop:

1. Collect idle rewards
2. Upgrade heroes and gear
3. Push campaign chapter map
4. Hit a progression wall
5. Use side systems for resources
6. Summon / ascend / gear heroes
7. Break the wall
8. Unlock new systems and kingdoms
9. Repeat

This loop is allowed to closely follow AFK Arena-style idle RPG structure, while all names, visuals, story, heroes, factions, and UI identity must remain original.

## 4. Launch World Structure

At launch, the game has **five major kingdoms/factions**.

They are based on ancient political kingdoms and dark magical identity, not simple elements only.

Recommended launch kingdoms:

### 4.1 The Fallen Crown

The player's ruined kingdom. Once powerful, now shattered by betrayal and abyssal resurrection magic.

Theme: black stone, royal purple, lost throne, cursed loyalty, resurrected knights.

Role: player identity, main hub, starter heroes, long-term reclaiming arc.

### 4.2 The Sunken Dominion

An old sea-kingdom swallowed by fog, drowned cathedrals, and ghost fleets.

Theme: drowned royalty, salt-corroded armor, bells under water, spectral sailors.

Role: early campaign enemy and recruitable faction.

### 4.3 The Iron Theocracy

A militant kingdom ruled by holy law, iron masks, and anti-abyss crusaders.

Theme: white iron, red banners, cathedral armies, judgment magic.

Role: morally grey antagonist kingdom.

### 4.4 The Thorn Court

A forest kingdom of poison nobility, assassins, ancient pacts, and living thrones.

Theme: black roses, thorn crowns, venom politics, masked nobles.

Role: rogue/assassin/healer-heavy faction.

### 4.5 The Ashen Empire

A volcanic imperial kingdom built on conquest, war engines, and royal fire rituals.

Theme: ash, bronze, war banners, burned palaces, imperial generals.

Role: warrior/tank-heavy faction and major campaign rival.

These names are design placeholders and can be refined later, but the concept of five kingdom-based factions is locked.

## 5. Player Role and Story Premise

The player was once ruler of a dark kingdom. Their throne was destroyed, their bloodline erased, and their soul sealed beneath the capital.

Centuries later, a forbidden relic awakens. The ruler returns, but the world has changed. Old allies became kingdoms, enemies became empires, and the fallen throne is now myth.

The campaign follows the ruler reclaiming influence chapter by chapter.

Story pillars:

- resurrection
- lost crown
- rival kingdoms
- ancient betrayals
- cursed heroes
- recovered relics
- throne restoration
- world-scale kingdom war

## 6. Combat Design

Combat style:

- mostly auto combat
- player taps ultimates
- 5-hero team
- front/back formation locked
- front row protects back row where applicable
- short mobile battles
- readable ability effects

Team structure:

- up to 5 heroes
- maximum 3 front row
- maximum 3 back row
- heroes have recommended row based on class

Classes:

- Warrior
- Tank
- Mage
- Archer
- Healer
- Assassin

Class identity:

- Warrior: balanced melee damage and durability
- Tank: frontline protection and control
- Mage: area damage, status, burst magic
- Archer: backline sustained damage and precision
- Healer: healing, protection, recovery
- Assassin: backline pressure and execution-style damage

## 7. Hero System

Heroes are the emotional and monetization core of the game.

Each hero needs:

- name
- title
- kingdom/faction
- class
- rarity
- role
- preferred row
- normal ability
- ultimate ability
- short lore
- bond links
- portrait asset
- combat icon or sprite

Hero progression:

- level
- XP
- rarity/ascension
- stars
- gear
- skills/abilities
- bonds

Hero bonds:

Heroes should have lore bonds and relationship bonuses. Bonds should connect characters by bloodline, oath, betrayal, kingdom, rivalry, romance, shared war, or ancient curse.

Bond examples:

- Fallen Oath: two former royal guards gain bonuses together
- Thorn Betrayal: assassin and poisoned noble gain bonus damage
- Drowned Bloodline: ghost captain and sea priestess gain sustain bonus
- Iron Judgment: crusader and executioner gain defense/control bonus

Implementation note: current bond logic can remain underneath for now, but naming and display should become kingdom/lore-based.

## 8. Campaign Design

Campaign should use **chapter map screens**, not plain stage lists.

Each chapter should feel like a place in the world, with a unique background and stage nodes placed over it.

Campaign structure:

- chapters grouped by kingdom/region
- each chapter has visual map background
- stage nodes unlock sequentially
- boss stage at chapter end
- milestone rewards unlock systems
- cleared stages can offer quick/skip rewards if implemented

Campaign screen must always include:

- top fixed panel
- bottom fixed panel
- side panel or side buttons
- chapter/map background in the center
- visible stage nodes
- back button
- formation button
- reward preview

Chapter background rule:

Each chapter should eventually have its own high-resolution background:

- campaign_chapter_01_bg.png
- campaign_chapter_02_bg.png
- campaign_chapter_03_bg.png
- campaign_chapter_04_bg.png
- campaign_chapter_05_bg.png

The first chapter should represent the road back to the Fallen Crown.

## 9. Main Hub Design

The Main Hub is the first priority screen.

It should show the resurrected ruler's dark kingdom rebuilding over time.

Required layout:

- top resource bar
- player avatar / ruler profile
- power display
- currency row
- settings button
- central kingdom scene
- interactive buildings
- left side button stack
- right side button stack
- bottom navigation bar

Important hub buildings:

- Campaign Gate
- Summon Portal
- Hero Hall / Roster
- Guild Hall
- Tower / Trials Gate
- Abyssal Tree or Elder Tree equivalent

Visual direction:

- gothic kingdom under purple moonlight
- ruined throne architecture
- dark castle silhouettes
- purple abyssal glow
- antique gold UI trim
- floating particles
- premium mobile RPG depth

## 10. Major Systems

Keep these systems:

### 10.1 Campaign

Core progression mode. Unlocks content and tells the world story.

### 10.2 Roster / Heroes

Hero collection, upgrade, gear, ascension, bonds, team management.

### 10.3 Summon

Gacha hero acquisition. Uses banners, pity, wishlist, duplicate conversion, and premium presentation.

### 10.4 Gear

Equipment, upgrades, salvage, forge/crafting where appropriate.

### 10.5 Arena

PvP-style asynchronous battles against generated or saved teams.

### 10.6 Guild

Guild lobby, guild boss, guild shop, guild quests, social identity.

### 10.7 Towers

Faction/kingdom tower progression using kingdom-based team bonuses.

### 10.8 World Boss

Daily/weekly boss damage race with milestone rewards.

### 10.9 Elder Tree Equivalent

Rename away from academy language. Possible names:

- Throne of Roots
- Abyssal Tree
- Crownroot Altar
- Ancient Dominion Tree

Function: long-term account-wide bonuses.

### 10.10 Codex Equivalent

Daily/weekly task hub. Possible names:

- Royal Codex
- War Codex
- Dominion Codex
- Crown Ledger

Function: tasks, weekly chests, player routine.

## 11. Economy

Premium currency:

**Abyss Crystals**

Other possible currencies:

- Gold
- Summon Seals
- Hero Shards
- Guild Coins
- Arena Medals
- Tower Sigils
- Relic Dust
- Gear Essence

First design doc should focus on gameplay/UI/lore. Monetization plans can be added later.

## 12. Summon System

Summoning should remain a core system.

Summon screen fantasy:

The player opens an abyssal royal gate, throne mirror, blood crystal, or void altar to call heroes from rival kingdoms and dead bloodlines.

Summon types:

- Basic Summon
- Advanced Summon
- Kingdom/Faction Summon
- Event Summon later

Summon presentation:

- large central portal/altar
- premium button for x1 and x10
- visible currency cost
- rates page
- pity tracker
- wishlist later
- dramatic reveal animation later

## 13. UI / Art Bible Summary

Visual identity:

- premium gothic dark fantasy
- black depth
- royal purple magic
- antique gold trim
- crimson danger accents
- carved stone
- ornate metal
- abyss crystals

UI assets needed per screen should be defined before implementation.

Reusable UI kit assets:

- top_panel_frame.png
- bottom_panel_frame.png
- side_panel_frame.png
- panel_large.png
- panel_small.png
- card_frame_gold.png
- icon_frame_round.png
- btn_primary.png
- btn_secondary.png
- btn_danger.png
- notification_badge_red.png
- tab_active.png
- tab_inactive.png

Main Hub assets:

- main_hub_bg.png
- campaign_gate_icon.png
- summon_portal_icon.png
- heroes_icon.png
- guild_icon.png
- settings_icon.png
- side_button_icons

Campaign assets:

- campaign_shell_top.png
- campaign_shell_bottom.png
- campaign_side_panel.png
- campaign_stage_node_normal.png
- campaign_stage_node_cleared.png
- campaign_stage_node_locked.png
- campaign_stage_node_boss.png
- campaign chapter backgrounds

## 14. Technical Implementation Direction

Current implementation uses Phaser 3 mobile portrait.

Development rules:

- code in small PRs
- one screen or subsystem per PR
- fresh Codex task after each merge
- do not use old branches after main changes
- do not modify PNG assets in Codex unless explicitly intended
- avoid broad multi-screen visual prompts
- test in SPCK after each merge

UI implementation rules:

- build reusable UI components first
- define exact coordinates and safe areas
- do not layer new PNGs randomly over old Phaser rectangles
- replace old shapes intentionally
- preserve hit zones and scene navigation
- keep text readable above assets

## 15. Immediate Roadmap

### Phase 1 — Identity Cleanup

- Replace Arcane Academy visible text
- Replace academy system names
- Update README and docs
- Ensure all prompts use Darkness Kingdoms

### Phase 2 — UI Foundation

- Build reusable Darkness UI kit
- top bar component
- bottom nav component
- side button component
- ornate panel component
- button component
- notification badge component

### Phase 3 — Main Hub

- create final main hub background
- place fixed top/bottom/side UI shell
- replace old Phaser placeholder shapes
- preserve current navigation

### Phase 4 — Campaign Map

- refactor campaign away from plain stage list
- build fixed top/bottom panel shell
- add chapter map background support
- place stage nodes on map
- create one background per chapter

### Phase 5 — Summon

- redesign summon altar/portal
- create summon buttons
- improve reveal cards
- add pity/rates presentation

### Phase 6 — Roster

- redesign hero cards
- add kingdom/faction display
- improve gear and bond presentation

### Phase 7 — Other Systems

- Arena
- Guild
- Towers
- World Boss
- Codex
- Shop

## 16. Design Decisions Locked From User Answers

- Title: Darkness Kingdoms
- Genre: idle RPG / gacha / AFK Arena-inspired
- Tone: dark fantasy, gothic, kingdom wars, ancient magic
- Launch kingdoms: five
- Kingdom basis: ancient political kingdoms + dark magical identity
- Player role: resurrected ruler of a fallen dark kingdom
- Combat: mostly auto, player taps ultimates
- Team size: 5 heroes
- Formation: front/back locked
- Campaign format: chapter map screens
- Classes: Warrior, Tank, Mage, Archer, Healer, Assassin
- Affinities: redesign into kingdoms/factions while keeping current logic underneath for now
- Bonds: lore bonds / relationship bonuses
- Systems kept: Campaign, Roster, Summon, Gear, Arena, Guild, Towers, World Boss, Elder Tree equivalent, Codex equivalent
- Removed systems: none major yet
- Renaming priority: academy-related systems only
- Premium currency: Abyss Crystals
- First document focus: gameplay/UI/lore, monetization later
- First priority screen: Main Hub
- Document audience: Codex implementation and artist/image generation
