"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const placed = [
  { x: 0, y: 4, type: "distributor" },
  { x: 4, y: 4, type: "distributor" },
  { x: 8, y: 4, type: "distributor" },
];
const cells = new Map([
  ["0,3", 10],
  ["4,3", 20],
  ["8,3", 30],
]);
let definition;
let process;
let loadStatus;
let loadedSpritePath;
let techRegistration;
let tick = 1;
let structureLookups = 0;
let membershipChecks = 0;

global.sandkit = {
  api: {
    sprites: {
      loadFromMod: async (_id, path) => {
        loadedSpritePath = path;
      },
    },
    elements: {
      getTypeFromId: (elementId) => elementId === "fire" ? 50 : null,
      getDefinitionByType: (elementType) => ({
        matterType: elementType === 40 || elementType === 50 ? 4 : 1,
      }),
    },
    structures: {
      isType: (structure, id) => structure && structure.type === id,
      getAtCell: (x, y) => {
        structureLookups += 1;
        return placed.find((item) => item.x === x && item.y === y);
      },
      isTypeAtCell: (x, y, id) => {
        membershipChecks += 1;
        return placed.some(
          (item) => item.x === x && item.y === y && item.type === id,
        );
      },
      register: (value) => {
        definition = value;
      },
      isUnlockedByType: () => true,
      addProcessor: (_id, processor) => {
        process = processor.process;
      },
    },
    tech: {
      registerNode: (id, techDefinition, options) => {
        techRegistration = { id, techDefinition, options };
        return { row: 10, col: 2 };
      },
    },
    storage: {
      set: (_modId, _key, value) => {
        loadStatus = value;
      },
    },
    time: {
      getTick: () => tick,
    },
  },
};

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

const processor = {
  getElementTypeAtCell: (x, y) => cells.get(`${x},${y}`) ?? null,
  isCellEmpty: (x, y) => !cells.has(`${x},${y}`),
  commit: (mutations) => {
    const [remove, create] = mutations;
    const removeKey = `${remove.cellX},${remove.cellY}`;
    const createKey = `${create.cellX},${create.cellY}`;
    if (cells.get(removeKey) !== remove.expectedElementType || cells.has(createKey)) {
      return false;
    }
    cells.delete(removeKey);
    cells.set(createKey, create.elementType);
    return true;
  },
};

