# Darkness Kingdom — Full Game Design Document

## 1. High Concept

**Darkness Kingdom** is a mobile portrait idle RPG / hero collector inspired by premium idle RPG structure.

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

## 3. Official naming rule

The official project title is **Darkness Kingdom**.

Do not write **Arcane Academy** in UI, code, docs, lore, prompts, asset plans, save names, or future implementation notes.

Do not use academy/school/classroom identity unless the owner explicitly asks for it.

## 4. Core Loop

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

## 5. Launch World Structure

At launch, the game has five major kingdoms/factions.

They are based on ancient political kingdoms and dark magical identity, not simple elements only.

Recommended launch kingdoms:

### 5.1 The Fallen Crown

The player's ruined kingdom. Once powerful, now shattered by betrayal and abyssal resurrection magic.

Theme: black stone, royal purple, lost throne, cursed loyalty, resurrected knights.

Role: player identity, main hub, starter heroes, long-term reclaiming arc.

### 5.2 The Sunken Dominion

An old sea-kingdom swallowed by fog, drowned cathedrals, and ghost fleets.

Theme: drowned royalty, salt-corroded armor, bells under water, spectral sailors.

Role: early campaign enemy and recruitable faction.

### 5.3 The Iron Theocracy

A militant kingdom ruled by holy law, iron masks, and anti-abyss crusaders.

Theme: white iron, red banners, cathedral armies, judgment magic.

Role: morally grey antagonist kingdom.

### 5.4 The Thorn Court

A forest kingdom of poison nobility, assassins, ancient pacts, and living thrones.

Theme: black roses, thorn crowns, venom politics, masked nobles.

Role: rogue/assassin/healer-heavy faction.

### 5.5 The Ashen Empire

A volcanic imperial kingdom built on conquest, war engines, and royal fire rituals.

Theme: ash, bronze, war banners, burned palaces, imperial generals.

Role: warrior/tank-heavy faction and major campaign rival.

These names are design placeholders and can be refined later, but the concept of five kingdom-based factions is locked.

## 6. Player Role and Story Premise

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

## 7. Combat Design

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

## 8. Hero System

Heroes are the emotional and progression core of the game.

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

Hero bonds should connect characters by bloodline, oath, betrayal, kingdom, rivalry, shared war, or ancient curse.

## 9. Campaign Design

Campaign should use chapter map screens, not plain stage lists.

Each chapter should feel like a place in the world, with a unique background and stage nodes placed over it.

Campaign screen must always include:

- top fixed panel
- bottom fixed panel
- side panel or side buttons
- chapter/map background in the center
- visible stage nodes
- back button
- formation button
- reward preview

The first chapter should represent the road back to the Fallen Crown.

## 10. Main Hub Design

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

Visual direction:

- gothic kingdom under purple moonlight
- ruined throne architecture
- dark castle silhouettes
- purple abyssal glow
- antique gold UI trim
- floating particles
- premium mobile RPG depth

## 11. Major Systems

Keep these systems:

- Campaign
- Roster / Heroes
- Summon
- Gear
- Arena
- Guild
- Towers
- World Boss
- Elder Tree equivalent
- Codex equivalent
- Shop

Rename any remaining academy-related system names.

## 12. UI / Art Bible Summary

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

## 13. Technical Implementation Direction

Current implementation uses Phaser 3 mobile portrait.

Development rules:

- code in small PRs
- one screen or subsystem per PR
- fresh branch after each merge
- do not modify PNG assets unless explicitly intended
- avoid broad multi-screen visual prompts
- test in SPCK after each merge

UI implementation rules:

- build reusable UI components first
- define exact coordinates and safe areas
- do not layer new PNGs randomly over old Phaser rectangles
- replace old shapes intentionally
- preserve hit zones and scene navigation
- keep text readable above assets

## 14. Immediate Roadmap

### Phase 1 — Identity Cleanup

- Replace old visible text
- Replace academy system names
- Update README and docs
- Ensure all prompts use Darkness Kingdom

### Phase 2 — UI Foundation

- Build reusable Darkness Kingdom UI kit
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

## 15. Locked Direction

- Title: Darkness Kingdom
- Genre: idle RPG / hero collector
- Tone: dark fantasy, gothic, kingdom wars, ancient magic
- Launch kingdoms: five
- Player role: resurrected ruler of a fallen dark kingdom
- Combat: mostly auto, player taps ultimates
- Team size: 5 heroes
- Formation: front/back locked
- Campaign format: chapter map screens
- Classes: Warrior, Tank, Mage, Archer, Healer, Assassin
- Premium currency: Abyss Crystals
- First priority screen: Main Hub
- Document audience: implementation and artist/image generation
