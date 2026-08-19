(() => {
  "use strict";

  const api = sandkit.api;
  const MOD_ID = "cooper.api-documentation-probe";
  const WORKER_REQUEST_EVENT = `${MOD_ID}:request-worker-report`;
  const WORKER_REPORT_EVENT = `${MOD_ID}:worker-report`;

  function snapshot(value, depth = 0, seen = new WeakSet()) {
    if (value === undefined) return { $value: "undefined" };
    if (value === null || typeof value !== "object") return value;
    if (seen.has(value)) return { $circularReference: true };
    seen.add(value);
    const type = (() => {
      try { return value?.constructor?.name || "Object"; } catch { return "Unknown"; }
    })();
    if (depth >= 3) return { $type: type, $truncated: true };
    if (Array.isArray(value)) {
      return {
        $type: type,
        length: value.length,
        items: value.slice(0, 8).map((item) => snapshot(item, depth + 1, seen)),
      };
    }
    if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
      return { $type: type, length: value.length, items: Array.from(value.slice(0, 8)) };
    }
    const result = { $type: type, properties: {} };
    try {
      const descriptors = Object.getOwnPropertyDescriptors(value);
      for (const key of Reflect.ownKeys(descriptors).slice(0, 24)) {
        const name = typeof key === "symbol" ? String(key) : key;
        const descriptor = descriptors[key];
        result.properties[name] = "value" in descriptor
          ? snapshot(descriptor.value, depth + 1, seen)
          : { $accessor: true, getter: Boolean(descriptor.get), setter: Boolean(descriptor.set) };
      }
    } catch (error) {
      result.$inspectionError = error?.message || String(error);
    }
    return result;
  }

  function safe(target, callback) {
    try {
      const output = callback();
      return {
        target,
        status: "ok",
        output: snapshot(output),
        outputType: output === null ? "null" : output?.constructor?.name || typeof output,
      };
    } catch (error) {
      return {
        target,
        status: "error",
        error: { name: error?.name || "Error", message: error?.message || String(error) },
      };
    }
  }

  api.events.on(WORKER_REQUEST_EVENT, (request) => {
    let position = { x: 0, y: 0 };
    const cell = request?.sampleContext?.mouseCell || { x: 0, y: 0 };
    const probes = [];
    probes.push(safe("api.worker.getIndex()", () => api.worker.getIndex()));
    probes.push(safe("api.worker.getCount()", () => api.worker.getCount()));
    probes.push(safe("api.player.getWorldPosition()", () => {
      position = api.player.getWorldPosition();
      return position;
    }));
    probes.push(safe("api.maps.getActive()", () => api.maps.getActive()));
    probes.push(safe("api.shared.buffers.get('documentation-probe:missing')", () => (
      api.shared.buffers.get("documentation-probe:missing")
    )));
    probes.push(safe("api.world.getCellIdAtCell(mouseX, mouseY)", () => (
      api.world.getCellIdAtCell(cell.x, cell.y)
    )));
    probes.push(safe("api.world.isCellEmptyAtCell(mouseX, mouseY)", () => (
      api.world.isCellEmptyAtCell(cell.x, cell.y)
    )));
    probes.push(safe("api.elements.getInfoAtCell(mouseX, mouseY)", () => (
      api.elements.getInfoAtCell(cell.x, cell.y)
    )));
    probes.push(safe("api.elements.getVelocityAtCell(mouseX, mouseY)", () => (
      api.elements.getVelocityAtCell(cell.x, cell.y)
    )));
    probes.push(safe("api.terrains.getDataAtCell(mouseX, mouseY)", () => (
      api.terrains.getDataAtCell(cell.x, cell.y)
    )));
    probes.push(safe("api.structures.getAtCell(mouseX, mouseY)", () => (
      api.structures.getAtCell(cell.x, cell.y)
    )));
    probes.push(safe("api.random.int(10, 20)", () => api.random.int(10, 20)));
    probes.push(safe("api.random.float(0.25, 0.75)", () => api.random.float(0.25, 0.75)));
    probes.push(safe("api.utils.getDistance({0,0}, {3,4})", () => (
      api.utils.getDistance({ x: 0, y: 0 }, { x: 3, y: 4 })
    )));
    probes.push(safe("api.patterns.createCircle(5)", () => api.patterns.createCircle(5)));

    api.main.emitEvent(WORKER_REPORT_EVENT, {
      schemaVersion: 1,
      context: "worker",
      workerIndex: safe("api.worker.getIndex()", () => api.worker.getIndex()).output,
      position,
      sampleCell: cell,
      probes,
    });
  });
})();
