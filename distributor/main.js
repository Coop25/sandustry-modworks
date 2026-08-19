await (async () => {
  "use strict";

  const api = sandkit.api;
  const DISTRIBUTOR_ID = "distributor";
  const DISTRIBUTOR_SPRITE_ID = "distributor";
  const MOD_ID = "cooper.distributor";
  const DISTRIBUTOR_TECH_ID = "cooper.distributor.tech";
  const ADVANCED_FILTER_TECH_ID = 64;
  const STRUCTURE_SIZE = 4;
  const MAX_NETWORK_SIZE = 256;
  const GAS_MATTER_TYPE = 4;
  const BLOCKED_ELEMENT_IDS = ["fire"];
  const PROCESS_INTERVAL_MS = 16;
  const TOPOLOGY_RECHECK_TICKS = 60;
  const MAX_IDLE_POLL_TICKS = 8;
  const COORDINATOR_GRACE_TICKS = 2;
  const NEIGHBOR_OFFSETS = [
    [-STRUCTURE_SIZE, 0],
    [STRUCTURE_SIZE, 0],
    [0, -STRUCTURE_SIZE],
    [0, STRUCTURE_SIZE],
    [-STRUCTURE_SIZE, -STRUCTURE_SIZE],
    [STRUCTURE_SIZE, -STRUCTURE_SIZE],
    [-STRUCTURE_SIZE, STRUCTURE_SIZE],
    [STRUCTURE_SIZE, STRUCTURE_SIZE],
  ];
  const networkByBlock = new Map();
  const blockKeyCache = new WeakMap();
  const topLaneCursors = new Map();
  const bottomLaneCursors = new Map();
  const gasElementTypes = new Map();
  const blockedElementTypes = new Set(
    BLOCKED_ELEMENT_IDS.map((elementId) => api.elements.getTypeFromId(elementId)),
  );
  const processorMutations = [
    { kind: "remove", cellX: 0, cellY: 0, expectedElementType: 0 },
    { kind: "create", cellX: 0, cellY: 0, elementType: 0 },
  ];

  await api.sprites.loadFromMod(
    DISTRIBUTOR_SPRITE_ID,
    "assets/distributor.png",
  );

  function isDistributor(structure) {
    return api.structures.isType(structure, DISTRIBUTOR_ID);
  }

  function getBlockKey(structure) {
    let key = blockKeyCache.get(structure);
    if (key === undefined) {
      key = `${structure.x},${structure.y}`;
      blockKeyCache.set(structure, key);
    }
    return key;
  }

  function getCurrentTick() {
    return api.time.getTick();
  }

  function collectConnectedDistributors(startStructure) {
    const queue = [startStructure];
    let queueIndex = 0;
    const visited = new Set();
    const blocks = [];

    while (queueIndex < queue.length && blocks.length < MAX_NETWORK_SIZE) {
      const structure = queue[queueIndex];
      queueIndex += 1;
      if (!structure || !isDistributor(structure)) continue;

      const key = getBlockKey(structure);
      if (visited.has(key)) continue;
      visited.add(key);
      blocks.push(structure);

      for (const [offsetX, offsetY] of NEIGHBOR_OFFSETS) {
        const cellX = structure.x + offsetX;
        const cellY = structure.y + offsetY;
        if (cellX < 0 || cellY < 0) continue;
        const neighbor = api.structures.getAtCell(cellX, cellY);
        if (neighbor && isDistributor(neighbor)) queue.push(neighbor);
      }
    }

    blocks.sort((a, b) => a.y - b.y || a.x - b.x);
    return blocks;
  }

  function getNetworkKey(blocks) {
    return blocks.map(getBlockKey).join(";");
  }

  function clearNetworkMappings(network) {
    for (const block of network.blocks) {
      const blockKey = getBlockKey(block);
      if (networkByBlock.get(blockKey) === network) {
        networkByBlock.delete(blockKey);
      }
    }
  }

  function rebuildNetwork(startStructure, tick) {
    const blocks = collectConnectedDistributors(startStructure);
    if (blocks.length === 0) return null;

    const networkKey = getNetworkKey(blocks);
    const affectedNetworks = new Set();
    for (const block of blocks) {
      const previous = networkByBlock.get(getBlockKey(block));
      if (previous) affectedNetworks.add(previous);
    }

    let matchingNetwork = null;
    let inheritedNetwork = null;
    let lastProcessedTick = -1;
    for (const previous of affectedNetworks) {
      if (previous.key === networkKey) matchingNetwork = previous;
      if (!inheritedNetwork) inheritedNetwork = previous;
      lastProcessedTick = Math.max(lastProcessedTick, previous.lastProcessedTick);
      clearNetworkMappings(previous);
    }

    const network = matchingNetwork || {
      key: networkKey,
      blocks,
      inputCursor: inheritedNetwork?.inputCursor || 0,
      outputCursor: inheritedNetwork?.outputCursor || 0,
      reverseInputCursor: inheritedNetwork?.reverseInputCursor || 0,
      reverseOutputCursor: inheritedNetwork?.reverseOutputCursor || 0,
      forwardInputs: [],
      reverseInputs: [],
      outputMasks: new Uint8Array(blocks.length),
      idlePollTicks: 1,
      nextProcessTick: tick,
      lastCoordinatorTick: tick,
      lastProcessedTick,
      nextTopologyCheckTick: tick + TOPOLOGY_RECHECK_TICKS,
    };

    network.key = networkKey;
    network.blocks = blocks;
    network.blockKeys = blocks.map(getBlockKey);
    if (network.outputMasks.length !== blocks.length) {
      network.outputMasks = new Uint8Array(blocks.length);
    }
    network.inputCursor %= blocks.length;
    network.outputCursor %= blocks.length;
    network.reverseInputCursor %= blocks.length;
    network.reverseOutputCursor %= blocks.length;
    network.lastCoordinatorTick = tick;
    network.nextTopologyCheckTick = tick + TOPOLOGY_RECHECK_TICKS;

    for (const block of blocks) {
      networkByBlock.set(getBlockKey(block), network);
    }
    return network;
  }

  function isNetworkMembershipValid(network) {
    for (const block of network.blocks) {
      if (!api.structures.isTypeAtCell(block.x, block.y, DISTRIBUTOR_ID)) {
        return false;
      }
    }
    return true;
  }

  function isGasElement(elementType) {
    let isGas = gasElementTypes.get(elementType);
    if (isGas === undefined) {
      isGas =
        api.elements.getDefinitionByType(elementType)?.matterType ===
        GAS_MATTER_TYPE;
      gasElementTypes.set(elementType, isGas);
    }
    return isGas;
  }

  function findInput(
    structure,
    blockKey,
    processor,
    side,
    gasOnly,
    laneCursorMap,
    result,
  ) {
    const inputY = side === "top"
      ? structure.y - 1
      : structure.y + STRUCTURE_SIZE;
    if (inputY < 0) return null;
    const startLane = laneCursorMap.get(blockKey) || 0;

    for (let offset = 0; offset < STRUCTURE_SIZE; offset += 1) {
      const lane = (startLane + offset) % STRUCTURE_SIZE;
      const cellX = structure.x + lane;
      const elementType = processor.getElementTypeAtCell(cellX, inputY);
      if (
        elementType !== null &&
        !blockedElementTypes.has(elementType) &&
        (!gasOnly || isGasElement(elementType))
      ) {
        result.cellX = cellX;
        result.cellY = inputY;
        result.elementType = elementType;
        result.lane = lane;
        result.blockKey = blockKey;
        return true;
      }
    }

    return false;
  }

  function getOutputMask(processor, block, side) {
    const outputY = side === "top"
      ? block.y - 1
      : block.y + STRUCTURE_SIZE;
    if (outputY < 0) return 0;
    let mask = 0;
    for (let lane = 0; lane < STRUCTURE_SIZE; lane += 1) {
      if (processor.isCellEmpty(block.x + lane, outputY)) {
        mask |= 1 << lane;
      }
    }
    return mask;
  }

  function chooseOutputLane(mask, preferredLane) {
    for (let offset = 0; offset < STRUCTURE_SIZE; offset += 1) {
      const lane = (preferredLane + offset) % STRUCTURE_SIZE;
      if ((mask & (1 << lane)) !== 0) return lane;
    }
    return -1;
  }

  function collectInputs(
    network,
    processor,
    startIndex,
    side,
    gasOnly,
    laneCursorMap,
    inputs,
  ) {
    const blocks = network.blocks;
    let inputCount = 0;
    for (let offset = 0; offset < blocks.length; offset += 1) {
      const inputIndex = (startIndex + offset) % blocks.length;
      const input = inputs[inputCount] || (inputs[inputCount] = {});
      if (findInput(
        blocks[inputIndex],
        network.blockKeys[inputIndex],
        processor,
        side,
        gasOnly,
        laneCursorMap,
        input,
      )) {
        input.inputIndex = inputIndex;
        inputCount += 1;
      }
    }
    return inputCount;
  }

  function routeInputs(
    network,
    processor,
    inputs,
    inputCount,
    outputSide,
    inputCursorField,
    outputCursorField,
    laneCursorMap,
  ) {
    if (inputCount === 0) return 0;

    const blocks = network.blocks;
    const outputMasks = network.outputMasks;
    let availableOutputBlocks = 0;
    for (let index = 0; index < blocks.length; index += 1) {
      const mask = getOutputMask(processor, blocks[index], outputSide);
      outputMasks[index] = mask;
      if (mask !== 0) availableOutputBlocks += 1;
    }
    let movedCount = 0;

    for (let inputOffset = 0; inputOffset < inputCount; inputOffset += 1) {
      const input = inputs[inputOffset];
      if (availableOutputBlocks === 0) break;
      for (let outputOffset = 0; outputOffset < blocks.length; outputOffset += 1) {
        const outputIndex =
          (network[outputCursorField] + outputOffset) % blocks.length;
        const outputLane = chooseOutputLane(outputMasks[outputIndex], input.lane);
        if (outputLane < 0) continue;
        const removeMutation = processorMutations[0];
        removeMutation.cellX = input.cellX;
        removeMutation.cellY = input.cellY;
        removeMutation.expectedElementType = input.elementType;
        const createMutation = processorMutations[1];
        createMutation.cellX = blocks[outputIndex].x + outputLane;
        createMutation.cellY = outputSide === "top"
          ? blocks[outputIndex].y - 1
          : blocks[outputIndex].y + STRUCTURE_SIZE;
        createMutation.elementType = input.elementType;

        const moved = processor.commit(processorMutations);

        if (moved) {
          const previousMask = outputMasks[outputIndex];
          outputMasks[outputIndex] &= ~(1 << outputLane);
          if (previousMask !== 0 && outputMasks[outputIndex] === 0) {
            availableOutputBlocks -= 1;
          }
          laneCursorMap.set(input.blockKey, (input.lane + 1) % STRUCTURE_SIZE);
          network[inputCursorField] = (input.inputIndex + 1) % blocks.length;
          network[outputCursorField] = (outputIndex + 1) % blocks.length;
          movedCount += 1;
        }
        break;
      }
    }

    return movedCount;
  }

  function processDistributor(structure, processor) {
    const tick = getCurrentTick();
    const structureKey = getBlockKey(structure);
    let network = networkByBlock.get(structureKey);
    if (!network) network = rebuildNetwork(structure, tick);
    if (!network) return;

    let coordinator = network.blocks[0];
    if (structureKey !== getBlockKey(coordinator)) {
      // If the old coordinator was removed, a surviving member takes ownership
      // after a short grace period. Rebuilding also separates split networks.
      if (tick - network.lastCoordinatorTick > COORDINATOR_GRACE_TICKS) {
        network = rebuildNetwork(structure, tick);
      }
      if (!network || structureKey !== getBlockKey(network.blocks[0])) return;
      coordinator = network.blocks[0];
    }

    network.lastCoordinatorTick = tick;
    if (tick >= network.nextTopologyCheckTick) {
      network.nextTopologyCheckTick = tick + TOPOLOGY_RECHECK_TICKS;
      if (!isNetworkMembershipValid(network)) {
        network = rebuildNetwork(coordinator, tick);
        if (!network || structureKey !== getBlockKey(network.blocks[0])) return;
      }
    }

    // addProcessor invokes every placed block. The cached coordinator handles
    // the network once per simulation tick; every other callback is O(1).
    if (network.lastProcessedTick === tick || tick < network.nextProcessTick) return;
    network.lastProcessedTick = tick;

    // Capture both directions before any commits. This prevents newly moved gas
    // from being picked up by the reverse path again during the same tick.
    const inputCount = collectInputs(
      network,
      processor,
      network.inputCursor,
      "top",
      false,
      topLaneCursors,
      network.forwardInputs,
    );
    const reverseInputCount = collectInputs(
      network,
      processor,
      network.reverseInputCursor,
      "bottom",
      true,
      bottomLaneCursors,
      network.reverseInputs,
    );

    if (inputCount === 0 && reverseInputCount === 0) {
      network.idlePollTicks = Math.min(
        network.idlePollTicks * 2,
        MAX_IDLE_POLL_TICKS,
      );
      network.nextProcessTick = tick + network.idlePollTicks;
      return;
    }

    // Normal materials travel top-to-bottom. Only gases get the additional
    // bottom-to-top route, with independent round-robin cursors for fairness.
    const movedCount =
      routeInputs(
        network,
        processor,
        network.forwardInputs,
        inputCount,
        "bottom",
        "inputCursor",
        "outputCursor",
        topLaneCursors,
      ) +
      routeInputs(
        network,
        processor,
        network.reverseInputs,
        reverseInputCount,
        "top",
        "reverseInputCursor",
        "reverseOutputCursor",
        bottomLaneCursors,
      );

    network.idlePollTicks = movedCount > 0
      ? 1
      : Math.min(network.idlePollTicks * 2, MAX_IDLE_POLL_TICKS);
    network.nextProcessTick = tick + network.idlePollTicks;
  }

  api.structures.register({
    id: DISTRIBUTOR_ID,
    name: "Distributor",
    description:
      "Connect adjacent Distributors into one multiblock network. Materials except fire distribute downward; gas may also distribute upward.",
    categoryKey: "logistics",
    order: 52,
    // One placed Distributor is one solid square building. A single unrestricted
    // line mode avoids the build-mode selector while supporting drags in either
    // direction horizontally, vertically, and diagonally.
    shape: [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
    ],
    buildModes: [
      {
        type: "line",
        directions: ["horizontal", "vertical", "diagonal"],
      },
    ],
    variants: [
      {
        id: DISTRIBUTOR_ID,
        angles: [-180, -135, -90, -45, 0, 45, 90, 135, 180],
      },
    ],
    render: {
      imageName: DISTRIBUTOR_SPRITE_ID,
      size: { width: 18, height: 18 },
      offset: { x: -1, y: -1 },
      z: 0.85,
      ui: { outline: true, width: "18px", height: "18px" },
    },
  });

  api.tech.registerNode(
    DISTRIBUTOR_TECH_ID,
    {
      name: "Distributor",
      description:
        "Unlocks a connected logistics network that distributes materials downward and gases in either direction.",
      cost: 2000,
      branch: "logistics",
      icon: { spriteName: DISTRIBUTOR_SPRITE_ID },
      unlocks: { structures: [DISTRIBUTOR_ID] },
    },
    {
      // Advanced Filter is the parent. The game's automatic placement selects
      // the open cell directly beneath it in the Logistics research branch.
      parentId: ADVANCED_FILTER_TECH_ID,
    },
  );

  let processorStatus = "registered";
  try {
    api.structures.addProcessor(DISTRIBUTOR_ID, {
      intervalMs: PROCESS_INTERVAL_MS,
      process: processDistributor,
    });
  } catch (error) {
    // Keep the structure usable/visible even if a future game update changes
    // the optional processor API, and leave a persistent diagnostic marker.
    processorStatus = `failed: ${
      error instanceof Error ? error.message : String(error)
    }`;
  }

  api.storage.set(MOD_ID, "loadStatus", {
    version: "1.4.2",
    structureRegistered: true,
    buildingUnlocked: api.structures.isUnlockedByType(DISTRIBUTOR_ID),
    processor: processorStatus,
  });
})();
