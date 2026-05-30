export const DARKNESS_THEME = {
  colors: {
    background: 0x070510,
    panelFill: 0x110c1f,
    panelInner: 0x181128,
    border: 0x9a7340,
    borderDim: 0x5a3f22,
    accent: 0xa45dff,
    accentSoft: 0x5f2d8d,
    textPrimary: '#f2ddba',
    textSecondary: '#b9a2d4',
    textMuted: '#8570a2',
    glow: 0xc58bff,
    danger: 0xc94a67
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32
  },
  panel: {
    alpha: 0.96,
    radius: 10,
    borderWidth: 2,
    innerPadding: 8
  },
  button: {
    height: 50,
    borderWidth: 2,
    scaleHover: 1,
    scalePress: 0.95,
    transitionMs: 110,
    glowAlpha: 0.45,
    cornerRadius: 12,
    paddingX: 18,
    paddingY: 12
  }
};

export function addDarknessBackdrop(scene, width, height) {
  scene.add.rectangle(width / 2, height / 2, width, height, DARKNESS_THEME.colors.background);
  scene.add.rectangle(width / 2, height / 2, width, height, 0x140b26, 0.15);
}

export function createPanel(scene, {
  x, y, width, height,
  title,
  fill = DARKNESS_THEME.colors.panelFill,
  border = DARKNESS_THEME.colors.border,
  alpha = DARKNESS_THEME.panel.alpha,
  withInner = true,
  contentPadding = DARKNESS_THEME.spacing.md
}) {
  const root = scene.add.container(x, y);

  const panel = scene.add.rectangle(0, 0, width, height, fill, alpha)
    .setStrokeStyle(DARKNESS_THEME.panel.borderWidth, border, 0.92);
  root.add(panel);

  if (withInner) {
    const inner = scene.add.rectangle(0, 0, width - contentPadding, height - contentPadding, DARKNESS_THEME.colors.panelInner, 0.45)
      .setStrokeStyle(1, DARKNESS_THEME.colors.borderDim, 0.8);
    root.add(inner);
  }

  if (title) {
    root.add(scene.add.text(0, -(height / 2) + DARKNESS_THEME.spacing.md, title, {
      font: '16px monospace',
      fill: DARKNESS_THEME.colors.textPrimary
    }).setOrigin(0.5, 0));
  }

  return root;
}

export function createDarknessButton(scene, {
  x, y, width = 170, height = DARKNESS_THEME.button.height,
  label,
  onClick,
  enabled = true,
  accent = DARKNESS_THEME.colors.accent,
  fill = 0x1a1130,
  textColor = DARKNESS_THEME.colors.textPrimary,
  font = '14px monospace'
}) {
  const root = scene.add.container(x, y);
  root.setSize(width, height);

  const glow = scene.add.rectangle(0, 0, width + 10, height + 10, accent, DARKNESS_THEME.button.glowAlpha)
    .setAlpha(enabled ? 0.18 : 0)
    .setBlendMode(Phaser.BlendModes.ADD);

  const outer = scene.add.rectangle(0, 0, width, height, fill, enabled ? 1 : 0.55)
    .setStrokeStyle(DARKNESS_THEME.button.borderWidth, enabled ? DARKNESS_THEME.colors.border : DARKNESS_THEME.colors.borderDim, 1);

  const inner = scene.add.rectangle(0, 0, width - DARKNESS_THEME.button.paddingX, height - DARKNESS_THEME.button.paddingY, accent, 0.17)
    .setStrokeStyle(1, accent, enabled ? 0.5 : 0.2)
    .setAlpha(enabled ? 1 : 0.6);

  const text = scene.add.text(0, 0, label, { font, fill: textColor, align: 'center' }).setOrigin(0.5);
  text.setAlpha(enabled ? 1 : 0.6);

  root.add([glow, outer, inner, text]);

  if (!enabled) return { root, glow, outer, inner, text };

  root.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

  const tweenScale = (scale) => {
    scene.tweens.add({
      targets: root,
      scaleX: scale,
      scaleY: scale,
      duration: DARKNESS_THEME.button.transitionMs,
      ease: 'Quad.Out'
    });
  };

  root
    .on('pointerover', () => {
      glow.setAlpha(0.28);
      tweenScale(DARKNESS_THEME.button.scaleHover);
    })
    .on('pointerout', () => {
      glow.setAlpha(0.18);
      tweenScale(1);
    })
    .on('pointerdown', () => {
      glow.setAlpha(0.34);
      tweenScale(DARKNESS_THEME.button.scalePress);
    })
    .on('pointerup', () => {
      glow.setAlpha(0.28);
      tweenScale(1);
      if (onClick) onClick();
    });

  return { root, glow, outer, inner, text };
}
