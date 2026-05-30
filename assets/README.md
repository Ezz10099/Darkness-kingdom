# Asset Standards

## Naming
- Use lowercase kebab-case filenames.
- Prefix by category where useful: `ui-`, `icon-`, `tile-`, `char-`, `bg-`, `fx-`.
- Use numbered variants only when needed: `-v2`, `-alt1`.

## Formats
- Use `.png` for transparency or pixel-critical UI.
- Use `.webp` for opaque large art where size matters.
- Use `.jpg` only for photo-like opaque art when artifacts are acceptable.

## Dimensions
- Keep power-of-two or engine-friendly sizes where practical: 512, 1024, 2048.
- Preserve consistent aspect ratio within each asset family.

## Replacement Workflow
- When replacing old assets, map old -> new in commit notes.
- If uncertain, move old files to `assets/_archive/` first.
- Hard-delete only after confidence is high.

## Quality Gates
- Readability at gameplay zoom.
- Clear silhouettes.
- Contrast and color separation.
- Consistency with established style in batch.