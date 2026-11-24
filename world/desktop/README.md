# ESCIE World — Downloadable Game

This directory is the first desktop packaging layer for the existing ESCIE World prototype.

## Boundary

The public ESCIE site remains the doorway. The game remains a separate full-screen application.

The desktop build does **not** embed the public site. It packages the existing `world/` game surface as a standalone application and keeps the canonical game systems in the web game source.

## Current source of truth

The downloadable shell reuses the existing game architecture:

- `world/index.html` — game entry
- `world/world.js` — world/game orchestration
- `world/world-simulation.js` — simulation source of truth
- `world/3d-reality.js` — 3D presentation layer
- `world/npc-system.js` / `npc-life-system.js` — NPC systems
- `world/law-system.js` — law/wanted/arrest systems
- `world/rpg-system.js` — RPG systems
- `world/investigation-system.js` — investigation systems
- `world/interior-system.js` — interiors
- `world/vehicle-system.js` — vehicles
- `world/equipment.js` — equipment/items
- `world/manifest.webmanifest` + `world/sw.js` — existing offline/PWA foundations

## Packaging direction

**Desktop first:** Electron + electron-builder.

This is intentionally a packaging layer, not a rewrite of the game. It gives ESCIE World a real downloadable desktop identity while preserving the existing browser prototype and its canonical systems.

Initial targets:

- Windows
- macOS
- Linux

Later platform work can be added without changing the public-site boundary.

## Runtime rules

1. Launch directly into ESCIE World.
2. Open fullscreen.
3. Keep Node integration disabled.
4. Keep context isolation enabled.
5. Do not expose arbitrary filesystem or shell APIs to the game.
6. External web links leave the game through the system browser.
7. Game state remains owned by the game systems, not by the public site.
8. The public site only provides the doorway into the game.

## Next packaging phases

### 0. Desktop shell — current
- Native window shell
- Fullscreen launch
- Secure preload boundary
- Existing game loaded as the application body

### 1. Desktop development loop
- Install dependencies
- Run the game locally as an application
- Validate keyboard, mouse, controller, audio, save state, fullscreen, and 3D rendering

### 2. Release packaging
- Windows installer
- macOS application
- Linux package
- Versioned release artifacts

### 3. Native game services
- native save location
- crash/error reporting
- update channel
- platform-specific controller handling
- optional achievements/cloud services

### 4. Long-term game production
The downloadable build can eventually become the production client while the canonical simulation/data contracts remain independent of presentation technology.

## Important

The desktop app is **not** a replacement for the ESCIE public World.

It is the playable layer of the same ecosystem:

**PUBLIC WORLD → doorway → ESCIE WORLD → deeper playable experience**


### Runtime hardening

The desktop package stages the game into `world/desktop/app/` and bundles the exact Three.js 0.160.0 browser runtime into `app/vendor/three.min.js`. This keeps the packaged game independent of an internet connection for its core 3D renderer. The public/PWA version continues to use the same pinned Three.js version from jsDelivr.

### Mobile-first input

The game remains full-screen and 3D-first on phones. Touch players get explicit movement and action controls with safe-area support, while the existing swipe-to-move/look gesture remains available. Keyboard and gamepad input remain first-class inputs.
