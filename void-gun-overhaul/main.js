(() => {
  "use strict";

  const api = sandkit.api;
  const VOID_PROJECTILE_MOD_ID = "implosionGunProjectile";
  const VOID_GUN_ITEM_ID = "implosionGun";
  const RADIUS_UPGRADE_ID = "blastRadius";
  const ABILITY_UPGRADE_ID = "terrainAbilities";
  const TANK_CAPACITY_UPGRADE_ID = "tankCapacity";
  const SUNSAND_ID = "sunsand";
  const SAND_ID = "sand";
  const ICE_ID = "ice";
  const WATER_ID = "water";

  // These constants mirror the Void Gun's native charged-blast calculation.
  const MAX_CHARGE_FOR_RADIUS = 200;
  const MIN_PATTERN_SIZE = 11;
  const ADDED_PATTERN_SIZE = 64;
  const RADIUS_CELLS_PER_LEVEL = 4;

  const sunsandType = api.elements.getTypeFromId(SUNSAND_ID);
  const sandType = api.elements.getTypeFromId(SAND_ID);
  const iceType = api.terrains.getTypeFromId(ICE_ID);
  const waterType = api.elements.getTypeFromId(WATER_ID);

  function getBlastPatternSize(consumedVoid, upgradeLevel = 0) {
    const charge = Math.max(1, Number(consumedVoid) || 1);
    const chargeRatio = Math.min(1, charge / MAX_CHARGE_FOR_RADIUS);
    let patternSize = Math.round(
      MIN_PATTERN_SIZE + ADDED_PATTERN_SIZE * chargeRatio,
    );
    patternSize +=
      2 * RADIUS_CELLS_PER_LEVEL * Math.max(0, Number(upgradeLevel) || 0);

    // The native circle pattern always uses an odd-sized matrix.
    if (patternSize % 2 === 0) patternSize += 1;
    return patternSize;
  }

  function getBlastRadius(consumedVoid, upgradeLevel = 0) {
    return Math.floor(getBlastPatternSize(consumedVoid, upgradeLevel) / 2);
  }

  function getExcavationPower(consumedVoid) {
    const charge = Math.max(1, Number(consumedVoid) || 1);
    const chargeRatio = Math.min(1, charge / MAX_CHARGE_FOR_RADIUS);
    return Math.round(1 + chargeRatio * chargeRatio * 79);
  }

  function isTerrainType(cellX, cellY, terrainType) {
    return api.terrains.getTypeAtCell(cellX, cellY) === terrainType;
  }

  function createElementReplacingTerrain(cellX, cellY, elementType) {
    // Sunsand can harden while an idle mutation is queued. Clear both possible
    // cell states first, then create the desired stable element next tick.
    api.elements.removeAtCellWhenIdle(cellX, cellY);
    api.terrains.removeAtCellWhenIdle(cellX, cellY);
    api.schedule.nextTick(() => {
      api.elements.createAtCellWhenIdle(cellX, cellY, elementType);
    });
  }

  function createStableSand(cellX, cellY) {
    createElementReplacingTerrain(cellX, cellY, sandType);
  }

  function excavateRadiusUpgrade(
    projectile,
    radiusUpgradeLevel,
    abilityUpgradeLevel,
  ) {
    if (radiusUpgradeLevel <= 0) return;

    const voidData = projectile.mods[VOID_PROJECTILE_MOD_ID].data || {};
    const baseSize = getBlastPatternSize(voidData.consumedVoid);
    const upgradedSize = getBlastPatternSize(
      voidData.consumedVoid,
      radiusUpgradeLevel,
    );
    const basePattern = api.patterns.createCircle(baseSize);
    const upgradeRing = api.patterns.createCircle(upgradedSize);
    const offset = Math.floor((upgradedSize - baseSize) / 2);

    // Remove the native inner circle, leaving only the newly unlocked ring.
    for (let y = 0; y < basePattern.length; y += 1) {
      for (let x = 0; x < basePattern[y].length; x += 1) {
        if (basePattern[y][x]) {
          upgradeRing[y + offset][x + offset] = 0;
        }
      }
    }

    const { cellSize } = api.rendering.getGridMetrics();
    const centerX = Math.floor(projectile.x / cellSize);
    const centerY = Math.floor(projectile.y / cellSize);
    const power = getExcavationPower(voidData.consumedVoid);

    // The native handler has already queued the original circle. Queue only
    // the upgrade ring after it, with the same material-specific damage rules.
    api.schedule.nextTick(() => {
      api.patterns.excavateAtCell(
        centerX,
        centerY,
        upgradeRing,
        { x: 0, y: 0 },
        power,
        {
          fromDrill: true,
          drillTierDamage: abilityUpgradeLevel >= 2 ? 8 : 0,
          sandkeeperCopperDamage: abilityUpgradeLevel >= 3 ? 12 : 0,
          sandkeeperSandstoneDamage: abilityUpgradeLevel >= 5 ? 42 : 0,
          sandkeeperDuneToSand: abilityUpgradeLevel >= 1,
        },
      );
    });
  }

  function convertSandAtVoidImpact(
    projectile,
    radiusUpgradeLevel,
    abilityUpgradeLevel,
  ) {
    const voidProjectileMod = projectile?.mods?.[VOID_PROJECTILE_MOD_ID];
    if (!voidProjectileMod) return;
    const voidData = voidProjectileMod.data || {};

    const { cellSize } = api.rendering.getGridMetrics();
    const centerX = Math.floor(projectile.x / cellSize);
    const centerY = Math.floor(projectile.y / cellSize);
    const radius = getBlastRadius(
      voidData.consumedVoid,
      radiusUpgradeLevel,
    );
    const sunsandCells = [];
    const iceCells = [];

    // Record targets at impact time, before the native blast excavates them.
    api.grid.forEachCellInCircle(centerX, centerY, radius, (cellX, cellY) => {
      if (api.elements.isTypeAtCell(cellX, cellY, sunsandType)) {
        sunsandCells.push({ x: cellX, y: cellY });
      }

      if (
        abilityUpgradeLevel >= 4 &&
        isTerrainType(cellX, cellY, iceType)
      ) {
        iceCells.push({ x: cellX, y: cellY });
      }
    });

    // The native Void Gun queues its excavation for the next tick. Queue this
    // callback afterward so converted Sand survives that excavation.
    api.schedule.nextTick(() => {
      for (const { x, y } of sunsandCells) {
        createStableSand(x, y);
      }

      for (const { x, y } of iceCells) {
        createElementReplacingTerrain(x, y, waterType);
      }
    });
  }

  // Hook the Void Gun's actual hit handler. The generic projectile:hit event
  // is not emitted for this built-in projectile in the current game build.
  const voidProjectileDefinition = api.projectiles.getDefinitionById(
    VOID_PROJECTILE_MOD_ID,
  );
  if (!voidProjectileDefinition || typeof voidProjectileDefinition.onHit !== "function") {
    throw new Error("Could not find the Void Gun projectile hit handler.");
  }

  const nativeOnHit = voidProjectileDefinition.onHit;
  voidProjectileDefinition.onHit = (state, projectile) => {
    const radiusUpgradeLevel = api.upgrades.getLevelById(
      VOID_GUN_ITEM_ID,
      RADIUS_UPGRADE_ID,
    );
    const abilityUpgradeLevel = api.upgrades.getLevelById(
      VOID_GUN_ITEM_ID,
      ABILITY_UPGRADE_ID,
    );
    const voidData = projectile?.mods?.[VOID_PROJECTILE_MOD_ID]?.data;
    if (voidData) {
      // The native bundle patch reads this value while resolving terrain
      // damage and Dune output for the original blast circle.
      voidData.sandkeeperAbilityLevel = abilityUpgradeLevel;
    }
    nativeOnHit(state, projectile);
    excavateRadiusUpgrade(
      projectile,
      radiusUpgradeLevel,
      abilityUpgradeLevel,
    );
    convertSandAtVoidImpact(
      projectile,
      radiusUpgradeLevel,
      abilityUpgradeLevel,
    );
  };

  api.upgrades.register({
    itemId: VOID_GUN_ITEM_ID,
    itemName: "Void Gun",
    categoryId: "utility",
    requirement: { item: VOID_GUN_ITEM_ID },
    upgrade: {
      id: ABILITY_UPGRADE_ID,
      name: "Terrain Abilities",
      description:
        "Tier 1: Dune to Sand. Tier 2: remove Stone. Tier 3: mine Copper. Tier 4: melt Ice into Water. Tier 5: remove Sandstone.",
      maxLevel: 5,
      costs: [100, 300, 750, 1500, 3000],
    },
  });

  api.upgrades.register({
    itemId: VOID_GUN_ITEM_ID,
    itemName: "Void Gun",
    categoryId: "utility",
    requirement: { item: VOID_GUN_ITEM_ID },
    upgrade: {
      id: RADIUS_UPGRADE_ID,
      name: "Blast Radius",
      description: `Adds ${RADIUS_CELLS_PER_LEVEL} cells to the Void Gun blast radius per level.`,
      maxLevel: 5,
      costs: [100, 300, 750, 1500, 3000],
    },
  });

  // Extend Sandustry's native three-level Voidjuice tank upgrade by two
  // levels. Its native capacity formula already adds 2,000 per level and its
  // original onUpgrade handler refreshes the stored maximum and hotbar UI.
  api.upgrades.updateDefinition(
    VOID_GUN_ITEM_ID,
    TANK_CAPACITY_UPGRADE_ID,
    {
      maxLevel: 5,
      costs: [500, 1000, 2000, 4000, 8000],
    },
  );

  api.items.updateDefinition(VOID_GUN_ITEM_ID, {
    descriptionKey: undefined,
    description:
      "Uses Voidjuice to convert Sunsand and unlock progressive Dune, Stone, Copper, Ice, and Sandstone abilities.",
  });
})();
