# ESCIE ARCHITECTURE

## Source-of-truth rule

ESCIE is file-based. Content, world definitions, records, configuration, and system contracts live in repository files. Runtime JavaScript is responsible for behavior and composition; it must not become the canonical storage location for editorial content.

## Layers

1. Public experience — index.html, style.css, app.js, navigation and UI modules.
2. Canonical content — data/*.js. These files define music, projects, people, places, moments, fragments, bodies, paths, investigation, archive, symbols, signals, games and related records.
3. Record composition / validation — data/registry.js and data/record-contract.js.
4. World definition — world/city-reference.js, world/world-simulation.js, NPC, law, vehicle, equipment, RPG and dialogue files.
5. 3D presentation — world/3d-reality.js. It renders the canonical world; it does not become a second database.
6. World interface — world/index.html, world/world.css, world/game-shell.css. The pause/map is the only 2D system interface.
7. Persistence — the world save/state layer. Saved player state is runtime state, not canonical editorial content.
8. External/reference data — documented source references remain identifiable in data/config files.

## Communication contract

Systems communicate through explicit APIs on window.ESCIE_* and named CustomEvents. A system should consume another system's public API instead of reaching into private variables.

- Canonical records → registry → public UI / investigation / archive / Glass Eye.
- Montreal reference → simulation → 3D city presentation.
- Simulation → NPC / law / vehicles / economy → RPG consequences.
- Player input → 3D interaction → world consequences → persistence.
- Pause/map → system panels only; gameplay remains 3D.

## File ownership

- data/: what exists and what it means.
- world/*.js: how the playable world behaves.
- world/3d-reality.js: how the world is rendered and physically interacted with.
- world/*.css: presentation only.
- world/index.html: shell and interface structure only.
- tests/: contracts and regression protection.

## Anti-duplication rules

- Do not create a second source of truth for a record, NPC, item, quest, relationship, location or world fact.
- Do not duplicate Montreal definitions in the renderer when the simulation/reference layer already owns them.
- Do not duplicate RPG progression in UI code.
- Do not put new editorial records directly inside rendering code.
- Do not reintroduce the removed Reality Filter.
- Do not turn gameplay into a 2D database interface.

## Change workflow

Preserve → identify owner file → update the source of truth → consume through its API → validate contracts → deploy.

When a new feature needs data, create/update a data/config file first, then make runtime consume it.

## Canonical game pipeline

File data → canonical simulation → NPC/life → law → RPG/economy → 3D presentation → player action → consequences → save state.

The game remains one layer of the same ESCIE reality, not a separate universe.
