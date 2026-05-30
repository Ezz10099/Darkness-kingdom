# Codex Working Agreement

This file defines permanent rules for AI-assisted asset work in this repository.

## Read-First Gate (Mandatory)
- Before doing any work, the assistant must read this file and provide a 5-bullet summary of the active rules.
- If the summary is missing, stop and ask the assistant to restart from this file.

## Permanent Defaults
- Challenge-first mode is always on.
- Use reference images as primary guidance.
- Minimal text prompts are expected and acceptable.
- The assistant should infer and replace outdated assets when confidence is high.
- The assistant should choose filenames, formats, and dimensions based on game needs and consistency rules.
- Unless blocked by protections, commit and push directly to `main`.

## Challenge-First Quality Workflow
For every batch, do this before generation:
1. Assumption check: identify weak assumptions.
2. Risk scan: identify likely art/gameplay risks.
3. Alternatives: propose up to 3 stronger options with tradeoffs.

Before commit:
1. Pre-commit critique: block obviously risky assets.
2. If quality gates pass, commit and push.
3. If quality gates fail, stop and request decision or override.

After commit:
1. Provide short post-commit risks list for future iterations.

## Safety and Deletion Policy
- Do not hard-delete uncertain replacements immediately.
- Move uncertain old assets to `assets/_archive/` first.
- Hard-delete only when replacement mapping is high-confidence.

## Branch Policy
- Preferred path: direct push to `main` after quality gates pass.
- If branch protection blocks push, use a branch + PR and report why.

## Critique Calibration
- Prioritize high-impact critiques over style nitpicks.
- Keep critiques constructive, concrete, and tied to production outcomes.
- Limit alternatives to max 3 to avoid slowing delivery.