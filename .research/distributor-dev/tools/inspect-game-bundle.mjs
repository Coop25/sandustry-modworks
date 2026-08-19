import { extractFile, listPackage } from "file:///C:/Users/frank/AppData/Local/pnpm/store/v11/links/@electron/asar/4.2.1/ad7d57c74d72b12551f9befa52a310ae0823201918dddfa40e808ec232157026/node_modules/@electron/asar/lib/asar.js";

const archive = "G:/SteamLibrary/steamapps/common/Sandustry/resources/app.asar";
const listedPath = listPackage(archive).find((file) => file.endsWith("bundle.js"));
if (!listedPath) throw new Error("bundle.js was not found");

const source = extractFile(archive, listedPath.replace(/^[/\\]+/, "")).toString("utf8");
const defaultNeedles = [
  "filterRightMk2",
  "filterWallMk2",
  "filter_right_mk2",
  "filter_wall_mk2",
  "splitter_left",
  "splitter_right",
  "registerNode",
  "preferredPosition",
  "AdvancedFilters",
];
const needles = process.argv.length > 2 ? process.argv.slice(2) : defaultNeedles;

for (const needle of needles) {
  console.log(`\n===== ${needle} =====`);
  let offset = 0;
  let found = 0;
  while (found < 5) {
    const index = source.indexOf(needle, offset);
    if (index < 0) break;
    console.log(source.slice(Math.max(0, index - 900), index + 1600));
    offset = index + needle.length;
    found += 1;
  }
}
