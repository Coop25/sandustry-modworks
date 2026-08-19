import { extractFile, listPackage } from "file:///C:/Users/frank/AppData/Local/pnpm/store/v11/links/@electron/asar/4.2.1/ad7d57c74d72b12551f9befa52a310ae0823201918dddfa40e808ec232157026/node_modules/@electron/asar/lib/asar.js";

const archive = "G:/SteamLibrary/steamapps/common/Sandustry/resources/app.asar";
const target = process.argv[2] || "local-mod-publisher.js";
const listedPath = listPackage(archive).find((file) => file.endsWith(target));
if (!listedPath) throw new Error(`${target} was not found`);

const archivePath = listedPath.replace(/^[/\\]+/, "");
process.stdout.write(extractFile(archive, archivePath).toString("utf8"));
