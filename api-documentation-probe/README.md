# API Documentation Probe

This development-only mod captures real Sandkit API v1 output shapes so the API Explorer can use verified examples instead of guesses.

## How to run it

1. Copy the entire `api-documentation-probe` folder into Sandustry's mods folder.
2. Enable **API Documentation Probe** and load the save.
3. The probe waits one minute so the world and mouse input can initialize.
4. At 50 seconds, a warning toast tells you the capture will happen in 10 seconds.
5. During that warning, place and hold the mouse over a useful occupied cell—ideally an element, terrain tile, or placed structure.
6. A capture toast reports the exact sampled cell, followed by the **API documentation probe finished** toast.
7. Return to the Codex conversation and say **the probe finished**.

The probe attempts to write marked report chunks to the developer console. Renderer console output is not persisted in every Sandustry build, so the extractor also reads the authoritative `latest-report` backup from Chromium local storage automatically.

You do not need to open the developer console or manually copy JSON.

The included `extract-report.js` utility reconstructs the newest completed run into the workspace’s private research folder; Codex will run this after the game test.

## Safety

The automatic pass only calls read-only queries, formatters, geometry helpers, and local inspection callbacks. It does not call APIs that create, remove, move, damage, unlock, consume, start maps, change settings, play sounds, or otherwise intentionally mutate gameplay.

Some API outputs require valid content-specific inputs or an actual side effect. Those should be tested later as explicit, opt-in scenarios rather than during this automatic pass.

## What the snapshot records

- Primitive return values
- Constructor/type names
- Own data properties without invoking getters
- Getter/setter names
- Prototype method names
- Small samples from arrays, sets, maps, and typed arrays
- Circular references and truncation boundaries
- Errors from unavailable APIs
- Main-thread and worker-thread context

Do not publish this probe as a normal gameplay mod. It is intentionally diagnostic and may expose internal runtime details in its report.
