import { writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractFile, listPackage } from "file:///C:/Users/frank/AppData/Local/pnpm/store/v11/links/@electron/asar/4.2.1/ad7d57c74d72b12551f9befa52a310ae0823201918dddfa40e808ec232157026/node_modules/@electron/asar/lib/asar.js";

const archive = "G:/SteamLibrary/steamapps/common/Sandustry/resources/app.asar";
const outputDirectory = fileURLToPath(new URL("../assets/", import.meta.url));
const wanted = new Set([
  "filter_left_mk2.png",
  "filter_right_mk2.png",
  "filter_wall_mk2.png",
  "conveyor_left_mk2.png",
  "launcher_mk2.png",
  "splitter_left.png",
  "splitter_right.png",
]);

const matches = listPackage(archive).filter((file) => wanted.has(basename(file)));
for (const file of matches) {
  const archivePath = file.replace(/^[/\\]+/, "");
  writeFileSync(join(outputDirectory, basename(file)), extractFile(archive, archivePath));
  console.log(file);
}

if (matches.length !== wanted.size) {
  const found = new Set(matches.map((file) => basename(file)));
  const missing = [...wanted].filter((file) => !found.has(file));
  throw new Error(`Missing game assets: ${missing.join(", ")}`);
}
