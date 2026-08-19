const searchInput = document.querySelector("#api-search");
const results = document.querySelector("#api-results");
const summary = document.querySelector("#api-summary");
const contextButtons = [...document.querySelectorAll("[data-context]")];

let entries = Array.isArray(window.SANDKIT_API_ENTRIES)
  ? window.SANDKIT_API_ENTRIES
  : [];
let activeContext = "all";

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const METHOD_DOCS = {
  "api.elements.getTypeFromId": {
    description: "Resolves a stable element string ID to the numeric element type used by simulation APIs.",
    useCase: "Resolve IDs once during mod startup, then compare cell contents without hard-coding game-specific numbers.",
    example: 'const fireType = api.elements.getTypeFromId("fire");',
    output: "17 // Example runtime type; resolve it instead of hard-coding it.",
  },
  "api.elements.getDefinitionByType": {
    description: "Returns the registered definition for an element type, including properties such as its matter category.",
    useCase: "Inspect an incoming element before deciding whether a custom structure should accept or reject it.",
    example: "const definition = api.elements.getDefinitionByType(elementType);",
    output: '{\n  id: "sand",\n  matterType: 1\n}\n// Representative ElementDefinition, or undefined',
  },
  "api.elements.getResolvedTypeAtCell": {
    description: "Reads the element at a cell and resolves particle cells to their linked underlying element type.",
    useCase: "Treat loose particles and normal cells consistently when filtering or transporting matter.",
    example: "const elementType = api.elements.getResolvedTypeAtCell(cellX, cellY);",
    output: "17 // Resolved ElementType, or null when none can be resolved",
  },
  "api.elements.createAtCellWhenIdle": {
    description: "Queues creation of an element at a cell for the next simulation-safe idle boundary.",
    useCase: "Create matter from main-thread code without racing the simulation workers.",
    example: "api.elements.createAtCellWhenIdle(cellX, cellY, elementType);",
    output: "undefined\n// The creation is queued for a simulation-safe idle boundary.",
  },
  "api.world.runWhenSimulationIdle": {
    description: "Queues a callback to run when it is safe for main-thread code to mutate simulation state.",
    useCase: "Group several related world changes behind one safe simulation boundary.",
    example: "api.world.runWhenSimulationIdle(() => {\n  // Perform related world mutations here.\n});",
    output: "undefined\n// The callback is queued and runs once the simulation is idle.",
  },
  "api.world.isCellEmptyAtCell": {
    description: "Checks whether a cell is available and contains no blocking world content.",
    useCase: "Verify a destination before creating, moving, or spawning something there.",
    example: "if (api.world.isCellEmptyAtCell(cellX, cellY)) {\n  // The destination is available.\n}",
    output: "true // or false when the cell is occupied or unavailable",
  },
  "api.structures.register": {
    description: "Registers a custom structure definition, including its footprint, category, rendering, and placement behavior.",
    useCase: "Add a new machine or logistics building while the mod loads.",
    example: 'api.structures.register({\n  id: "your-structure",\n  name: "Your Structure",\n  shape: [[1]]\n});',
  },
  "api.structures.addProcessor": {
    description: "Attaches a periodic processor to every placed structure of the requested type.",
    useCase: "Implement transport, production, filtering, or other recurring machine behavior with atomic mutations.",
    example: 'api.structures.addProcessor("your-structure", {\n  intervalMs: 50,\n  process(structure, processor) {\n    // Read cells and commit validated mutations.\n  }\n});',
  },
  "api.structures.getAtCell": {
    description: "Returns the structure occupying a cell, or null when no structure is present.",
    useCase: "Discover adjacent machines or build a connected multiblock network.",
    example: "const neighbor = api.structures.getAtCell(cellX, cellY);",
    output: 'structure // Engine-owned Structure object\n// or null when no structure occupies the cell',
  },
  "api.sprites.loadFromMod": {
    description: "Loads an image from the current mod folder and registers it under a sprite ID.",
    useCase: "Load custom structure, item, UI, or technology artwork before registering content that references it.",
    example: 'await api.sprites.loadFromMod("your-sprite", "assets/your-sprite.png");',
    output: "undefined\n// The promise resolves after the sprite has loaded.",
  },
  "api.tech.registerNode": {
    description: "Adds a technology node to the research grid and connects it to a parent node.",
    useCase: "Give a custom structure or item a normal research cost and progression path.",
    example: 'api.tech.registerNode("your.mod.tech", {\n  name: "Your Technology",\n  cost: 1000,\n  unlocks: { structures: ["your-structure"] }\n}, { parentId: 64 });',
  },
  "api.ui.toast": {
    description: "Displays a short, non-blocking message to the player.",
    useCase: "Confirm that a mod loaded or provide brief feedback after a player action.",
    example: 'api.ui.toast("Your mod loaded");',
  },
  "api.events.on": {
    description: "Subscribes a callback to an event and returns a function that removes the subscription.",
    useCase: "React to gameplay or mod-defined events without polling every tick.",
    example: 'const unsubscribe = api.events.on("your:event", (payload) => {\n  // React to the event.\n});',
    output: "() => { /* removes this event subscription */ }",
  },
  "api.storage.set": {
    description: "Stores a value under a mod ID and key in Sandkit-managed storage.",
    useCase: "Persist load diagnostics, progression state, or other mod-owned data.",
    example: 'api.storage.set("your.mod", "loadStatus", { loaded: true });',
  },
  "api.storage.get": {
    description: "Reads a previously stored value for a mod ID and key.",
    useCase: "Restore saved mod state when a game or mod session starts.",
    example: 'const status = api.storage.get("your.mod", "loadStatus");',
    output: '{ loaded: true }\n// The stored value; its shape depends on what the mod saved.',
  },
  "api.schedule.nextTick": {
    description: "Schedules a callback for the next game tick.",
    useCase: "Defer follow-up work until native logic from the current tick has completed.",
    example: "api.schedule.nextTick(() => {\n  // Follow-up work.\n});",
  },
  "api.grid.forEachCellInRect": {
    description: "Visits every cell inside a rectangular grid area.",
    useCase: "Apply an effect, inspection, or mutation across a bounded machine or tool footprint.",
    example: "api.grid.forEachCellInRect(cellX, cellY, width, height, (x, y) => {\n  // Inspect each cell.\n});",
  },
  "api.projectiles.spawnAtWorld": {
    description: "Spawns a projectile blueprint at a world position and angle.",
    useCase: "Fire a custom or cloned projectile from a weapon, structure, or scripted event.",
    example: "const projectile = api.projectiles.spawnAtWorld(worldX, worldY, angle, blueprint);",
    output: "projectile // Engine-owned Projectile object returned by the spawn",
  },
  "api.sound.play": {
    description: "Plays a registered sound with optional position, volume, and playback settings.",
    useCase: "Provide audio feedback for a custom structure, tool, or interaction.",
    example: 'api.sound.play("your-sound", { volume: 0.5 });',
    output: "soundHandle // Engine-owned SoundHandle for this playback instance",
  },
  "api.maps.start": {
    description: "Starts an available map by its registered map ID and reports whether the transition began.",
    useCase: "Launch a custom scenario from mod UI or progression logic.",
    example: 'const started = api.maps.start("your-map-id");',
    output: "true // false means the map transition did not start",
  },
  "api.i18n.t": {
    description: "Translates an i18n key for the active locale and substitutes any supplied parameters.",
    useCase: "Show player-facing text that follows the game’s current language.",
    example: 'const label = api.i18n.t("your.mod|status", { amount: 10 });',
    output: '"10 items ready" // Localized text for the active locale',
  },
  "api.i18n.key": {
    description: "Joins several translation-key segments into Sandkit’s canonical pipe-delimited key format.",
    useCase: "Build consistent namespaced translation keys without manually joining strings.",
    example: 'const key = api.i18n.key("your.mod", "machine", "name");',
    output: '"your.mod|machine|name"',
  },
  "api.random.int": {
    description: "Returns a random integer within the requested minimum and maximum range.",
    useCase: "Choose one discrete outcome, lane, variation, or reward amount.",
    example: "const lane = api.random.int(0, 3);",
    output: "2 // Example integer inside the requested range",
  },
  "api.random.float": {
    description: "Returns a random floating-point value within the requested range.",
    useCase: "Vary a continuous property such as velocity, scale, volume, or chance threshold.",
    example: "const speed = api.random.float(0.8, 1.2);",
    output: "1.04 // Example floating-point value inside the range",
  },
};

