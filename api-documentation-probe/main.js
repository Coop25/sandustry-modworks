await (async () => {
  "use strict";

  const api = sandkit.api;
  const MOD_ID = "cooper.api-documentation-probe";
  const VERSION = "0.2.0";
  const WORKER_REQUEST_EVENT = `${MOD_ID}:request-worker-report`;
  const WORKER_REPORT_EVENT = `${MOD_ID}:worker-report`;
  const MAX_DEPTH = 4;
  const MAX_PROPERTIES = 32;
  const MAX_ARRAY_ITEMS = 12;
  const LOG_CHUNK_SIZE = 12000;
  const PROBE_DELAY_MS = 60000;
  const WARNING_LEAD_MS = 10000;
  const workerReports = new Map();

  function typeName(value) {
    try {
      return value?.constructor?.name || Object.prototype.toString.call(value).slice(8, -1);
    } catch {
      return "Unknown";
    }
  }

  function prototypeMethods(value) {
    const methods = new Set();
    try {
      let prototype = Object.getPrototypeOf(value);
      let levels = 0;
      while (prototype && prototype !== Object.prototype && levels < 3) {
        for (const name of Object.getOwnPropertyNames(prototype)) {
          if (name === "constructor") continue;
          const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
          if (typeof descriptor?.value === "function") methods.add(name);
        }
        prototype = Object.getPrototypeOf(prototype);
        levels += 1;
      }
    } catch {
      // Exotic engine objects may reject prototype inspection.
    }
    return [...methods].sort();
  }

  function snapshot(value, depth = 0, seen = new WeakMap(), path = "$result") {
    if (value === null) return null;
    if (value === undefined) return { $value: "undefined" };
    if (typeof value === "number" && !Number.isFinite(value)) return { $value: String(value) };
    if (typeof value === "bigint") return { $type: "bigint", $value: String(value) };
    if (typeof value === "symbol") return { $type: "symbol", $value: String(value) };
    if (typeof value === "function") {
      return {
        $type: "Function",
        name: value.name || null,
        arity: value.length,
        prototypeMethods: prototypeMethods(value),
      };
    }
    if (typeof value !== "object") return value;
    if (seen.has(value)) return { $circularReference: seen.get(value) };
    seen.set(value, path);

    const result = { $type: typeName(value) };
    const methods = prototypeMethods(value);
    if (methods.length > 0) result.$prototypeMethods = methods;
    if (depth >= MAX_DEPTH) {
      result.$truncated = `Maximum snapshot depth ${MAX_DEPTH} reached`;
      return result;
    }

    if (Array.isArray(value)) {
      result.length = value.length;
      result.items = value.slice(0, MAX_ARRAY_ITEMS).map(
        (item, index) => snapshot(item, depth + 1, seen, `${path}[${index}]`),
      );
      if (value.length > MAX_ARRAY_ITEMS) result.$omittedItems = value.length - MAX_ARRAY_ITEMS;
      return result;
    }

    if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
      result.length = value.length;
      result.items = Array.from(value.slice(0, MAX_ARRAY_ITEMS));
      if (value.length > MAX_ARRAY_ITEMS) result.$omittedItems = value.length - MAX_ARRAY_ITEMS;
      return result;
    }

    if (value instanceof Set) {
      const items = [...value].slice(0, MAX_ARRAY_ITEMS);
      result.size = value.size;
      result.items = items.map((item, index) => snapshot(item, depth + 1, seen, `${path}.set[${index}]`));
      return result;
    }

    if (value instanceof Map) {
      const entries = [...value.entries()].slice(0, MAX_ARRAY_ITEMS);
      result.size = value.size;
      result.entries = entries.map(([key, item], index) => [
        snapshot(key, depth + 1, seen, `${path}.mapKey[${index}]`),
        snapshot(item, depth + 1, seen, `${path}.mapValue[${index}]`),
      ]);
      return result;
    }

    try {
      const descriptors = Object.getOwnPropertyDescriptors(value);
      const keys = Reflect.ownKeys(descriptors).slice(0, MAX_PROPERTIES);
      result.properties = {};
      for (const key of keys) {
        const printableKey = typeof key === "symbol" ? String(key) : key;
        const descriptor = descriptors[key];
        if ("value" in descriptor) {
          result.properties[printableKey] = snapshot(
            descriptor.value,
            depth + 1,
            seen,
            `${path}.${printableKey}`,
          );
        } else {
          result.properties[printableKey] = {
            $accessor: true,
            getter: typeof descriptor.get === "function",
            setter: typeof descriptor.set === "function",
          };
        }
      }
      const totalKeys = Reflect.ownKeys(descriptors).length;
      if (totalKeys > MAX_PROPERTIES) result.$omittedProperties = totalKeys - MAX_PROPERTIES;
    } catch (error) {
      result.$inspectionError = error instanceof Error ? error.message : String(error);
    }
    return result;
  }

  function probe(target, callback, input) {
    try {
      return {
        target,
        input: input === undefined ? undefined : snapshot(input),
        status: "ok",
        output: snapshot(callback()),
      };
    } catch (error) {
      return {
        target,
        input: input === undefined ? undefined : snapshot(input),
        status: "error",
        error: {
          name: error?.name || "Error",
          message: error?.message || String(error),
        },
      };
    }
  }

  function addProbe(report, target, callback, input) {
    report.probes.push(probe(target, callback, input));
  }

  function afterTicks(count, callback) {
    if (count <= 0) {
      callback();
      return;
    }
    api.schedule.nextTick(() => afterTicks(count - 1, callback));
  }

  function buildMainReport() {
    const report = {
      schemaVersion: 1,
      probeVersion: VERSION,
      context: "main",
      capturedAt: new Date().toISOString(),
      safetyMode: "read-only automatic probes",
      probes: [],
    };

    let mouseCell = { x: 0, y: 0 };
    let playerPosition = { x: 0, y: 0 };
    let cellId = 0;
    let elementType = null;

    addProbe(report, "api.gameConfig.getAll()", () => api.gameConfig.getAll());
    addProbe(report, "api.action.getActive()", () => api.action.getActive());
    addProbe(report, "api.action.getSelected()", () => api.action.getSelected());
    addProbe(report, "api.assets.getUrl('preview.png')", () => api.assets.getUrl("preview.png"));
    addProbe(report, "api.scene.getActive()", () => api.scene.getActive());
    addProbe(report, "api.input.getMouseCellPosition()", () => {
      mouseCell = api.input.getMouseCellPosition();
      return mouseCell;
    });
    addProbe(report, "api.player.getWorldPosition()", () => {
      playerPosition = api.player.getWorldPosition();
      return playerPosition;
    });
    addProbe(report, "api.player.isOnGround()", () => api.player.isOnGround());
    addProbe(report, "api.player.isWorldPositionClear(playerX, playerY)", () => (
      api.player.isWorldPositionClear(playerPosition.x, playerPosition.y)
    ), playerPosition);
    addProbe(report, "api.world.getCellIdAtCell(mouseX, mouseY)", () => {
      cellId = api.world.getCellIdAtCell(mouseCell.x, mouseCell.y);
      return cellId;
    }, mouseCell);
    addProbe(report, "api.world.isCellEmptyAtCell(mouseX, mouseY)", () => (
      api.world.isCellEmptyAtCell(mouseCell.x, mouseCell.y)
    ), mouseCell);
    addProbe(report, "api.world.isTerrainAtCell(mouseX, mouseY)", () => (
      api.world.isTerrainAtCell(mouseCell.x, mouseCell.y)
    ), mouseCell);
    addProbe(report, "api.elements.getRegisteredTypes()", () => api.elements.getRegisteredTypes());
    addProbe(report, "api.elements.getTypeAtCell(mouseX, mouseY)", () => {
      elementType = api.elements.getTypeAtCell(mouseCell.x, mouseCell.y);
      return elementType;
    }, mouseCell);
    addProbe(report, "api.elements.getResolvedTypeAtCell(mouseX, mouseY)", () => (
      api.elements.getResolvedTypeAtCell(mouseCell.x, mouseCell.y)
    ), mouseCell);
    addProbe(report, "api.elements.getInfoAtCell(mouseX, mouseY)", () => (
      api.elements.getInfoAtCell(mouseCell.x, mouseCell.y)
    ), mouseCell);
    addProbe(report, "api.elements.getMatterTypeAtCell(mouseX, mouseY)", () => (
      api.elements.getMatterTypeAtCell(mouseCell.x, mouseCell.y)
    ), mouseCell);
    addProbe(report, "api.elements.getVelocityAtCell(mouseX, mouseY)", () => (
      api.elements.getVelocityAtCell(mouseCell.x, mouseCell.y)
    ), mouseCell);
    addProbe(report, "api.elements.getDataFieldAtCell(mouseX, mouseY, 1)", () => (
      api.elements.getDataFieldAtCell(mouseCell.x, mouseCell.y, 1)
    ), { ...mouseCell, fieldNumber: 1 });
    if (elementType !== null) {
      addProbe(report, "api.elements.getNameByType(elementType)", () => api.elements.getNameByType(elementType), elementType);
      addProbe(report, "api.elements.getDefinitionByType(elementType)", () => api.elements.getDefinitionByType(elementType), elementType);
      addProbe(report, "api.elements.getResolvedTypeFromCellId(cellId)", () => api.elements.getResolvedTypeFromCellId(cellId), cellId);
    }
    addProbe(report, "api.terrains.getDataAtCell(mouseX, mouseY)", () => (
      api.terrains.getDataAtCell(mouseCell.x, mouseCell.y)
    ), mouseCell);
    addProbe(report, "api.structures.getAtCell(mouseX, mouseY)", () => (
      api.structures.getAtCell(mouseCell.x, mouseCell.y)
    ), mouseCell);
    addProbe(report, "api.structures.getUnlockedTypes()", () => api.structures.getUnlockedTypes());
    addProbe(report, "api.energy.getNetworkAtCell(mouseX, mouseY)", () => (
      api.energy.getNetworkAtCell(mouseCell.x, mouseCell.y)
    ), mouseCell);
    addProbe(report, "api.energy.getNetworkFreeCapacityAtCell(mouseX, mouseY)", () => (
      api.energy.getNetworkFreeCapacityAtCell(mouseCell.x, mouseCell.y)
    ), mouseCell);
    addProbe(report, "api.items.getActive()", () => api.items.getActive());
    addProbe(report, "api.maps.getActive()", () => api.maps.getActive());
    addProbe(report, "api.maps.getAvailable()", () => api.maps.getAvailable());
    addProbe(report, "api.projectiles.getAll()", () => api.projectiles.getAll());
    addProbe(report, "api.world.pickups.getAll()", () => api.world.pickups.getAll());
    addProbe(report, "api.settings.getAll()", () => api.settings.getAll());
    addProbe(report, "api.shared.buffers.get('documentation-probe:missing')", () => (
      api.shared.buffers.get("documentation-probe:missing")
    ));
    addProbe(report, "api.rendering.getDrawPositionAtCell(mouseX, mouseY)", () => (
      api.rendering.getDrawPositionAtCell(mouseCell.x, mouseCell.y)
    ), mouseCell);
    addProbe(report, "api.rendering.getGridMetrics()", () => api.rendering.getGridMetrics());
    addProbe(report, "api.rendering.getOverlayViewportSize()", () => api.rendering.getOverlayViewportSize());
    addProbe(report, "api.rendering.withOverlayContext(context => snapshot(context))", () => (
      api.rendering.withOverlayContext((context) => snapshot(context))
    ));
    addProbe(report, "api.raycast.castFromWorld(playerX, playerY, 0, 64)", () => (
      api.raycast.castFromWorld(playerPosition.x, playerPosition.y, 0, 64)
    ), { ...playerPosition, angle: 0, maxDistance: 64 });
    addProbe(report, "api.sound.calculateDistanceOptionsAtWorld(playerX, playerY, 0.5)", () => (
      api.sound.calculateDistanceOptionsAtWorld(playerPosition.x, playerPosition.y, 0.5)
    ), { ...playerPosition, baseVolume: 0.5 });
    addProbe(report, "api.patterns.createCircle(5)", () => api.patterns.createCircle(5), 5);
    addProbe(report, "api.utils.getDistance({0,0}, {3,4})", () => api.utils.getDistance({ x: 0, y: 0 }, { x: 3, y: 4 }));
    addProbe(report, "api.utils.getDirection({0,0}, {3,4})", () => api.utils.getDirection({ x: 0, y: 0 }, { x: 3, y: 4 }));
    addProbe(report, "api.utils.getAngle({0,0}, {3,4})", () => api.utils.getAngle({ x: 0, y: 0 }, { x: 3, y: 4 }));
    addProbe(report, "api.utils.getCoordinatesBetweenPoints({0,0}, {3,4})", () => (
      api.utils.getCoordinatesBetweenPoints({ x: 0, y: 0 }, { x: 3, y: 4 })
    ));
    addProbe(report, "api.i18n.getLocale()", () => api.i18n.getLocale());
    addProbe(report, "api.i18n.getLanguages()", () => api.i18n.getLanguages());
    addProbe(report, "api.i18n.getAvailableLocales()", () => api.i18n.getAvailableLocales());
    addProbe(report, "api.i18n.getGlobals()", () => api.i18n.getGlobals());
    addProbe(report, "api.i18n.formatNumber(12345.67)", () => api.i18n.formatNumber(12345.67), 12345.67);
    addProbe(report, "api.i18n.key('probe', 'example', 'name')", () => api.i18n.key("probe", "example", "name"));
    addProbe(report, "api.i18n.translatable('probe|example', 'Example')", () => api.i18n.translatable("probe|example", "Example"));
    addProbe(report, "api.time.getTimeMs()", () => api.time.getTimeMs());
    addProbe(report, "api.time.getTick()", () => api.time.getTick());
    addProbe(report, "api.tools.grabber.getSize()", () => api.tools.grabber.getSize());
    addProbe(report, "api.tools.grabber.isActive()", () => api.tools.grabber.isActive());
    addProbe(report, "api.tools.grabber.isLoaded()", () => api.tools.grabber.isLoaded());
    addProbe(report, "api.random.int(10, 20)", () => api.random.int(10, 20));
    addProbe(report, "api.random.float(0.25, 0.75)", () => api.random.float(0.25, 0.75));

    report.sampleContext = { mouseCell, playerPosition, cellId, elementType };

    return report;
  }

  function finish(mainReport) {
    const report = {
      ...mainReport,
      workerReports: [...workerReports.values()],
      workerReportCount: workerReports.size,
    };
    const json = JSON.stringify(report);
    const chunks = [];
    for (let offset = 0; offset < json.length; offset += LOG_CHUNK_SIZE) {
      chunks.push(json.slice(offset, offset + LOG_CHUNK_SIZE));
    }
    api.storage.local.set("latest-report", report);
    console.log(`[API_DOC_PROBE_START] version=${VERSION} chunks=${chunks.length} length=${json.length}`);
    for (let index = 0; index < chunks.length; index += 1) {
      console.log(`[API_DOC_PROBE_CHUNK] ${index + 1}/${chunks.length} ${chunks[index]}`);
    }
    console.log(`[API_DOC_PROBE_END] version=${VERSION}`);
    api.ui.toast(
      `API documentation probe finished: ${report.probes.length} main calls, ${workerReports.size} worker report(s).`,
    );
  }

  api.events.on(WORKER_REPORT_EVENT, (payload) => {
    const key = `${payload?.workerIndex ?? "unknown"}:${workerReports.size}`;
    workerReports.set(key, payload);
  });

  api.ui.toast("API documentation probe armed. Cell inspection will run in one minute.");

  setTimeout(() => {
    api.ui.toast(
      "API probe runs in 10 seconds. Place your mouse over an element, terrain tile, or structure now.",
    );
  }, PROBE_DELAY_MS - WARNING_LEAD_MS);

  setTimeout(() => {
    const mainReport = buildMainReport();
    api.ui.toast(
      `API probe captured cell (${mainReport.sampleContext.mouseCell.x}, ${mainReport.sampleContext.mouseCell.y}).`,
    );
    api.events.emit(WORKER_REQUEST_EVENT, {
      probeVersion: VERSION,
      sampleContext: mainReport.sampleContext,
    });
    afterTicks(12, () => finish(mainReport));
  }, PROBE_DELAY_MS);
})();
