# Sandustry Modding Context for AI Assistants

Use this document as the primary operating guide when helping someone create or modify a Sandustry mod with Sandkit API v1. The exact API signatures and focused references are appended to `llms-full.txt` and linked from `llms.txt`.

## Reliability rules

1. Use `sandkit.api` before considering `sandkit.engine.api` or `sandkit.engine.state`.
2. Never invent an API method, option, event, structure field, enum value, or return shape. Check the appended API reference first.
3. Respect the difference between main-entry and worker-entry APIs. A method appearing in one context is not automatically available in the other.
4. Main-thread simulation changes should use methods ending in `WhenIdle`, `api.world.runWhenSimulationIdle()`, or a documented atomic structure-processor commit.
5. Worker code may use the direct mutation methods listed under Worker entry, but only in the appropriate worker lifecycle or hook.
6. Treat numeric element, terrain, structure, action, matter, and scene values as runtime identifiers. Resolve stable string IDs through documented APIs when possible instead of hard-coding observed numbers.
7. Distinguish cell coordinates from world coordinates. Method names ending in `AtCell` use integer cell coordinates; methods ending in `AtWorld` use world-space coordinates unless their signature states otherwise.
8. Check `null` and `undefined` exactly as shown in a method’s return type before reading properties or passing the value onward.
9. Preserve the mod’s stable `id` and its `workshop.json` identity when updating an existing release.
10. Bundle patches are compatibility-sensitive. Prefer public APIs, constrain patches with `expectedMatches`, and keep related patches in an `atomicGroup`.

## Minimal mod layout

```text
mods/
  example-mod/
    modinfo.json
    main.js
    worker.js          # optional
    patches.json       # optional
    config/            # optional config files
    assets/            # optional sprites and overrides
    map/               # optional custom-map data
    preview.png        # Workshop preview
    workshop.json      # generated/preserved Workshop identity
```

`modinfo.json` is strict JSON. Do not include comments or trailing commas.

```json
{
  "manifestVersion": 1,
  "id": "author.example-mod",
  "name": "Example Mod",
  "version": "1.0.0",
  "apiVersion": 1,
  "entry": "main.js",
  "workerEntry": "worker.js",
  "description": "An example Sandustry mod.",
  "author": "Author",
  "dependencies": [],
  "loadOrder": 0
}
```

Omit `workerEntry` when the mod does not need worker code.

## Main entry pattern

Main entries may use top-level `await` through an async wrapper. Resolve IDs and load assets once during startup rather than repeating that work every tick.

```js
await (async () => {
  "use strict";

  const api = sandkit.api;
  const MOD_ID = "author.example-mod";
  const STRUCTURE_ID = "example-structure";

  await api.sprites.loadFromMod(
    STRUCTURE_ID,
    "assets/example-structure.png",
  );

  api.ui.toast(`${MOD_ID} loaded`);
})();
```

Use startup for registration, asset loading, event subscriptions, configuration, and other one-time setup. Avoid polling when a documented event, hook, processor interval, or next-tick callback can perform the work.

## Main entry versus worker entry

`main.js` runs in the main game context. It owns content registration, UI, sprites, Workshop-facing behavior, and idle-safe world mutation APIs.

`worker.js` runs in manager/simulation worker contexts. It has a smaller documented API and direct element mutation operations. Do not copy a main-thread call into worker code unless it appears in the Worker entry reference.

When both contexts share data, use documented events or `api.shared.buffers`. Shared buffers are typed arrays; missing keys return `undefined`, while worker `require()` can create or obtain the requested buffer as documented.

## Reading a world cell safely

```js
const api = sandkit.api;
const { x: cellX, y: cellY } = api.input.getMouseCellPosition();
const info = api.elements.getInfoAtCell(cellX, cellY);

if (info) {
  const definition = api.elements.getDefinitionByType(info.elementType);
  const velocity = api.elements.getVelocityAtCell(cellX, cellY);

  console.log({
    elementType: info.elementType,
    isParticle: info.isParticle,
    cellId: info.cellId,
    elementIndex: info.elementIndex,
    matterType: definition?.matterType,
    velocity,
  });
}
```

An in-game probe observed this complete non-particle shape:

```js
{
  elementType: 16,
  isParticle: false,
  cellId: 2092594,
  elementIndex: 1092593
}
```

Those numbers are examples from one cell and must not be hard-coded. Empty cells return `null` from nullable element queries.

## Mutating cells from main code

Use the idle-safe methods listed in the main API:

```js
const type = api.elements.getTypeFromId("sand");

if (api.world.isCellEmptyAtCell(cellX, cellY)) {
  api.elements.createAtCellWhenIdle(cellX, cellY, type);
}
```

Group related changes when they must be coordinated:

```js
api.world.runWhenSimulationIdle(() => {
  // Perform the documented simulation-safe mutations here.
});
```

