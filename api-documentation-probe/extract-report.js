"use strict";

const fs = require("node:fs");
const path = require("node:path");

const defaultLog = "C:\\Users\\frank\\AppData\\Roaming\\sandustry\\logs\\main.log";
const defaultStorageDirectory = "C:\\Users\\frank\\AppData\\Roaming\\sandustry\\Local Storage\\leveldb";
const logPath = process.argv[2] || defaultLog;
const outputPath = process.argv[3] || path.join(__dirname, "..", ".research", "docs-dev", "latest-api-probe-report.json");

function extractStoredReport(storageDirectory) {
  const storagePath = fs.readdirSync(storageDirectory)
    .filter((name) => /^\d+\.log$/.test(name))
    .map((name) => ({
      path: path.join(storageDirectory, name),
      modified: fs.statSync(path.join(storageDirectory, name)).mtimeMs,
    }))
    .sort((left, right) => right.modified - left.modified)[0]?.path;
  if (!storagePath) throw new Error("No active Chromium LevelDB log file was found.");
  const bytes = fs.readFileSync(storagePath);
  const marker = Buffer.from('{"schemaVersion":1,"probeVersion"', "utf16le");
  const records = [];
  let fragmented = [];
  const blockSize = 32768;
  for (let blockStart = 0; blockStart < bytes.length; blockStart += blockSize) {
    const blockEnd = Math.min(blockStart + blockSize, bytes.length);
    let offset = blockStart;
    while (offset + 7 <= blockEnd) {
      const length = bytes.readUInt16LE(offset + 4);
      const type = bytes[offset + 6];
      if (length === 0 && type === 0) break;
      const dataStart = offset + 7;
      const dataEnd = dataStart + length;
      if (dataEnd > blockEnd) break;
      const data = bytes.subarray(dataStart, dataEnd);
      if (type === 1) records.push(data);
      else if (type === 2) fragmented = [data];
      else if (type === 3) fragmented.push(data);
      else if (type === 4) {
        fragmented.push(data);
        records.push(Buffer.concat(fragmented));
        fragmented = [];
      }
      offset = dataEnd;
    }
  }

  let source = null;
  for (let index = records.length - 1; index >= 0; index -= 1) {
    const start = records[index].lastIndexOf(marker);
    if (start >= 0) {
      source = records[index].subarray(start).toString("utf16le");
      break;
    }
  }
  if (!source) throw new Error("No API documentation probe backup was found in local storage.");
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') quoted = false;
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return JSON.parse(source.slice(0, index + 1));
    }
  }
  throw new Error("The local-storage API probe backup is incomplete.");
}

function extractLoggedReport(text) {
  const lines = text.split(/\r?\n/);

  let endIndex = -1;
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (lines[index].includes("[API_DOC_PROBE_END]")) {
      endIndex = index;
      break;
    }
  }
  if (endIndex < 0) return null;

  let startIndex = -1;
  for (let index = endIndex; index >= 0; index -= 1) {
    if (lines[index].includes("[API_DOC_PROBE_START]")) {
      startIndex = index;
      break;
    }
  }
  if (startIndex < 0) throw new Error("The completed report has no matching start marker.");

  const chunks = new Map();
  let expectedChunks = null;
  for (const line of lines.slice(startIndex + 1, endIndex)) {
    const markerIndex = line.indexOf("[API_DOC_PROBE_CHUNK]");
    if (markerIndex < 0) continue;
    const marked = line.slice(markerIndex);
    const match = marked.match(/^\[API_DOC_PROBE_CHUNK\]\s+(\d+)\/(\d+)\s+([\s\S]*)$/);
    if (!match) continue;
    const index = Number(match[1]);
    expectedChunks = Number(match[2]);
    chunks.set(index, match[3]);
  }

  if (!expectedChunks || chunks.size !== expectedChunks) {
    throw new Error(`Incomplete report: found ${chunks.size} of ${expectedChunks || "unknown"} chunks.`);
  }
  const json = Array.from({ length: expectedChunks }, (_, index) => chunks.get(index + 1)).join("");
  return JSON.parse(json);
}

const loggedReport = extractLoggedReport(fs.readFileSync(logPath, "utf8"));
const report = loggedReport || extractStoredReport(defaultStorageDirectory);
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const successfulMain = report.probes.filter((probe) => probe.status === "ok").length;
const failedMain = report.probes.length - successfulMain;
console.log(`Extracted API probe ${report.probeVersion} to ${outputPath}`);
console.log(`${successfulMain} successful main probes, ${failedMain} main errors, ${report.workerReportCount} worker reports.`);
