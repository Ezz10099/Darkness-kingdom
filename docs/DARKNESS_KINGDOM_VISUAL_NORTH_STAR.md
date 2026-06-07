# Darkness Kingdom — Visual North Star

## Purpose

This document defines the long-term visual direction for Darkness Kingdom.

It is not a static task checklist. It is a design judgment guide for AI-assisted work across multiple sessions.

When working on UI, layout, screen structure, assets, or visual polish, apply this direction unless the owner explicitly updates it.

## Core Visual Goal

Darkness Kingdom should feel like a premium mobile idle RPG / hero collector.

Use AFK Arena only as broad layout inspiration: polished mobile RPG screen hierarchy, clear central gameplay focus, top resource bar, bottom navigation, side shortcuts, compact action panels, and collectible hero presentation.

Do not copy AFK Arena art, icons, exact layouts, colors, names, characters, compositions, or proprietary visual identity.

The goal is not to recreate AFK Arena. The goal is to make Darkness Kingdom feel like a real premium idle RPG with its own dark gothic kingdom identity.

## Core Principle

Every major screen should feel like a polished mobile game screen, not a webpage, report, spreadsheet, prototype dashboard, or long scrollable document.

The player should immediately understand the screen's main purpose from visual hierarchy alone.

## Screen Identity Rules

Each major screen must have one dominant visual focus:

- Main Hub: the fallen dark kingdom rebuilding under purple moonlight.
- Campaign: a chapter map / world map with visible stage nodes and progression path.
- Heroes / Roster: hero cards, collection, rarity, power, faction, and upgrade state.
- Summon: portal, altar, ritual, or abyssal summoning centerpiece.
- Gear: forge, equipment cards, enhancement flow.
- Guild: royal hall, banners, guild actions, cooperative identity.
- Arena: opponent cards, rank, combat readiness, rewards.
- Towers: vertical progression, faction/affinity identity, floor milestones.
- World Boss: boss presence first, damage/reward panel second.
- Shop: premium offer cards and resource exchange clarity without clutter.

If a screen does not have a strong visual focus, improve that before adding more details.

## Mobile RPG Shell

Most core screens should share a consistent mobile RPG shell:

- Fixed top profile/resource bar.
- Central visual gameplay area.
- Compact side shortcuts when useful.
- Clear primary call-to-action button.
- Fixed bottom navigation or clear return path.
- Notification badges for important actions.
- Compact reward/currency chips instead of large repeated text sections.

Use this shell flexibly. Do not force it where it harms the screen, but default to it for main gameplay screens.

## Campaign Direction

Campaign must be map-first.

The campaign screen should not feel like a scrollable report, quest log, or region dashboard.

Required campaign feeling:

- The chapter map is the main visible object.
- Stage nodes sit directly on the map.
- A winding path shows progression.
- The selected stage updates a compact bottom panel.
- The bottom panel shows stage name, difficulty, recommended power, rewards, Squad, and Start.
- Region/chapter tabs should be compact.
- Idle rewards, caches, unlock notes, and quest messages should be secondary compact UI, not dominant full-width sections.
- Avoid long vertical scrolling unless it is clearly necessary.

The first chapter should feel like the road back to the Fallen Crown.

## Visual Hierarchy Rules

Prioritize the screen's main gameplay object over secondary information.

Prefer:

- Large map or kingdom scene.
- Compact panels.
- Short labels.
- Reward chips.
- Icons and badges.
- Clear action buttons.

Avoid:

- Huge blocks of explanatory text.
- Many stacked cards competing for attention.
- Long scroll pages for core gameplay screens.
- Developer-dashboard style layouts.
- Placeholder rectangles when a reusable styled component exists.

## Darkness Kingdom Visual Identity

Use the locked project identity:

- Black depth.
- Royal purple magic.
- Antique gold trim.
- Crimson danger / event accents.
- Dark carved stone.
- Gothic panels.
- Ornate borders.
- Abyss crystals.
- Ruined throne architecture.
- Fallen crowns, relics, banners, bloodlines, curses, and ancient kingdoms.

The UI should feel expensive, deep, royal, ancient, dangerous, and collectible.

Do not use academy, school, classroom, student, lesson, headmaster, or training-yard identity unless the owner explicitly asks.

## Reusable Cocos UI Direction

Prefer reusable Cocos Creator UI prefabs/components over one-off screen-specific objects.

Build and reuse components such as:

- TopResourceBar.
- BottomNavBar.
- SideShortcutButton.
- OrnatePanel.
- PrimaryButton.
- SecondaryButton.
- NotificationBadge.
- RewardChip.
- HeroCard.
- StageNode.
- ChapterMapPanel.
- ModalOverlay.

Use Cocos UI concepts such as anchors, safe areas, 9-sliced sprites, layouts, reusable prefabs, and components where appropriate.

Do not manually redesign every screen separately if a reusable component can solve the problem.

## Functionality Protection

Visual improvement must not break gameplay.

Preserve existing:

- Save data.
- Player progression.
- Campaign unlocks.
- Stage rewards.
- Navigation.
- Buttons.
- Scene transitions.
- Currency systems.
- Hero data.
- Existing tested behavior.

When layout changes are risky, preserve logic first and make the smallest visual improvement that moves toward this north star.

## Asset Policy

Do not hard-delete uncertain assets.

If replacing an asset and the old asset might still be useful, move it to an archive location first.

Prefer reusable layered assets:

- UI frames.
- Panel frames.
- Button states.
- Icon frames.
- Reward chips.
- Stage nodes.
- Map overlays.
- Hero card frames.
- Background layers.

Avoid random full-screen clutter or unstructured decorative images.

## AI Working Behavior

For visual/UI work, the assistant should:

1. Read AGENTS.md, README.md, design docs, and this visual north star first.
2. Briefly explain the intended screen transformation before editing.
3. Challenge weak assumptions and identify high-impact risks.
4. Make judgment calls that move the project toward this direction.
5. Avoid waiting for exact pixel instructions unless the change is risky.
6. Keep changes small and testable.
7. Work on one screen or one subsystem per batch.
8. Preserve functionality unless the task explicitly changes it.
9. After work, report changed files, preserved behavior, visual improvements, and remaining risks.

## Priority Order

Default visual priority:

1. Reusable UI kit foundation.
2. Main Hub premium shell and kingdom scene.
3. Campaign map-first redesign.
4. Heroes / Roster card-grid polish.
5. Summon portal/altar redesign.
6. Guild, Arena, Towers, World Boss, Gear, Shop polish.

The owner may override the current priority for a specific session.

## Summary

Darkness Kingdom should become a premium dark gothic idle RPG interface.

Use AFK Arena only as broad layout inspiration, never as something to copy.

Make every screen visually clear, mobile-first, reusable, compact, and gameplay-focused.

When in doubt: reduce report-like scrolling, strengthen the main visual focus, preserve functionality, and move toward a polished mobile RPG experience.