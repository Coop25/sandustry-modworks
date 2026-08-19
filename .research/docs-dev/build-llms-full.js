"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const docs = path.join(root, "docs");
const output = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(docs, "llms-full.txt");
const sources = [
  ["Practical AI Guide", "ai-context.md"],
  ["Exact Sandkit API Reference", "apireference.md"],
  ["Mod Folder Structure", "modstructure.md"],
  ["Texture and Configuration Overrides", "textureconfig.md"],
  ["Bundle Patching", "patching.md"],
  ["Custom Maps", "custommaps.md"],
];

const header = [
  "# Complete Sandustry Modding Context",
  "",
  "> Single-file AI context for Sandustry mods using Sandkit API v1.",
  "> Prefer exact signatures in the API section and never assume main APIs exist in worker context or vice versa.",
  "",
].join("\n");

const body = sources.map(([title, relativePath]) => {
  const content = fs.readFileSync(path.join(docs, relativePath), "utf8").trim();
  return `\n---\n\n# ${title}\n\n${content}\n`;
}).join("");

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${header}${body}`, "utf8");
console.log(`Built ${output} from ${sources.length} documentation sources.`);
