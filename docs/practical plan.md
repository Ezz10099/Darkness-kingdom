# 🎯 ARCANE ACADEMY — PRACTICAL ASSET PRODUCTION PLAN

## ⚠️ Rule (don’t break this)

You do **one layer at a time**, not everything at once.

Order:
**UI → Heroes → Backgrounds → VFX → Animation → Integration polish**

---

# 🧱 PHASE 1 — UI FOUNDATION (DO THIS FIRST)

### Goal:

Make your game instantly look like a real product.

### What to create:

* Primary button (big CTA)
* Secondary button
* Panel/card (for menus)
* Top bar (currency display)
* Tab buttons (roster, campaign, etc.)

---

### 🎨 Tool setup (simple + mobile-friendly)

Use:

* Image generator (for base assets)
* Remove.bg or similar (if needed)
* Optional: Photopea (mobile Photoshop)

---

### 🔥 Prompt (use this EXACT structure)

Use variations of:

> “fantasy arcane mobile game UI button, glowing blue-purple magic theme, polished, high contrast, soft gradients, gold trim, clean shape, no text, transparent background”

Do this for:

* blue (main)
* red (danger)
* gold (premium)

---

### ✅ Output target

You should have:

* 3 button styles
* 1 panel
* 1 background frame

---

### ⚙️ Integration (Codex task)

Tell Codex:

* Load textures
* Create reusable button class
* Add press/hover scale (0.95 → 1.0)
* Add glow pulse animation

---

# 🧙 PHASE 2 — HERO VISUAL IDENTITY

### Goal:

Make heroes recognizable instantly.

---

### What to create:

* Portrait (MANDATORY)
* Optional: full body (later)

---

### 🔥 Prompt template

> “fantasy mage character portrait, arcane academy theme, [element: fire/ice/shadow], detailed face, glowing magic aura, soft lighting, mobile game style, clean background”

---

### ⚠️ Important consistency rules:

* Same camera angle (chest-up)
* Same lighting direction
* Same background blur
* Same color grading

---

### ✅ Output target

* 5–10 heroes only (don’t overproduce yet)

---

### ⚙️ Integration

* Square crop (512x512 or 1024x1024)
* Use in:

  * roster
  * battle UI
  * summon screen

---

# 🌄 PHASE 3 — BACKGROUND SYSTEM

### Goal:

Make battles feel like different places (cheap but powerful)

---

### What to create:

* Academy hall
* Arcane forest
* Ruins
* Boss arena

---

### 🔥 Prompt

> “fantasy magical academy hall interior, glowing runes, soft lighting, depth, mobile game background, slightly blurred, no characters”

---

### ⚠️ Trick (important)

Use:

* slight blur
* low detail foreground

So characters stand out.

---

### ⚙️ Integration

* Static image (start simple)
* Later:

  * parallax (2 layers max)

---

# 💥 PHASE 4 — COMBAT VFX (HIGH IMPACT)

### Goal:

Make combat feel powerful without complex animation

---

### What to create:

* Hit flash
* Crit effect
* Heal glow
* Ultimate burst

---

### 🔥 Prompt

> “magical explosion effect, blue arcane energy, glowing particles, transparent background, game VFX”

---

### ⚠️ Implementation trick

Don’t overcomplicate:

* Use sprite + scale + fade
* Add screen shake

---

### ⚙️ Codex tasks:

* Add:

  * screen shake (5–10px)
  * hit flash (white overlay)
  * damage number pop

---

# 🎬 PHASE 5 — ANIMATION (MINIMAL BUT SMART)

### Goal:

Fake animation cheaply

---

### Do NOT try:

* full skeletal animation (too heavy for you)

---

### Do THIS:

* Idle = slight scale + float
* Attack = quick forward + snap back
* Hit = small shake + tint red
* Ultimate = VFX + zoom

---

### ⚙️ Codex tasks:

* Tween system:

  * scale
  * position
  * alpha

---

# 🧠 PHASE 6 — POLISH (THIS IS WHAT MAKES IT “AAA”)

### Add:

* Button click sound feel (visual feedback)
* Smooth transitions between scenes
* Consistent spacing
* Consistent colors

---

# 📅 DAILY WORK PLAN (VERY IMPORTANT)

### Day 1–2:

UI buttons + panels + integrate

### Day 3–4:

Hero portraits (5–10) + integrate

### Day 5:

Battle backgrounds

### Day 6:

VFX (hit, crit, heal)

### Day 7:

Animation polish + feedback

---

# 🚨 REALITY CHECK

What makes you competitive is NOT:

* more systems ❌
* more modes ❌

It is:

* visual clarity ✔
* feedback ✔
* polish ✔
* consistency ✔

---