async function run() {
  await new AsyncFunction(
    "sandkit",
    fs.readFileSync(path.resolve(__dirname, "../../distributor/main.js"), "utf8"),
  )(global.sandkit);

  for (const structure of placed) process(structure, processor);

const expectedOutputs = new Map([
  ["0,8", 10],
  ["4,8", 20],
  ["8,8", 30],
]);
for (const [cell, type] of expectedOutputs) {
  if (cells.get(cell) !== type) {
    throw new Error(`Expected element ${type} at ${cell}; got ${cells.get(cell)}`);
  }
}

// Once topology is cached, invoking every placed block while idle must not
// traverse the connected network again.
tick += 1;
structureLookups = 0;
for (const structure of placed) process(structure, processor);
if (structureLookups !== 0) {
  throw new Error(`Idle callbacks rebuilt topology (${structureLookups} lookups).`);
}

// A scheduled topology check should validate cached members without walking
// all eight neighbor positions around every block.
tick += 59;
structureLookups = 0;
membershipChecks = 0;
for (const structure of placed) process(structure, processor);
if (membershipChecks !== placed.length || structureLookups !== 0) {
  throw new Error(
    `Topology validation used ${membershipChecks} membership checks and ` +
    `${structureLookups} neighbor lookups.`,
  );
}

// A diagonal drag must form one network too. Material arriving above the
// diagonally connected second block should be eligible for the first output.
placed.splice(
  0,
  placed.length,
  { x: 0, y: 4, type: "distributor" },
  { x: 4, y: 8, type: "distributor" },
);
cells.clear();
cells.set("4,7", 99);
tick += 1;
for (const structure of placed) process(structure, processor);
tick += 1;
for (const structure of placed) process(structure, processor);
if (cells.get("0,8") !== 99) {
  throw new Error("Diagonally dragged Distributors did not join one network.");
}

// Removing a cached coordinator must not leave the surviving network dormant.
placed.splice(
  0,
  placed.length,
  { x: 100, y: 4, type: "distributor" },
  { x: 104, y: 4, type: "distributor" },
);
cells.clear();
tick += 1;
for (const structure of placed) process(structure, processor);
placed.shift();
cells.set("104,3", 77);
tick += 3;
for (const structure of placed) process(structure, processor);
if (cells.get("104,8") !== 77) {
  throw new Error("Network did not recover after its coordinator was removed.");
}

// Gas may enter from below and distribute upward. Other matter types at the
// bottom must remain untouched.
placed.splice(
  0,
  placed.length,
  { x: 200, y: 4, type: "distributor" },
  { x: 204, y: 4, type: "distributor" },
);
cells.clear();
cells.set("200,8", 40);
cells.set("204,8", 41);
tick += 1;
for (const structure of placed) process(structure, processor);
if (cells.get("200,3") !== 40) {
  throw new Error("Gas entering from below was not distributed upward.");
}
if (cells.get("204,8") !== 41) {
  throw new Error("Non-gas material was incorrectly accepted from below.");
}

// A gas entering normally from the top must move down exactly once rather than
// being captured by the reverse route during the same processor pass.
placed.splice(0, placed.length, { x: 220, y: 4, type: "distributor" });
cells.clear();
cells.set("220,3", 40);
tick += 1;
for (const structure of placed) process(structure, processor);
if (cells.get("220,8") !== 40 || cells.has("220,3")) {
  throw new Error("Top-entering gas bounced through the reverse route.");
}

// Fire is blacklisted in both directions. A valid material in another lane
// must still be found and routed instead of fire blocking the input scan.
placed.splice(0, placed.length, { x: 240, y: 4, type: "distributor" });
cells.clear();
cells.set("240,3", 50);
cells.set("241,3", 10);
tick += 1;
for (const structure of placed) process(structure, processor);
if (cells.get("240,3") !== 50 || cells.get("241,8") !== 10) {
  throw new Error("Fire blacklist interfered with normal top input routing.");
}

placed.splice(0, placed.length, { x: 260, y: 4, type: "distributor" });
cells.clear();
cells.set("260,8", 50);
tick += 1;
for (const structure of placed) process(structure, processor);
if (cells.get("260,8") !== 50 || cells.has("260,3")) {
  throw new Error("Fire was incorrectly accepted by the reverse gas route.");
}

if (definition.shape.length !== 4 || definition.shape.some((row) => row.length !== 4)) {
  throw new Error("Distributor is not a 4x4 square.");
}
if (definition.render.imageName !== "distributor") {
  throw new Error("Distributor is not using its custom square sprite.");
}
if (definition.buildModes.length !== 1) {
  throw new Error("Distributor should expose one unrestricted drag mode.");
}
const dragDirections = definition.buildModes[0].directions;
for (const direction of ["horizontal", "vertical", "diagonal"]) {
  if (!dragDirections.includes(direction)) {
    throw new Error(`Distributor cannot drag ${direction}.`);
  }
}
for (const angle of [-180, -135, -90, -45, 0, 45, 90, 135, 180]) {
  if (!definition.variants[0].angles.includes(angle)) {
    throw new Error(`Distributor is missing placement angle ${angle}.`);
  }
}
if (loadedSpritePath !== "assets/distributor.png") {
  throw new Error(`Unexpected sprite path: ${loadedSpritePath}`);
}
if (definition.name !== "Distributor") throw new Error(definition.name);
if (techRegistration.id !== "cooper.distributor.tech") {
  throw new Error(`Unexpected tech ID: ${techRegistration.id}`);
}
if (techRegistration.options.parentId !== 64) {
  throw new Error(`Unexpected tech parent: ${techRegistration.options.parentId}`);
}
if (techRegistration.techDefinition.cost !== 2000) {
  throw new Error(`Unexpected tech cost: ${techRegistration.techDefinition.cost}`);
}
if (techRegistration.techDefinition.unlocks.structures[0] !== "distributor") {
  throw new Error("Distributor research does not unlock the building.");
}
if (loadStatus.processor !== "registered") throw new Error(loadStatus.processor);
if (loadStatus.version !== "1.4.2") throw new Error(loadStatus.version);

console.log("distributor test passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
