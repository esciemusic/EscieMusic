# THE WORLD — FILE MAP

The world/ directory is the playable ESCIE layer. It is a separate full-screen experience reached from the public ESCIE site.

## Entry / presentation

- index.html — game shell, entry gate, HUD, touch controller, pause/map structure.
- world.css — world UI and mobile controller presentation.
- game-shell.css — full-screen shell and boot presentation.
- manifest.webmanifest — installable web-app metadata.
- sw.js — service-worker/offline shell behavior.

## World definition / simulation

- `../data/world-city.js` — canonical authored city graph, districts, transit, landmarks, buildings, interiors and travel connections.
- city-reference.js — Montréal reference layer and district texture derived from documented real-world sources.
- world-simulation.js — canonical player/world state and simulation behavior; consumes city data rather than owning authored city definitions.
- npc-system.js — canonical NPC state and interactions.
- npc-identity-system.js — NPC identity.
- npc-life-system.js — NPC routines/life state.
- npc-dialogue-system.js — dialogue behavior.
- language-system.js — language handling.
- law-system.js — wanted/law/arrest consequences.
- vehicle-system.js — vehicles and vehicle state.
- equipment.js — equipment registry/state.
- rpg-system.js — class, XP, skills, perks and progression.
- interior-system.js — 3D interior lifecycle.
- dream-play.js — dream/playable memory layer.

## Runtime orchestration

- world.js — world application coordinator and system UI/persistence boundary.
- 3d-reality.js — Three.js presentation, player movement, camera, combat, traffic, encounters and physical 3D interactions.

## Hard rule

The 3D renderer consumes world state. It is not a second database. The pause/map is the only 2D system interface. Mobile touch controls and hardware controllers are input devices, not alternate world representations.