// Captured by API Documentation Probe 0.1.1 on Sandkit API v1. Values are
// representative observations, not constants mods should hard-code.
const RUNTIME_DOCS = {
  "api.gameConfig.getAll": {
    output: "{\n  drill: {\n    maxRange: 7,\n    raycastCount: 20,\n    spreadAngle: 0.08726646259971647,\n    redrawRange: 5,\n    energyCost: 1,\n    normalExcavationRate: 0.1,\n    reducedExcavationRate: 0\n  }\n}",
    notes: "The probe observed a plain configuration object keyed by system name. Available sections and values depend on the game build and loaded configuration.",
  },
  "api.action.getActive": {
    output: "{ id: 5, type: 3 }",
    notes: "Action was a plain object with numeric id and type fields—not an opaque class instance. Both are runtime enum values and should not be hard-coded.",
  },
  "api.action.getSelected": {
    output: "{ id: 5, type: 3 }",
    notes: "The selected Action used the same { id, type } shape as the active Action in this run. Selected and active can differ as input state changes.",
  },
  "api.assets.getUrl": {
    output: '"file:///…/sandustry/mods/api-documentation-probe/preview.png"',
    notes: "A local mod asset produced an absolute file URL. The profile and mod-folder portions vary by installation, so do not build logic around the literal path.",
  },
  "api.scene.getActive": {
    output: "4 // Numeric Scene value observed in game",
    notes: "Despite the named Scene return type, this runtime returned a number. Treat it as a scene enum/identifier and do not expect object properties.",
  },
  "api.input.getMouseCellPosition": {
    output: "{ x: 0, y: 0 }",
    notes: "The result is a plain cell-coordinate object. This capture reported the origin, so use the returned coordinates rather than assuming the mouse is inside the world.",
  },
  "api.player.getWorldPosition": {
    output: "{ x: 14796.635068039688, y: 7830.385492400017 }",
    notes: "Player position is returned in world-space units as floating-point values, not integer cell coordinates.",
  },
  "api.player.isOnGround": {
    output: "false",
    notes: "The probe player was not grounded. This value changes with the player’s movement state.",
  },
  "api.player.isWorldPositionClear": {
    output: "true",
    notes: "The player’s sampled world position was reported clear. Use this as a guard before moving the player to a candidate position.",
  },
  "api.world.getCellIdAtCell": {
    output: "2092594 // Observed at occupied cell (3731, 1993)",
    notes: "Cell IDs are numeric runtime identifiers. This occupied cell returned 2092594; values vary by cell and world, so never hard-code the observed number.",
  },
  "api.world.isCellEmptyAtCell": {
    output: "false // Cell (3731, 1993) contained an element",
    notes: "The occupied element cell returned false, confirming that element content makes the cell non-empty.",
  },
  "api.world.isTerrainAtCell": {
    output: "false // Cell (3731, 1993) contained an element, not terrain",
    notes: "A non-empty element cell still returned false because this method tests specifically for terrain.",
  },
  "api.elements.getRegisteredTypes": {
    output: "[1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, /* 38 more */]",
    notes: "The probe observed 50 registered ElementType numbers. The list depends on the game build and loaded mods; resolve stable string IDs rather than persisting these numbers.",
  },
  "api.elements.getTypeAtCell": {
    output: "16 // ElementType at occupied cell (3731, 1993)",
    notes: "The populated element cell returned numeric ElementType 16. Resolve stable string IDs at runtime rather than assuming 16 always identifies the same mod-relevant element.",
  },
  "api.elements.getResolvedTypeAtCell": {
    output: "16 // Resolved ElementType at cell (3731, 1993)",
    notes: "Because the sampled element was not a particle, the resolved type matched getTypeAtCell(). Particle cells may resolve to their linked underlying ElementType.",
  },
  "api.elements.getInfoAtCell": {
    output: "{\n  elementType: 16,\n  isParticle: false,\n  cellId: 2092594,\n  elementIndex: 1092593\n}",
    notes: "This is the complete plain-object shape captured from occupied cell (3731, 1993). elementType identifies the material, isParticle distinguishes particle storage, cellId identifies the world cell, and elementIndex identifies the element’s simulation record. All numeric values are runtime-specific.",
  },
  "api.elements.getMatterTypeAtCell": {
    output: "6 // MatterType at occupied cell (3731, 1993)",
    notes: "The sampled element returned numeric MatterType 6. MatterType values are engine enums used to categorize material behavior; compare against documented/resolved values rather than guessing from this sample.",
  },
  "api.elements.getVelocityAtCell": {
    output: "{ x: 1, y: 19.440000534057617 }",
    notes: "The occupied cell returned a plain floating-point velocity vector. The values are live simulation velocity components and can change every tick.",
  },
  "api.elements.getDataFieldAtCell": {
    output: "0 // Data field 1 at occupied cell (3731, 1993)",
    notes: "Field 1 existed for the sampled element and returned numeric zero. A zero result is distinct from null: null indicates no readable value at that cell/field, while zero is an actual stored value.",
  },
  "api.terrains.getDataAtCell": {
    output: "null // Occupied cell (3731, 1993) contained an element, not terrain",
    notes: "An element can occupy a non-terrain cell, so this terrain-specific query returned null. A terrain sample is still needed to verify cellType and hp values.",
  },
  "api.structures.getAtCell": {
    output: "null // Occupied cell (3731, 1993) contained an element, not a structure",
    notes: "A non-empty element cell can still return null because this query only finds structures. Another probe over a placed structure is needed for its non-null fields.",
  },
  "api.structures.getUnlockedTypes": {
    output: "new Set([11, 12, 15, 14, 13, 16, 4, 3, 2, 1, 5, 6])",
    notes: "The runtime returned a real Set of numeric StructureType values in this save. Unlock state and registered mod structures change its contents.",
  },
  "api.energy.getNetworkAtCell": {
    output: "[] // Element cell (3731, 1993) was not in an energy network",
    notes: "An empty array means the sampled cell is not connected to an energy network. Connected structure cells should produce { x, y, type } entries.",
  },
  "api.energy.getNetworkFreeCapacityAtCell": {
    output: "0 // Element cell (3731, 1993) had no energy network",
    notes: "A cell with no energy network reported zero free capacity. Connected storage networks return a runtime-dependent value.",
  },
  "api.items.getActive": {
    output: "{\n  id: 5,\n  itemType: 2,\n  nameKey: \"items|vacuum|name\",\n  descriptionKey: \"items|vacuum|description\",\n  categoryKey: \"utility\",\n  sprite: { id: \"vacuum\", mount: \"cryoblaster\", ui: { imageName: \"vacuum_icon\" } },\n  data: {\n    tanks: [/* six tank objects */],\n    activeTankIdx: 5,\n    filter: { elementType: null },\n    onlyFillActiveTank: true,\n    suckCooldown: { time: 30, last: 0 },\n    sprayCooldown: { time: 20, last: 202762907.61237124 }\n  }\n}",
    notes: "The active Vacuum was a plain object with metadata and item-specific data. Because this API returns any, guard optional fields and branch on stable item identity before reading item-specific properties.",
  },
  "api.maps.getActive": {
    output: "null // No custom map active during the probe",
    notes: "Null is verified during normal play without an active registered map. A map-session probe is needed to document non-null ActiveMapV1 fields.",
  },
  "api.maps.getAvailable": {
    output: "[] // No registered custom maps were available",
    notes: "The runtime returned a normal array. This installation exposed no available maps during the capture; map mods should add read-only entries.",
  },
  "api.projectiles.getAll": {
    output: "[] // No live projectiles at capture time",
    notes: "The result is a snapshot array. Capture during an active projectile to verify its non-empty object shape before relying on internal fields.",
  },
  "api.world.pickups.getAll": {
    output: "[] // No world pickups at capture time",
    notes: "The method returned a normal array. A non-empty capture is still required to document the untyped pickup fields.",
  },
  "api.settings.getAll": {
    output: "{} // No mod settings were registered",
    notes: "The result is a read-only plain object keyed by setting field IDs. With no fields registered for the probe, it was empty.",
  },
  "api.shared.buffers.get": {
    output: "undefined // The requested shared-buffer key did not exist",
    notes: "Missing keys return undefined exactly. Use require() in a worker or create() on main when a shared typed array must exist.",
  },
  "api.rendering.getDrawPositionAtCell": {
    output: "{ x: 0, y: 0 } // Draw position for cell (0, 0)",
    notes: "The method converts integer cell coordinates into a plain draw-coordinate object using the active grid metrics.",
  },
  "api.rendering.getGridMetrics": {
    output: "{ cellSize: 4, snapGridCellSize: 4 }",
    notes: "Both metrics were four world units in this runtime. Read them rather than hard-coding four, because rendering configuration can change.",
  },
  "api.rendering.getOverlayViewportSize": {
    output: "{ width: 1920, height: 1088 }",
    notes: "The overlay viewport used pixel dimensions and was slightly taller than a 1920×1080 display. Always size overlays from the returned values.",
  },
  "api.rendering.withOverlayContext": {
    output: "context // CanvasRenderingContext2D passed to the callback\n// The method returns whatever the callback returns.",
    notes: "The callback received a real CanvasRenderingContext2D with standard drawing, path, clipping, gradient, and image-data methods. Generic T is the callback’s return value.",
  },
  "api.raycast.castFromWorld": {
    output: "null // No hit within 64 units at angle 0",
    notes: "Null is the verified no-hit result. A hit returns { x, y, distance } in world-space units.",
  },
  "api.sound.calculateDistanceOptionsAtWorld": {
    output: "{\n  pan: 0,\n  volume: 0.5,\n  playbackRate: 0.5,\n  filters: [{ type: \"lowpass\", frequency: 8000 }],\n  distanceToPlayer: 0\n}",
    notes: "At the player’s position with baseVolume 0.5, the runtime produced centered pan, unchanged volume, a 0.5 playback rate, one low-pass filter, and zero distance.",
  },
  "api.patterns.createCircle": {
    output: "[\n  [0, 0, 1, 0, 0],\n  [0, 1, 1, 1, 0],\n  [1, 1, 1, 1, 1],\n  [0, 1, 1, 1, 0],\n  [0, 0, 1, 0, 0]\n]",
    notes: "createCircle(5) returned a 5×5 mask where 1 marks cells inside the circle and 0 marks cells outside it.",
  },
  "api.utils.getDistance": {
    output: "5 // From { x: 0, y: 0 } to { x: 3, y: 4 }",
    notes: "The method returned ordinary Euclidean distance, confirming the familiar 3-4-5 result.",
  },
  "api.utils.getDirection": {
    output: "{ x: 0.6, y: 0.8 } // From {0,0} toward {3,4}",
    notes: "The result was a normalized direction vector with length 1, not the raw {3,4} delta.",
  },
  "api.utils.getAngle": {
    output: "53.13010235415598 // From {0,0} toward {3,4}",
    notes: "The observed angle was in degrees, measured from the positive x direction.",
  },
  "api.utils.getCoordinatesBetweenPoints": {
    output: "[\n  { x: 1, y: 1 },\n  { x: 2, y: 2 },\n  { x: 2, y: 3 },\n  { x: 3, y: 4 }\n]",
    notes: "For {0,0} to {3,4}, the start was excluded and the end included. Intermediate coordinates followed the rasterized line.",
  },
  "api.i18n.getLocale": {
    output: '"en"',
    notes: "The active locale was a short code. Some languages use game codes such as ptBR, zhCN, or zhTW rather than browser-style hyphenation.",
  },
  "api.i18n.getLanguages": {
    output: "[\n  { code: \"en\", englishName: \"English\", nativeName: \"English\", enabled: true, htmlLang: \"en\", fontFamily: \"Play\" },\n  { code: \"fr\", englishName: \"French\", nativeName: \"Français\", enabled: true, htmlLang: \"fr\", fontFamily: \"Play\" },\n  /* 21 more entries observed */\n]",
    notes: "The runtime exposed 23 languages. Beyond the four public fields, entries currently included htmlLang and fontFamily; some also had fontProbe or browserLocales, which should be treated as extra runtime details.",
  },
  "api.i18n.getAvailableLocales": {
    output: '["en"]',
    notes: "Only English resources were available to this mod context, even though getLanguages() listed every supported game language.",
  },
  "api.i18n.getGlobals": {
    output: "{\n  \"key.Left\": \"A\",\n  \"key.Right\": \"D\",\n  \"key.OpenInventory\": \"Tab\",\n  \"key.QuickSave\": \"F5\",\n  \"key.QuickLoad\": \"F9\"\n  /* additional key labels */\n}",
    notes: "The globals were a plain string-to-string object containing current key labels. User bindings can change these values.",
  },
  "api.i18n.formatNumber": {
    output: '"12,345.67" // formatNumber(12345.67) in locale "en"',
    notes: "Formatting followed the active locale’s separators. Do not parse the localized result back into gameplay logic.",
  },
  "api.i18n.key": {
    output: '"probe|example|name"',
    notes: "The helper joined supplied segments with a vertical bar and did not otherwise transform them.",
  },
  "api.i18n.translatable": {
    output: "{ __translatable: true, key: \"probe|example\", fallback: \"Example\" }",
    notes: "This plain marker object can be resolved later by UI APIs using the active locale, falling back to the supplied text.",
  },
  "api.time.getTimeMs": {
    output: "202965794.7124531 // Example runtime time in milliseconds",
    notes: "This was a floating-point monotonic runtime clock, not a Unix timestamp. Use differences between readings for elapsed time.",
  },
  "api.time.getTick": {
    output: "13704324 // Example simulation tick",
    notes: "Ticks were increasing whole numbers. The absolute value depends on session state; compare ticks or store a prior reading.",
  },
  "api.tools.grabber.getSize": {
    output: "25",
    notes: "The runtime grabber size was 25. Upgrades, configuration, or setSize() can change it.",
  },
  "api.tools.grabber.isActive": {
    output: "false",
    notes: "The grabber was not the active tool during capture. This follows current player tool state.",
  },
  "api.tools.grabber.isLoaded": {
    output: "false",
    notes: "The grabber was not loaded. Check this separately from isActive(), because selection and loaded contents are different conditions.",
  },
  "api.random.int": {
    output: "12 // Observed from random.int(10, 20)",
    notes: "The value was an integer within the requested bounds. Repeated calls vary.",
  },
  "api.random.float": {
    output: "0.7093443682851169 // Observed from random.float(0.25, 0.75)",
    notes: "The value was a floating-point number within the requested range. Repeated calls vary.",
  },
};

