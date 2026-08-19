"use strict";

const fs = require("node:fs");
const path = require("node:path");

const sourcePath = path.resolve(process.argv[2] || "apireference.md");
const outputPath = path.resolve(
  process.argv[3] || "docs/assets/api-data.js",
);
const markdown = fs.readFileSync(sourcePath, "utf8");
const workerStart = markdown.indexOf("## Worker entry");
const mainSource = workerStart >= 0 ? markdown.slice(0, workerStart) : markdown;
const workerSource = workerStart >= 0 ? markdown.slice(workerStart) : "";

function parseContext(source, context) {
  const entries = [];
  const pattern = /### `([^`]+)`\s*\r?\n\s*```ts\s*([\s\S]*?)```/g;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    entries.push({
      namespace: match[1],
      context,
      signatures: match[2]
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    });
  }
  return entries;
}

const entries = [
  ...parseContext(mainSource, "main"),
  ...parseContext(workerSource, "worker"),
];
const output = [
  "// Generated from apireference.md. Run build-api-data.js after editing the reference.",
  `window.SANDKIT_API_ENTRIES = ${JSON.stringify(entries, null, 2)};`,
  "",
].join("\n");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output, "utf8");

const methodCount = entries.reduce(
  (total, entry) => total + entry.signatures.length,
  0,
);
console.log(`Generated ${entries.length} namespaces and ${methodCount} signatures.`);
