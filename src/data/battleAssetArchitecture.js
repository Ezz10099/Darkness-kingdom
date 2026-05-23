export const BATTLE_ASSET_FOLDERS = Object.freeze({
  backgrounds: 'assets/campaign/backgrounds/',
  buttons: 'assets/ui/battle/buttons/',
  cards: 'assets/ui/battle/cards/',
  icons: 'assets/ui/battle/icons/',
  frames: 'assets/ui/battle/frames/',
  effects: 'assets/ui/battle/effects/'
});

export const BATTLE_BACKGROUND_KEYS = Object.freeze({
  chapter1: 'campaignBgChapter1',
  chapter2: 'campaignBgChapter2',
  chapter3: 'campaignBgChapter3',
  chapter4: 'campaignBgChapter4',
  chapter5: 'campaignBgChapter5'
});

export const BATTLE_UI_ASSET_PLAN = Object.freeze({
  buttons: [
    'btn_battle_primary_idle.png',
    'btn_battle_primary_pressed.png',
    'btn_battle_primary_disabled.png',
    'btn_circle_idle.png',
    'btn_circle_active.png',
    'btn_circle_pressed.png'
  ],
  cards: [
    'battle_card_frame_idle.png',
    'battle_card_frame_selected.png',
    'battle_card_frame_ready_glow.png',
    'battle_card_charge_bg.png',
    'battle_card_charge_fill.png'
  ],
  icons: [
    'icon_pause.png',
    'icon_settings.png'
  ],
  frames: [
    'battle_top_title_plate.png',
    'battle_vs_ornament.png'
  ],
  effects: [
    'ult_ready_glow.png',
    'card_hover_glow.png',
    'button_glow_soft.png'
  ]
});

export const BATTLE_ASSET_RULES = Object.freeze([
  'Battle backgrounds must stay clean: no buttons, hero cards, top bar, or baked text.',
  'Hero placement circles may stay inside the background for now; separate them later only if flexibility is needed.',
  'Important text must be rendered in Phaser code, not baked into generated images.',
  'Use transparent PNG for UI shells, card frames, icons, glows, and overlays.',
  'Register real asset files in assetManifest.js only after the PNG exists in the repo.'
]);

export default {
  BATTLE_ASSET_FOLDERS,
  BATTLE_BACKGROUND_KEYS,
  BATTLE_UI_ASSET_PLAN,
  BATTLE_ASSET_RULES
};