const NAMESPACE_LABELS = {
  "api.ui.navigation": "controller navigation",
  "api.ui.overlays": "UI overlays",
  "api.storage.local": "local mod storage",
  "api.structures.processing": "structure processing",
  "api.structures.recipes": "structure recipes",
  "api.world.pickups": "world pickups",
  "api.shared.buffers": "shared buffers",
  "api.lights.vfx": "temporary lighting",
  "api.lights.persistent": "persistent lighting",
};

function humanize(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .replaceAll("spritesheet", "sprite sheet")
    .toLowerCase();
}

function getMethodName(namespace, signature) {
  const prefix = `${namespace}.`;
  const start = signature.indexOf(prefix);
  if (start < 0) return "method";
  return signature.slice(start + prefix.length).match(/^([A-Za-z0-9_]+)/)?.[1] || "method";
}

function getMethodPath(namespace, signature) {
  return `${namespace}.${getMethodName(namespace, signature)}`;
}

function getNamespaceLabel(namespace) {
  return NAMESPACE_LABELS[namespace] || humanize(namespace.replace(/^api\./, ""));
}

function makeGenericDocs(namespace, signature) {
  const method = getMethodName(namespace, signature);
  const area = getNamespaceLabel(namespace);
  const patterns = [
    ["get", "Returns", "Read the result before deciding what the mod should do next."],
    ["find", "Finds", "Locate matching game state before performing a targeted action."],
    ["is", "Checks whether", "Guard an action so it only runs when the condition is true."],
    ["can", "Checks whether the game can", "Validate an action before attempting to change state."],
    ["has", "Checks whether the game has", "Confirm required state exists before continuing."],
    ["set", "Sets", "Update this state after a gameplay event or configuration change."],
    ["update", "Updates", "Change an existing definition or runtime value without replacing everything."],
    ["register", "Registers", "Add custom behavior or content while the mod loads."],
    ["add", "Adds", "Extend the current game or mod state with another value or behavior."],
    ["create", "Creates", "Create this in response to a structure, tool, trigger, or event."],
    ["spawn", "Spawns", "Place a new runtime object into the active world."],
    ["build", "Builds", "Place a structure from scripted gameplay logic."],
    ["remove", "Removes", "Clean up state when content expires or a gameplay condition changes."],
    ["destroy", "Destroys", "Remove a runtime object that should no longer exist."],
    ["replace", "Replaces", "Convert an existing value or cell while preserving a clear expected result."],
    ["play", "Plays", "Provide player feedback when a custom action succeeds."],
    ["stop", "Stops", "End an active effect or behavior when it is no longer needed."],
    ["open", "Opens", "Show the relevant interface in response to player input."],
    ["show", "Shows", "Present contextual information or feedback to the player."],
    ["consume", "Consumes", "Spend a resource as part of a custom machine or action."],
    ["convert", "Converts", "Change an element between supported simulation representations."],
    ["mark", "Marks", "Notify the engine that this state needs special handling or refresh."],
    ["emit", "Emits", "Notify other mod logic without adding a polling loop."],
    ["intercept", "Intercepts", "Observe or conditionally affect a supported engine hook."],
    ["modify", "Modifies", "Adjust supported hook arguments before the engine continues."],
    ["cast", "Casts", "Query the world along a direction before applying a ranged effect."],
    ["calculate", "Calculates", "Derive the settings needed for a later effect or action."],
    ["format", "Formats", "Convert a raw value into player-facing text."],
    ["require", "Requires", "Obtain required shared state and create it when supported."],
    ["complete", "Completes", "Advance a supported progression objective from mod logic."],
    ["collect", "Collects", "Award or gather the matching resource from a world cell."],
    ["move", "Moves", "Relocate game state after validating the destination."],
    ["swap", "Swaps", "Exchange two supported cell values atomically."],
    ["teleport", "Teleports", "Relocate content without normal movement behavior."],
    ["excavate", "Excavates", "Apply a bounded excavation effect to the world."],
    ["burn", "Burns", "Apply the game’s fire behavior to a valid element."],
    ["damage", "Damages", "Apply damage to the matching terrain or target."],
    ["fade", "Fades", "Transition an active effect out over time."],
    ["reveal", "Reveals", "Expose hidden world information around the requested location."],
    ["pickUp", "Picks up", "Move a world pickup into the normal player collection flow."],
    ["press", "Presses", "Simulate the start of a registered input action."],
    ["release", "Releases", "Simulate the end of a registered input action."],
    ["reset", "Resets", "Restore the related state to its neutral condition."],
    ["trigger", "Triggers", "Invoke a registered action from mod logic."],
    ["select", "Selects", "Make the requested tool, structure, or provider active."],
    ["hide", "Hides", "Temporarily remove the related visual content from view."],
    ["rotate", "Rotates", "Apply the requested angle to the related visual content."],
    ["ensure", "Ensures", "Create or return the required mod-owned state container."],
    ["clear", "Clears", "Remove previously registered or cached state."],
    ["sync", "Synchronizes", "Refresh related state so the engine and UI agree."],
    ["map", "Maps", "Convert a value into the representation expected by the target system."],
    ["forEach", "Visits each", "Inspect or update every item in a bounded collection."],
    ["use", "Provides", "Connect a component to the related runtime behavior."],
    ["focus", "Focuses", "Move controller or keyboard focus to the requested UI element."],
  ];
  const pattern = patterns.find(([prefix]) => method.startsWith(prefix));
  const prefix = pattern?.[0] || "";
  const subject = humanize(method.slice(prefix.length) || "a value");
  let description = pattern
    ? `${pattern[1]} ${subject} through the ${area} API.`
    : `Performs the “${humanize(method)}” operation through the ${area} API.`;
  if (method.endsWith("WhenIdle")) {
    description += " The change is queued for a simulation-safe idle boundary.";
  }
  return {
    description,
    useCase: pattern?.[2] || `Use this when a mod needs to ${humanize(method)} through ${area}.`,
  };
}

