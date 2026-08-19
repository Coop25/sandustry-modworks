"use strict";

const fs = require("node:fs");
const path = require("node:path");

const gameArchive = "G:/SteamLibrary/steamapps/common/Sandustry/resources/app.asar";
const workshopMods = require(`${gameArchive}/workshop-mods.js`);
const publisher = require(`${gameArchive}/local-mod-publisher.js`);
const packagePath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, "../../distributor");

const loaded = workshopMods.loadCandidate(fs, {
  itemId: null,
  folder: packagePath,
  discoveredVia: ["local"],
});

if (!loaded.record || loaded.diagnostics.length > 0) {
  console.error(JSON.stringify(loaded.diagnostics, null, 2));
  process.exitCode = 1;
  return;
}

const preview = publisher.validatePreview(packagePath, fs);
if (!preview.ok) {
  console.error(JSON.stringify(preview, null, 2));
  process.exitCode = 1;
  return;
}

console.log(JSON.stringify({
  valid: true,
  folder: path.basename(packagePath),
  manifest: loaded.record.manifest,
  preview: path.basename(preview.path),
}, null, 2));
