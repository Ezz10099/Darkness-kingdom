# Battle Asset Architecture

Phase 1 locks the battle scene as a layered Phaser composition, not a single full-screen image with UI baked in.

## Folder structure

```text
assets/
  campaign/backgrounds/
  ui/battle/buttons/
  ui/battle/cards/
  ui/battle/icons/
  ui/battle/frames/
  ui/battle/effects/
```

## Separate asset layers

### 1. Battle backgrounds

Use clean chapter backgrounds for chapters 1-5.

Background rules:

- no buttons
- no hero cards
- no top bar
- no baked stage text
- no baked UI labels

The current chapter background keys are already registered in `src/data/assetManifest.js`:

- `campaignBgChapter1`
- `campaignBgChapter2`
- `campaignBgChapter3`
- `campaignBgChapter4`
- `campaignBgChapter5`

### 2. Hero placement circles

Hero placement circles can stay inside the background for now.

Later, if the battle layout needs more flexibility, move them into transparent overlay assets.

### 3. Battle UI assets

Recommended first asset batch:

- `assets/ui/battle/cards/battle_card_frame_idle.png`
- `assets/ui/battle/cards/battle_card_frame_ready_glow.png`
- `assets/ui/battle/buttons/btn_battle_primary_idle.png`
- `assets/ui/battle/buttons/btn_battle_primary_pressed.png`
- `assets/ui/battle/buttons/btn_circle_idle.png`
- `assets/ui/battle/buttons/btn_circle_active.png`

Then add:

- card charge bar background/fill
- optional top title plate
- optional VS ornament
- small icons such as pause/settings

## Text rule

Do not bake important text into generated images.

Better workflow:

- generate empty frame/button art
- render labels in Phaser code

Examples:

- Generate an empty primary battle button, then render `Begin Battle` in code.
- Generate an empty hero card frame, then render hero name and ultimate percentage in code.
- Generate an empty circular button shell, then render `Pause`, `x2`, `Auto`, or an icon in code.

Reason: generated image text is often blurry, inconsistent, and hard to localize or edit. Phaser text stays clean, dynamic, and reusable.

## Manifest rule

Only add an image to `src/data/assetManifest.js` after the real PNG exists in the repo.

Do not preload planned assets before the file exists, because missing images can create Phaser loader errors.