function splitParameters(source) {
  const parts = [];
  let start = 0;
  let paren = 0;
  let brace = 0;
  let bracket = 0;
  let angle = 0;
  let quote = "";
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === quote && source[index - 1] !== "\\") quote = "";
      continue;
    }
    if (character === '"' || character === "'") { quote = character; continue; }
    if (character === "(") paren += 1;
    else if (character === ")") paren -= 1;
    else if (character === "{") brace += 1;
    else if (character === "}") brace -= 1;
    else if (character === "[") bracket += 1;
    else if (character === "]") bracket -= 1;
    else if (character === "<") angle += 1;
    else if (character === ">") angle = Math.max(0, angle - 1);
    else if (character === "," && paren === 0 && brace === 0 && bracket === 0 && angle === 0) {
      parts.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }
  const finalPart = source.slice(start).trim();
  if (finalPart) parts.push(finalPart);
  return parts;
}

function findMethodCloseParen(signature) {
  const openIndex = signature.indexOf("(");
  if (openIndex < 0) return -1;
  let depth = 0;
  for (let index = openIndex; index < signature.length; index += 1) {
    if (signature[index] === "(") depth += 1;
    if (signature[index] === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function extractParameters(signature) {
  const openIndex = signature.indexOf("(");
  const closeIndex = findMethodCloseParen(signature);
  if (openIndex < 0 || closeIndex < 0) return [];
  return splitParameters(signature.slice(openIndex + 1, closeIndex))
    .filter((parameter) => parameter && !/^\w+\?\s*:/.test(parameter));
}

function extractReturnType(signature) {
  const closeIndex = findMethodCloseParen(signature);
  if (closeIndex < 0) return "unknown";
  return signature.slice(closeIndex + 1)
    .replace(/^\s*:\s*/, "")
    .replace(/;\s*$/, "")
    .trim();
}

function placeholderFor(parameter) {
  const name = parameter.match(/^(?:\.\.\.)?([A-Za-z0-9_]+)/)?.[1] || "value";
  if (/callback|apply|render|mutate/i.test(name)) return "() => { /* ... */ }";
  if (/definition|partial|updates|options|config|data|payload/i.test(name)) return "{}";
  if (/message|title|placeholder|locale/i.test(name)) return '"Example"';
  if (/structureId|structureType/i.test(name)) return '"your-structure"';
  if (/elementId/i.test(name)) return '"sand"';
  if (/terrainId/i.test(name)) return '"stone"';
  if (/itemId/i.test(name)) return '"your-item"';
  if (/projectileId/i.test(name)) return '"your-projectile"';
  if (/modId/i.test(name)) return '"your.mod"';
  if (/soundId|spriteId|triggerId|bindingId|upgradeId|mapId|overlayId|fieldId|key$/i.test(name)) return '"your-id"';
  if (/path/i.test(name)) return '"assets/example.png"';
  if (/enabled|glow|isFlamethrower/i.test(name)) return "true";
  if (/velocity|point|position/i.test(name)) return "{ x: 0, y: 0 }";
  if (/cellX|cellY|worldX|worldY|width|height|radius|size|amount|damage|angle|duration|level|index|power|value/i.test(name)) return name;
  if (/type/i.test(name)) return name;
  return name;
}

function makeExample(namespace, signature) {
  const method = getMethodName(namespace, signature);
  const methodPath = `${namespace}.${method}`;
  const parameters = extractParameters(signature).map(placeholderFor);
  const args = parameters.length > 5
    ? `${parameters.slice(0, 4).join(", ")}, /* … */`
    : parameters.join(", ");
  const call = `${methodPath}(${args})`;
  if (/\): Promise</.test(signature)) return `const result = await ${call};`;
  if (/^(?:is|can|has)/.test(method)) return `if (${call}) {\n  // Continue when the condition is true.\n}`;
  if (/\): void;$/.test(signature)) return `${call};`;
  return `const result = ${call};`;
}

function makeOutput(namespace, signature) {
  const method = getMethodName(namespace, signature);
  const returnType = extractReturnType(signature);
  const exact = {
    void: method.endsWith("WhenIdle")
      ? "undefined\n// No value is returned; the mutation is queued until idle."
      : "undefined\n// No value is returned; observe the documented side effect.",
    boolean: "true // or false, depending on current game state",
    number: "42 // Example runtime-dependent number",
    string: '"example" // Runtime-dependent text',
    any: 'value // This method intentionally returns an untyped value (any).',
    "any[]": "[value1, value2] // Array contents are intentionally untyped.",
    "() => void": "cleanup() // A callable function returned by the API",
    "{ x: number; y: number; }": "{ x: 120, y: 64 }",
    "{ x: number; y: number; } | null": "{ x: 120, y: 64 } // or null",
    "{ x: number; y: number; }[]": "[{ x: 120, y: 64 }, { x: 121, y: 64 }]",
    "{ index: number | null; }": "{ index: 3 } // index may be null",
    "{ elementType: ElementType; }": "{ elementType: 17 }",
    "{ elementType: ElementType; isParticle: boolean; cellId: number; elementIndex: number; } | null":
      "{ elementType: 17, isParticle: false, cellId: 4096, elementIndex: 17 }\n// or null when the cell has no matching element",
    "{ x: number; y: number; type: string; }[]":
      '[{ x: 120, y: 64, type: "your-structure" }]',
    "{ code: string; nativeName: string; englishName: string; enabled: boolean; }[]":
      '[{ code: "en", nativeName: "English", englishName: "English", enabled: true }]',
    "{ __translatable: true; key: string; fallback: string; }":
      '{ __translatable: true, key: "your.mod|label", fallback: "Label" }',
    "{ cellType: number; }": "{ cellType: 17 }",
    "{ cellType: number; hp: number | null; } | null": "{ cellType: 17, hp: 100 } // or null",
    "{ x: number; y: number; distance: number; } | null": "{ x: 120, y: 64, distance: 8.5 } // or null",
    "{ cellSize: number; snapGridCellSize: number; }": "{ cellSize: 4, snapGridCellSize: 8 }",
    "{ width: number; height: number; }": "{ width: 1920, height: 1080 }",
    "Record<string, string>": '{ confirm: "Confirm", cancel: "Cancel" }',
    "string[]": '["first", "second"]',
    "number[][]": "[[1, 2], [3, 4]]",
    "Set<string | StructureType>": 'new Set(["your-structure"])',
    ElementType: "17 // Example runtime element type",
    "ElementType[]": "[17, 23] // Example runtime element types",
    "ElementType | null": "17 // or null",
    "ElementDefinition | undefined": '{\n  id: "sand",\n  matterType: 1\n}\n// Representative ElementDefinition, or undefined',
    "MatterType | null": "1 // Example MatterType, or null",
    "number | null": "42 // or null",
    "string | undefined": '"example" // or undefined',
    "string | StructureType": '"your-structure" // ID or StructureType value',
    "string | StructureType | null": '"your-structure" // Structure ID/type, or null',
    "JsonValueV1 | undefined": '{ loaded: true } // Any JSON value, or undefined',
    JsonObjectV1: '{ loaded: true, count: 3 }',
    "ConfigValueV1 | undefined": '"configured-value" // or undefined',
    "Readonly<Record<string, ConfigValueV1>>": '{ difficulty: "normal", enabled: true }',
    "AssetProviderV1 | null": 'provider // Read-only AssetProviderV1 selected for this asset kind\n// or null when no provider is selected',
    "readonly AssetProviderV1[]": '[providerA, providerB] // Read-only AssetProviderV1 objects',
    "Readonly<ActiveMapV1> | null": 'activeMap // Read-only ActiveMapV1 for the running map\n// or null outside an active map',
    "readonly Readonly<AvailableMapV1>[]": '[mapA, mapB] // Read-only AvailableMapV1 entries',
    "Promise<void>": "undefined\n// The promise resolves after the operation completes.",
    "Promise<boolean>": "true // awaited result; false is also possible",
    "Promise<string | null>": '"result-id" // awaited string result, or null',
    T: "value // The returned value has the caller-supplied generic type.",
    Action: "action // Engine-owned Action representing the active/selected tool action",
    Scene: "4 // Numeric scene enum/identifier observed in Sandkit API v1",
    ModItem: "item // Engine-owned ModItem created from the registered item ID",
    ProjectileBlueprint: "blueprint // ProjectileBlueprint ready to pass to spawnAtWorld()",
    Projectile: "projectile // Live engine-owned Projectile instance",
    "Projectile | undefined": "projectile // Live Projectile, or undefined when the ID was not found",
    "Projectile[]": "[projectileA, projectileB] // Snapshot of live Projectile objects",
    SoundHandle: "soundHandle // Engine-owned handle for this playback instance",
    "SoundHandle[]": "[handleA, handleB] // One SoundHandle per sound layer that started",
    SoundOptions: "{\n  volume: 0.5\n}\n// Distance-adjusted options suitable for api.sound.play()",
    Structure: "structure // Engine-owned Structure instance",
    "Structure | null": "structure // Engine-owned Structure, or null when no structure was found",
    SharedArray: "new Int32Array([0, 1, 2]) // Concrete typed array depends on the buffer",
    "SharedArray | undefined": "new Int32Array([0, 1, 2]) // or undefined",
    TechGridPosition: "{ row: 10, col: 2 }",
    "{ readonly ref: RefObject<T>; readonly focused: boolean; readonly focus: () => void; }":
      "{\n  ref,\n  focused: false,\n  focus: () => undefined\n}",
  };
  return exact[returnType] || `value // Returned as ${returnType}`;
}

function makeOutputNotes(namespace, signature) {
  const method = getMethodName(namespace, signature);
  const returnType = extractReturnType(signature);
  const opaqueNotes = {
    Action: "Action is an engine-owned object. The v1 reference does not publish its fields, so use it for identity or pass it through supported APIs instead of depending on guessed properties.",
    Scene: "The runtime probe showed that Scene is represented by a number, not an object. Treat it as an enum/identifier and do not attempt to read properties from it.",
    ModItem: "ModItem is created from a registered item definition. Its fields are not documented in API v1, so treat it as an engine-owned item value and avoid relying on properties discovered only through runtime inspection.",
    ProjectileBlueprint: "This is a configured projectile template, not a live projectile. Pass it directly as the fourth argument to api.projectiles.spawnAtWorld(); the spawned Projectile is returned separately.",
    Projectile: "This is the live projectile instance created by the engine. Keep the reference if you later need to pass that exact instance to api.projectiles.remove().",
    "Projectile | undefined": "A matching live projectile is returned when the numeric ID exists. Check for undefined before passing the result to api.projectiles.remove().",
    "Projectile[]": "Each array entry is a live Projectile accepted by api.projectiles.remove(). Treat the collection as a runtime snapshot because projectiles may disappear on later ticks.",
    SoundHandle: "The handle identifies one playback instance. API v1 does not document handle fields, so do not assume it has methods or mutable properties; use api.sound.stopById(), stopActive(), or stopAll() for documented stopping behavior.",
    "SoundHandle[]": "There is normally one opaque handle for each layer that began playback. The documented stop operations are api.sound.stopById(), stopActive(), and stopAll(), rather than guessed methods on the handles.",
    Structure: "This is an engine-owned structure reference. Pass it to api.structures.isType(), update(), setData(), or sprite-index helpers; do not recreate it from coordinates or assume undocumented fields are stable.",
    "Structure | null": "When non-null, pass the returned Structure directly to api.structures.isType(), update(), setData(), or sprite-index helpers. Null means the requested cell is not occupied by a structure.",
    "AssetProviderV1 | null": "The selected asset provider is read-only and may be null. API v1 does not publish provider fields here; use the value as inspection data and select providers through api.assets.selectProvider().",
    "readonly AssetProviderV1[]": "This read-only array lists the providers available for the requested kind. Do not mutate it; select a provider by its documented ID through api.assets.selectProvider().",
    "Readonly<ActiveMapV1> | null": "The result describes the running map and is read-only. Null means no map is active. Start maps with api.maps.start() rather than mutating this object.",
    "readonly Readonly<AvailableMapV1>[]": "This is a read-only list of maps the game can start. Choose an entry’s registered map ID and pass it to api.maps.start(); do not modify the returned entries.",
    "ElementDefinition | undefined": "A registered definition is returned for a known element type. Check for undefined first. The exact additional fields depend on that definition; use documented fields such as id and matterType when filtering elements.",
    SharedArray: "The concrete result is a shared typed array selected by the requested buffer config. Read and write it with normal typed-array indexing; all contexts using the same key share its contents.",
    "SharedArray | undefined": "A shared typed array is returned only when that key already exists. Check for undefined, or use api.shared.buffers.require() when the buffer should be created if missing.",
  };
  if (opaqueNotes[returnType]) return opaqueNotes[returnType];
  if (returnType === "void") {
    return method.endsWith("WhenIdle")
      ? "The JavaScript result is undefined. The important output is the queued world change, which becomes visible after the simulation reaches a safe idle boundary."
      : "The JavaScript result is undefined. Success is represented by the method’s documented side effect, so verify the affected game state when confirmation is needed.";
  }
  if (returnType === "any" || returnType === "any[]") {
    return "The API reference intentionally provides no stable shape for this value. Validate it at runtime before reading properties, and avoid treating observed internal fields as a compatibility guarantee.";
  }
  if (returnType.startsWith("Promise<")) {
    return `Await the promise to receive ${returnType.slice(8, -1)}. Handle rejection when the operation can fail because of missing content, invalid state, or loading errors.`;
  }
  if (returnType.includes(" | null")) {
    return `The method returns ${returnType.replace(" | null", "")} when it finds a result; null explicitly means no matching value is available.`;
  }
  if (returnType.includes(" | undefined")) {
    return `The method returns ${returnType.replace(" | undefined", "")} when available; undefined means the requested value was not found or has not been created.`;
  }
  if (returnType === "boolean") return "Use the boolean as a guard: true means the documented condition or action succeeded, while false means it did not.";
  if (returnType === "number") return "The number is computed from current runtime state. Its units and meaning come from the method signature and description; do not assume the example value is fixed.";
  if (returnType === "() => void") return "Store the returned function and call it once when you want to unsubscribe, unregister, or clean up the behavior created by this API call.";
  return `The returned value has the documented TypeScript type ${returnType}. The sample shows its general shape; actual values depend on the current game state and arguments.`;
}

function getMethodDocs(namespace, signature, context = "main") {
  const methodPath = getMethodPath(namespace, signature);
  const curated = METHOD_DOCS[methodPath];
  const observed = context === "main" ? RUNTIME_DOCS[methodPath] : null;
  const generic = makeGenericDocs(namespace, signature);
  return {
    description: curated?.description || generic.description,
    useCase: curated?.useCase || generic.useCase,
    example: curated?.example || makeExample(namespace, signature),
    output: observed?.output || curated?.output || makeOutput(namespace, signature),
    outputNotes: observed?.notes || makeOutputNotes(namespace, signature),
    verified: Boolean(observed),
  };
}

function parseReference(markdown) {
  const workerStart = markdown.indexOf("## Worker entry");
  const mainSource = workerStart >= 0 ? markdown.slice(0, workerStart) : markdown;
  const workerSource = workerStart >= 0 ? markdown.slice(workerStart) : "";

  const parseContext = (source, context) => {
    const found = [];
    const pattern = /### `([^`]+)`\s*\r?\n\s*```ts\s*([\s\S]*?)```/g;
    let match;
    while ((match = pattern.exec(source)) !== null) {
      const namespace = match[1];
      const signatures = match[2].split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      found.push({ namespace, context, signatures });
    }
    return found;
  };

  return [...parseContext(mainSource, "main"), ...parseContext(workerSource, "worker")];
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = entries.map((entry) => ({
    ...entry,
    signatures: entry.signatures.filter((signature) => {
      const contextMatch = activeContext === "all" || entry.context === activeContext;
      const docs = getMethodDocs(entry.namespace, signature, entry.context);
      const searchMatch = !query || `${entry.namespace} ${signature} ${docs.description} ${docs.useCase} ${docs.output} ${docs.outputNotes}`.toLowerCase().includes(query);
      return contextMatch && searchMatch;
    })
  })).filter((entry) => entry.signatures.length > 0);

  const methodCount = filtered.reduce((total, entry) => total + entry.signatures.length, 0);
  summary.textContent = `${methodCount} method${methodCount === 1 ? "" : "s"} across ${filtered.length} namespace${filtered.length === 1 ? "" : "s"}`;

  if (filtered.length === 0) {
    results.innerHTML = '<div class="api-empty">No API methods match that search and context.</div>';
    return;
  }

  results.innerHTML = filtered.map((entry) => `
    <section class="api-section" id="${entry.context}-${entry.namespace.replaceAll(".", "-")}">
      <h2>${escapeHtml(entry.namespace)}</h2>
      <div class="method-list">
        ${entry.signatures.map((signature) => {
          const docs = getMethodDocs(entry.namespace, signature, entry.context);
          return `
          <details class="method-card">
            <summary>
              <span class="context-badge">${entry.context}</span>
              <code>${escapeHtml(signature)}</code>
              <span class="expand-glyph" aria-hidden="true">+</span>
            </summary>
            <div class="method-details">
              <p class="method-description">${escapeHtml(docs.description)}</p>
              <p class="use-case"><strong>Example use case:</strong> ${escapeHtml(docs.useCase)}</p>
              <p class="example-label">Starter example</p>
              <pre class="method-example"><code>${escapeHtml(docs.example)}</code></pre>
              <p class="example-label output-label">Typical output${docs.verified ? ' <span class="verified-badge">Observed in game</span>' : ""}</p>
              <pre class="method-output"><code>${escapeHtml(docs.output)}</code></pre>
              <p class="output-notes"><strong>What this means:</strong> ${escapeHtml(docs.outputNotes)}</p>
            </div>
          </details>
        `;
        }).join("")}
      </div>
    </section>
  `).join("");
}

searchInput.addEventListener("input", render);
contextButtons.forEach((button) => button.addEventListener("click", () => {
  activeContext = button.dataset.context;
  contextButtons.forEach((candidate) => candidate.classList.toggle("active", candidate === button));
  render();
}));

if (entries.length > 0) {
  render();
} else {
  fetch("apireference.md")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then((markdown) => {
      entries = parseReference(markdown);
      render();
    })
    .catch(() => {
      summary.textContent = "API reference unavailable";
      results.innerHTML = '<div class="api-empty">The generated API data is missing. Rebuild <code>assets/api-data.js</code> from <code>apireference.md</code>.</div>';
    });
}
