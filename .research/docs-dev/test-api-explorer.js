"use strict";

const fs = require("node:fs");
const vm = require("node:vm");

function makeElement(dataset = {}) {
  const listeners = new Map();
  return {
    dataset,
    value: "",
    textContent: "",
    innerHTML: "",
    classList: { toggle() {} },
    addEventListener(event, callback) { listeners.set(event, callback); },
    dispatch(event) { listeners.get(event)?.(); },
  };
}

const search = makeElement();
const results = makeElement();
const summary = makeElement();
const contextButtons = ["all", "main", "worker"].map(
  (context) => makeElement({ context }),
);
const sandbox = {
  window: {},
  document: {
    querySelector(selector) {
      return {
        "#api-search": search,
        "#api-results": results,
        "#api-summary": summary,
      }[selector] || null;
    },
    querySelectorAll(selector) {
      return selector === "[data-context]" ? contextButtons : [];
    },
  },
  fetch() {
    throw new Error("The bundled explorer must not fetch at runtime.");
  },
};

vm.runInNewContext(
  fs.readFileSync("docs/assets/api-data.js", "utf8"),
  sandbox,
);
vm.runInNewContext(
  fs.readFileSync("docs/assets/api.js", "utf8"),
  sandbox,
);

if (!summary.textContent.startsWith("372 methods")) {
  throw new Error(`Unexpected initial summary: ${summary.textContent}`);
}
if (!results.innerHTML.includes("main-api-elements")) {
  throw new Error("Initial API namespace render is missing.");
}
if (!results.innerHTML.includes('<details class="method-card">')) {
  throw new Error("Methods are not rendered as expandable details.");
}
if (!results.innerHTML.includes("Example use case:")) {
  throw new Error("Method use-case guidance is missing.");
}
if (!results.innerHTML.includes("Starter example")) {
  throw new Error("Method starter examples are missing.");
}
if (!results.innerHTML.includes("Typical output")) {
  throw new Error("Method output examples are missing.");
}
if (!results.innerHTML.includes("Observed in game")) {
  throw new Error("Runtime-verified output markers are missing.");
}
const detailCount = (results.innerHTML.match(/<details class="method-card">/g) || []).length;
const descriptionCount = (results.innerHTML.match(/class="method-description"/g) || []).length;
const useCaseCount = (results.innerHTML.match(/class="use-case"/g) || []).length;
const outputCount = (results.innerHTML.match(/class="method-output"/g) || []).length;
const outputNotesCount = (results.innerHTML.match(/class="output-notes"/g) || []).length;
if (detailCount !== 372 || descriptionCount !== 372 || useCaseCount !== 372 || outputCount !== 372 || outputNotesCount !== 372) {
  throw new Error(
    `Expected documentation for 372 methods; got ${detailCount} cards, ` +
    `${descriptionCount} descriptions, ${useCaseCount} use cases, ${outputCount} outputs, ` +
    `and ${outputNotesCount} output explanations.`,
  );
}

search.value = "getTypeFromId";
search.dispatch("input");
if (!results.innerHTML.includes("resolve it instead of hard-coding it")) {
  throw new Error("Curated runtime output guidance is missing.");
}

search.value = "getActive(): Scene";
search.dispatch("input");
if (!results.innerHTML.includes("Numeric Scene value observed in game") || !results.innerHTML.includes("runtime returned a number")) {
  throw new Error("Runtime-verified Scene guidance is missing.");
}

search.value = "getInfoAtCell";
search.dispatch("input");
if (!results.innerHTML.includes("elementIndex: 1092593") || !results.innerHTML.includes("complete plain-object shape")) {
  throw new Error("Occupied-cell runtime guidance is missing.");
}

search.value = "toast";
search.dispatch("input");
if (!results.innerHTML.includes("api.ui.toast")) {
  throw new Error("Search did not find api.ui.toast.");
}
if (results.innerHTML.includes("api.elements.register")) {
  throw new Error("Search results were not filtered.");
}

search.value = "";
contextButtons[2].dispatch("click");
if (!results.innerHTML.includes("<span class=\"context-badge\">worker</span>")) {
  throw new Error("Worker filter produced no worker methods.");
}
if (results.innerHTML.includes("<span class=\"context-badge\">main</span>")) {
  throw new Error("Worker filter retained main methods.");
}

console.log("API explorer render, search, and context filters passed.");