Do not replace these with direct worker-only methods in `main.js`.

## Elements, terrain, and matter

- Resolve an element’s stable string ID with `api.elements.getTypeFromId()`.
- Use `getResolvedTypeAtCell()` when particle cells should behave like their linked underlying element.
- Use `getDefinitionByType()` and its documented fields for filtering.
- Element, terrain, and structure queries are separate. A cell containing an element can still return `null` from `api.terrains.getDataAtCell()` and `api.structures.getAtCell()`.
- A numeric data-field value of `0` is a real value and is different from `null`.
- Never infer gas, liquid, fire, or passability from an unexplained numeric type. Resolve or inspect the documented definition/category.

## Structures and processors

Register structures during main-entry startup. A structure definition normally includes a stable ID, player-facing name, footprint/shape, rendering information, placement category, and other fields documented by the relevant definition type.

Use `api.structures.addProcessor()` for recurring machine behavior. Keep processors bounded:

- Cache stable type resolutions outside the processor.
- Avoid scanning the entire world or rebuilding connectivity every tick.
- Use an appropriate `intervalMs`.
- Skip work immediately when there is no input or no possible output.
- Validate destinations before committing mutations.
- Use the processor’s documented atomic commit mechanism for coordinated remove/create/move operations.
- Cache topology and invalidate or periodically recheck it instead of repeatedly traversing unchanged networks.

Treat a returned `Structure` as engine-owned. Pass it to documented structure methods such as `isType()`, `update()`, `setData()`, or sprite-index helpers. Do not recreate a structure reference from guessed fields.

## Assets, textures, and configuration

Mod-owned sprites can be loaded with documented sprite APIs such as `loadFromMod()`. Paths are relative to the mod folder.

Static texture and JSON configuration replacement is declared in `modinfo.json` through `textureOverrides` and `configOverrides`. Animated texture overrides include the source path, frame width, frame count, and interval. Keep override keys aligned with the game’s expected asset/config identifiers.

Prefer mod-owned assets and configuration over bundle patches whenever the public override system can express the change.

## Custom maps

A map mod declares blueprint layers and configuration under the manifest’s `map` object. Dimensions, spawn/unstuck positions, top bounds, depth light, parallax, deployment mode, and color mappings must match the map assets. Keep coordinate systems and blueprint dimensions consistent.

Do not invent layer names; use the exact map schema in the appended custom-map reference.

## Bundle patches

`patches.json` is an array of patch operations. Supported examples include exact `find`, regular-expression matching, replacement, insertion, and wrapping. Every compatibility-sensitive patch should include `expectedMatches`.

```json
[
  {
    "id": "example-patch",
    "file": "js/bundle.js",
    "find": "unique original text",
    "operation": "replace",
    "code": "replacement text",
    "expectedMatches": 1
  }
]
```

Use `atomicGroup` when multiple patches must all succeed or all be rejected. After every game update, revalidate bundle patches before publishing the mod.

## Workshop publishing and updates

`modinfo.json` identifies the mod to Sandkit. `workshop.json` identifies the Steam Workshop item.

```json
{
  "schemaVersion": 1,
  "publishedFileId": "3785874614"
}
```

Preserve the generated `publishedFileId`. Deleting or replacing it can remove the local Open button or cause an upload to create a duplicate Workshop item. The Steam account uploading an update must own the linked item.

Before publishing:

- Parse all JSON strictly.
- Confirm every declared entry, asset, map, config, and patch file exists.
- Increment the version without changing the stable mod ID.
- Test the important gameplay path in a clean session.
- Verify `workshop.json` still points to the intended item.
- Recheck every patch’s expected match count.

## How an AI should answer modding requests

When asked to create or edit a mod:

1. Inspect the existing manifest and files before proposing a structure.
2. Identify whether each operation belongs in main or worker context.
3. Quote or copy exact method signatures from the appended API reference.
4. State any required runtime IDs or content-specific definitions that cannot be derived from the request.
5. Preserve existing IDs, Workshop identity, unrelated user changes, and established formatting.
6. Implement the smallest complete change.
7. Validate JavaScript syntax, JSON parsing, declared paths, and patch counts.
8. Explain remaining runtime tests without claiming they were performed.

When the reference does not document a type’s fields, treat it as opaque or probe it in game. Do not fill gaps with properties borrowed from other games or engines.

## Reference priority

Use sources in this order:

1. Exact signatures in `apireference.md`.
2. Runtime outputs marked “Observed in game” in the API Explorer.
3. Focused format references for mod structure, overrides, patches, and maps.
4. Working local mods that target the same Sandkit API version.
5. Engine escape-hatch inspection only when the public API cannot satisfy the task.

If sources conflict, prefer the exact API context and the currently tested game build, then clearly identify the uncertainty.
