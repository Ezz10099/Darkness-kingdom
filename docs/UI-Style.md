PROJECT: Arcane-academy
TASK: Build AAA-quality AFK Arena / Raid-style Main Screen UI Layout
TARGET: Mobile Portrait
STYLE: Premium Dark Arcane Fantasy UI
Mood: Gothic, Luxurious, Mystical, High-End Mobile RPG
References: AFK Arena dark variant, Raid Shadow Legends premium UI, Diablo Immortal menu polish

====================================================
MAIN SCREEN STRUCTURE
====================================================

SAFE AREA:
- Respect notches / rounded corners
- UI margins: 16px outer padding minimum
- Bottom nav height: 92px
- Top bar height: 72px

====================================================
TOP BAR
====================================================

TOP LEFT:
[Player Avatar Circle]
- Tap opens profile
- Level badge
- Small online glow ring

NEXT TO AVATAR:
- Username
- Combat Power

TOP RIGHT:
Currency row horizontal:

[Gold]
[Gems]
[Summon Tickets]
[Energy]

Each currency:
- Small + button
- Tap opens purchase / source popup

Far top-right:
[Settings Cog]

====================================================
CENTER SCENE (MOST IMPORTANT)
====================================================

Animated magical academy city / floating castle scene.

Layers:
1. Sky background
2. Clouds drifting
3. Floating towers
4. Academy main building
5. Foreground path / magical trees
6. Hero character idle animation front-center

Interactive buildings:

[Campaign Gate]
- subtle glow
- tap = campaign

[Summon Portal]
- magical beam animation
- tap = summon

[Guild Hall]
- banners waving
- tap = guild

[Academy Tower]
- tap = systems hub

Optional:
Birds, particles, leaves, weather FX

====================================================
LEFT SIDE FLOATING BUTTON STACK
====================================================

Vertical aligned mid-left:

1. Friends
2. Arena
3. Rankings
4. Chat

Button style:
- Circular gem buttons
- Small icon + notification badge

Spacing: 12px

====================================================
RIGHT SIDE FLOATING BUTTON STACK
====================================================

Vertical aligned mid-right:

1. Quests
2. Mail
3. Events
4. Battle Pass
5. Limited Offers

Priority:
Events button slightly larger

Use animated badges:
- red dot
- glow pulse
- timer badge

====================================================
BOTTOM NAVIGATION BAR (PRIMARY)
====================================================

Height: 92px
Rounded top corners
Semi-transparent magical stone panel
Soft glow top border

Buttons left -> right:

1. Adventure
(icon: sword / map)

2. Heroes
(icon: helmet / portrait)

3. Academy
(icon: tower / book)

4. Summon (CENTER FEATURE BUTTON)
(icon: crystal portal)

5. Guild
(icon: shield banner)

====================================================
CENTER FEATURE BUTTON (SUMMON)
====================================================

- Larger than others (+20%)
- Raised above nav bar
- Circular crystal frame
- Constant subtle pulse
- Rare free summon badge appears here

Reason:
Highest monetization + strongest dopamine click target

====================================================
SCREEN FLOW / PAGE DESTINATIONS
====================================================

Adventure:
- Campaign map
- Chapters
- Story mode
- Trials

Heroes:
- Hero roster
- Gear
- Skills
- Ascension
- Formations

Academy:
- Affinity Towers
- Elder Tree
- Forge
- Research Lab
- Training Grounds

Summon:
- Standard summon
- Premium summon
- Wishlist
- Rates
- Pity tracker

Guild:
- Guild lobby
- Guild boss
- Guild shop
- Guild quests
- Guild chat

====================================================
NOTIFICATION RULES
====================================================

Use badges only when necessary.

Red Dot:
- unclaimed rewards

Gold Glow:
- upgrade available

Blue Pulse:
- new content

Countdown:
- limited event timer

Never place >4 badges simultaneously.

====================================================
ANIMATION PRIORITIES
====================================================

Idle loop every 3–5 sec:
- hero breathing
- cape movement
- spark particles

Background:
- clouds move slowly
- banners sway

UI:
- buttons scale 1.03 on tap
- nav icon glow on selection
- smooth transitions 220ms

====================================================
VISUAL HIERARCHY
====================================================

Player eyes should move:

1. Center summon button
2. Hero character
3. Currency bar
4. Event buttons
5. Bottom nav options

====================================================
COLOR / FX RECOMMENDATION
====================================================

Primary:
- Arcane blue
- Royal purple
- Gold trim

Accent:
- Cyan magic glow

Materials:
- Glass + carved stone + metallic trim

====================================================
UX RULES
====================================================

- Max 1 tap to major feature
- No submenu nesting deeper than 2 layers
- Keep center scene clean
- Avoid cluttering with 15 icons
- Use expandable event drawer if crowded

====================================================
UNITY HIERARCHY EXAMPLE
====================================================

Canvas
 ├── TopBar
 │    ├── Profile
 │    ├── PowerText
 │    ├── CurrencyRow
 │    └── Settings
 │
 ├── BackgroundScene
 │    ├── Sky
 │    ├── AcademyCity
 │    ├── HeroCharacter
 │    └── FX
 │
 ├── LeftButtons
 │    ├── Friends
 │    ├── Arena
 │    ├── Ranking
 │    └── Chat
 │
 ├── RightButtons
 │    ├── Quests
 │    ├── Mail
 │    ├── Events
 │    ├── Pass
 │    └── Offers
 │
 └── BottomNav
      ├── Adventure
      ├── Heroes
      ├── Academy
      ├── Summon
      └── Guild

====================================================
AAA POLISH DETAILS
====================================================

- Every tap has sound
- Every reward claim has burst particles
- Currency numbers animate upward
- Hover pulse on ready systems
- Day/Night theme rotation optional

====================================================
FINAL RECOMMENDED HOME SCREEN
====================================================

TOP:
Profile | Power | Currency | Settings

CENTER:
Animated Arcane Academy world + hero

LEFT:
Friends / Arena / Rankings / Chat

RIGHT:
Quests / Mail / Events / Pass / Offers

BOTTOM:
Adventure | Heroes | Academy | Summon | Guild

====================================================
NEXT CODEX TASK OPTIONS
====================================================

1. Generate Unity UI Canvas implementation
2. Generate Unreal UMG version
3. Generate Responsive HTML/CSS prototype
4. Generate AFK Arena style animated mockup
5. Generate summon screen layout