// Generated from apireference.md. Run build-api-data.js after editing the reference.
window.SANDKIT_API_ENTRIES = [
  {
    "namespace": "api.gameConfig",
    "context": "main",
    "signatures": [
      "api.gameConfig.get(key: string): JsonValueV1 | undefined;",
      "api.gameConfig.getAll(): JsonObjectV1;"
    ]
  },
  {
    "namespace": "api.action",
    "context": "main",
    "signatures": [
      "api.action.getActive(): Action;",
      "api.action.getSelected(): Action;",
      "api.action.setCustomData(data: any): void;"
    ]
  },
  {
    "namespace": "api.assets",
    "context": "main",
    "signatures": [
      "api.assets.getUrl(relativePath: string): string;",
      "api.assets.getSelectedProvider(kind: string): AssetProviderV1 | null;",
      "api.assets.selectProvider(kind: string, providerId: string | null): boolean;"
    ]
  },
  {
    "namespace": "api.authorization",
    "context": "main",
    "signatures": [
      "api.authorization.canBuildAtCell(cellX: number, cellY: number): boolean;",
      "api.authorization.canGrabAtCell(cellX: number, cellY: number): boolean;",
      "api.authorization.canUseTool(player: Player, isFlamethrower?: boolean): boolean;",
      "api.authorization.canUseToolAtCell(cellX: number, cellY: number, isFlamethrower?: boolean): boolean;",
      "api.authorization.getZoneIdAtCell(cellX: number, cellY: number): number;",
      "api.authorization.getPlayerZoneId(): number;"
    ]
  },
  {
    "namespace": "api.building",
    "context": "main",
    "signatures": [
      "api.building.getSnappedPositionAtCell(cellX: number, cellY: number): { x: number; y: number; };",
      "api.building.isBlockedAtCell(cellX: number, cellY: number): boolean;",
      "api.building.cancelPlacement(): void;",
      "api.building.selectStructure(structureTypeOrId: string | StructureType): string | StructureType | null;"
    ]
  },
  {
    "namespace": "api.camera",
    "context": "main",
    "signatures": [
      "api.camera.snapToPlayer(): void;",
      "api.camera.setFocusAtWorld(worldX: number, worldY: number): boolean;",
      "api.camera.releaseFocus(options?: { durationMs?: number; }): boolean;"
    ]
  },
  {
    "namespace": "api.scene",
    "context": "main",
    "signatures": [
      "api.scene.getActive(): Scene;"
    ]
  },
  {
    "namespace": "api.collector",
    "context": "main",
    "signatures": [
      "api.collector.getValueFromCellId(cellId: number): number;",
      "api.collector.getValueByType(elementType: number): number;",
      "api.collector.isCellIdCollectable(cellId: number): boolean;",
      "api.collector.isCellIdCollectableForSprite(cellId: number): boolean;",
      "api.collector.notifyPickupAtCell(cellX: number, cellY: number): void;"
    ]
  },
  {
    "namespace": "api.cooldown",
    "context": "main",
    "signatures": [
      "api.cooldown.check(cooldown: Cooldown, overrideTime?: number): boolean;",
      "api.cooldown.isReady(cooldown: Cooldown, overrideTime?: number): boolean;"
    ]
  },
  {
    "namespace": "api.discoveries",
    "context": "main",
    "signatures": [
      "api.discoveries.addElementByType(elementType: number): void;",
      "api.discoveries.addTerrainByType(terrainType: number): void;"
    ]
  },
  {
    "namespace": "api.effects",
    "context": "main",
    "signatures": [
      "api.effects.createDistortionWaveAtWorld(worldX: number, worldY: number, options?: { style?: 'implode' | 'explode'; duration?: number; maxRadius?: number; intensity?: number; color?: [number, number, number, number]; }): void;",
      "api.effects.createEffectAtWorld(effectId: string, worldX: number, worldY: number, options?: any): void;",
      "api.effects.createLaserAtWorld(startWorldX: number, startWorldY: number, endWorldX: number, endWorldY: number, options?: { width?: number; brightness?: number; color?: number; glow?: boolean; }): any;",
      "api.effects.createLightAtWorld(worldX: number, worldY: number, options?: TemporaryLightOptions): { index: number | null; };",
      "api.effects.createParticlesAtWorld(worldX: number, worldY: number, options?: ParticleEffectOptions): void;",
      "api.effects.removeLightById(lightId: number): void;"
    ]
  },
  {
    "namespace": "api.elements",
    "context": "main",
    "signatures": [
      "api.elements.getRegisteredTypes(): ElementType[];",
      "api.elements.register(definition: ElementDefinition): { elementType: ElementType; };",
      "api.elements.updateDefinition(elementTypeOrId: string | ElementType, partial: Partial<ElementDefinition>): void;",
      "api.elements.addInteractionInfo(elementTypeOrId: string | ElementType, interaction: Interaction): void;",
      "api.elements.getTypeFromId(elementId: string): ElementType;",
      "api.elements.getNameByType(elementType: number): string;",
      "api.elements.getDefinitionByType(elementType: ElementType): ElementDefinition | undefined;",
      "api.elements.getTypeAtCell(cellX: number, cellY: number): ElementType | null;",
      "api.elements.getResolvedTypeAtCell(cellX: number, cellY: number): ElementType | null;",
      "api.elements.getResolvedTypeFromCellId(cellId: number): ElementType | null;",
      "api.elements.getInfoAtCell(cellX: number, cellY: number): { elementType: ElementType; isParticle: boolean; cellId: number; elementIndex: number; } | null;",
      "api.elements.getMatterTypeAtCell(cellX: number, cellY: number): MatterType | null;",
      "api.elements.isTypeAtCell(cellX: number, cellY: number, elementType: ElementType): boolean;",
      "api.elements.isFreeFallingAtCell(cellX: number, cellY: number): boolean;",
      "api.elements.findFreeCellInStructure(structureCellX: number, structureCellY: number, structureSize: number): { x: number; y: number; } | null;",
      "api.elements.createAtCellWhenIdle(cellX: number, cellY: number, elementType: ElementType, options?: ElementCreateOptions): void;",
      "api.elements.replaceAtCellWhenIdle(cellX: number, cellY: number, elementType: ElementType, options?: ElementCreateOptions): void;",
      "api.elements.removeAtCellWhenIdle(cellX: number, cellY: number, options?: ElementRemovalOptions): void;",
      "api.elements.teleportBetweenCellsWhenIdle(fromCellX: number, fromCellY: number, toCellX: number, toCellY: number): void;",
      "api.elements.getVelocityAtCell(cellX: number, cellY: number): { x: number; y: number; } | null;",
      "api.elements.setVelocityAtCellWhenIdle(cellX: number, cellY: number, velocity: { x: number; y: number; }): void;",
      "api.elements.addParticleVelocityAtCellWhenIdle(cellX: number, cellY: number, velocity: { x: number; y: number; }, maxSpeed?: number): void;",
      "api.elements.convertToParticleAtCellWhenIdle(cellX: number, cellY: number, velocity: { x: number; y: number; }): void;",
      "api.elements.convertFromParticleAtCellWhenIdle(cellX: number, cellY: number): void;",
      "api.elements.getDataFieldAtCell(cellX: number, cellY: number, fieldNumber: 1 | 2 | 3 | 4): number | null;",
      "api.elements.setDataFieldAtCellWhenIdle(cellX: number, cellY: number, fieldNumber: 1 | 2 | 3 | 4, value: number): void;",
      "api.elements.refreshColorAtCellWhenIdle(cellX: number, cellY: number): void;",
      "api.elements.setPhysicsAtCellWhenIdle(cellX: number, cellY: number, physicsState: number): void;",
      "api.elements.setDurationAtCellWhenIdle(cellX: number, cellY: number, duration: number, options?: { updateMax?: boolean; }): void;"
    ]
  },
  {
    "namespace": "api.energy",
    "context": "main",
    "signatures": [
      "api.energy.registerType(structureId: string, type: 'conductor' | 'storage', options?: any): void;",
      "api.energy.addAtCell(cellX: number, cellY: number, amount: number, options?: any): number;",
      "api.energy.consume(amount: number, options?: { allOrNothing?: boolean; }): number;",
      "api.energy.consumeExcludingNetworkAtCell(cellX: number, cellY: number, amount: number): number;",
      "api.energy.getNetworkAtCell(cellX: number, cellY: number): { x: number; y: number; type: string; }[];",
      "api.energy.getNetworkFreeCapacityAtCell(cellX: number, cellY: number): number;"
    ]
  },
  {
    "namespace": "api.excavation",
    "context": "main",
    "signatures": [
      "api.excavation.registerProfile(id: string, definition: ExcavationProfileDefinitionV1): void;"
    ]
  },
  {
    "namespace": "api.events",
    "context": "main",
    "signatures": [
      "api.events.on<K extends string>(eventId: K, callback: (payload: EventPayload<K>) => void): () => void;",
      "api.events.emit<K extends string>(eventId: K, payload: EventPayload<K>): void;"
    ]
  },
  {
    "namespace": "api.fire",
    "context": "main",
    "signatures": [
      "api.fire.canBurnElementAtCell(cellX: number, cellY: number): boolean;",
      "api.fire.burnElementAtCellWhenIdle(cellX: number, cellY: number): void;"
    ]
  },
  {
    "namespace": "api.grid",
    "context": "main",
    "signatures": [
      "api.grid.forEachCellInRect(cellX: number, cellY: number, width: number, height: number, callback: (cellX: number, cellY: number) => void): void;",
      "api.grid.forEachCellInCircle(centerCellX: number, centerCellY: number, radius: number, callback: (cellX: number, cellY: number) => void): void;"
    ]
  },
  {
    "namespace": "api.hooks",
    "context": "main",
    "signatures": [
      "api.hooks.intercept<K extends keyof InterceptHookMap>(hookId: K, callback: (args: InterceptHookMap[K], context: HookContext) => void, options?: HookOptions): () => void;",
      "api.hooks.modify<K extends keyof ModifierHookMap>(hookId: K, callback: (args: ModifierHookMap[K]) => void, options?: HookOptions): () => void;"
    ]
  },
  {
    "namespace": "api.i18n",
    "context": "main",
    "signatures": [
      "api.i18n.t(key: string, params?: Record<string, string | number>): string;",
      "api.i18n.register(locale: string, translations: Record<string, string>): void;",
      "api.i18n.getLocale(): string;",
      "api.i18n.hasTranslation(key: string, locale?: string): boolean;",
      "api.i18n.setLocale(locale: string): Promise<void>;",
      "api.i18n.getLanguages(): { code: string; nativeName: string; englishName: string; enabled: boolean; }[];",
      "api.i18n.getAvailableLocales(): string[];",
      "api.i18n.formatNumber(value: number, options?: I18nNumberFormatOptions): string;",
      "api.i18n.key(...parts: string[]): string;",
      "api.i18n.getName(definition: { nameKey?: string; name?: string; }): string;",
      "api.i18n.getDescription(definition: { descriptionKey?: string; description?: string; }): string;",
      "api.i18n.translatable(key: string, fallback: string): { __translatable: true; key: string; fallback: string; };",
      "api.i18n.setGlobal(key: string, value: string | (() => string)): void;",
      "api.i18n.getGlobal(key: string): string | undefined;",
      "api.i18n.clearGlobal(key: string): void;",
      "api.i18n.getGlobals(): Record<string, string>;",
      "api.i18n.formatKeyForDisplay(keyCode: string): string;"
    ]
  },
  {
    "namespace": "api.input",
    "context": "main",
    "signatures": [
      "api.input.registerBinding(bindingId: string, defaultKeys: string[], definition: InputBindingDefinition): string;",
      "api.input.getMouseCellPosition(): { x: number; y: number; };",
      "api.input.getBoundKeys(bindingId: string): string[];",
      "api.input.getDisplayKey(bindingId: string, defaultLabel?: string): string;",
      "api.input.triggerBinding(bindingId: string): void;",
      "api.input.pressBinding(bindingId: string): void;",
      "api.input.releaseBinding(bindingId: string): void;",
      "api.input.resetMouseState(): void;",
      "api.input.isCtrlHeld(): boolean;",
      "api.input.isAltHeld(): boolean;"
    ]
  },
  {
    "namespace": "api.items",
    "context": "main",
    "signatures": [
      "api.items.register(definition: any): void;",
      "api.items.updateDefinition(itemId: string, partial: Record<string, any>): void;",
      "api.items.getDefinitionById(itemId: string): any;",
      "api.items.createFromId(itemId: string): ModItem;",
      "api.items.getActive(): any;",
      "api.items.isActiveById(itemId: string | number, itemType?: ItemType): boolean;"
    ]
  },
  {
    "namespace": "api.lights.vfx",
    "context": "main",
    "signatures": [
      "api.lights.vfx.createAtWorld(worldX: number, worldY: number, options?: TemporaryLightOptions): { index: number | null; };",
      "api.lights.vfx.removeById(lightId: number): void;"
    ]
  },
  {
    "namespace": "api.lights.persistent",
    "context": "main",
    "signatures": [
      "api.lights.persistent.createAtWorld(worldX: number, worldY: number, options?: PersistentLightOptions): any;",
      "api.lights.persistent.removeAtWorld(worldX: number, worldY: number): void;",
      "api.lights.persistent.fadeAtWorld(worldX: number, worldY: number, durationMs?: number): void;",
      "api.lights.persistent.markDirty(): void;"
    ]
  },
  {
    "namespace": "api.maps",
    "context": "main",
    "signatures": [
      "api.maps.getActive(): Readonly<ActiveMapV1> | null;",
      "api.maps.getAvailable(): readonly Readonly<AvailableMapV1>[];",
      "api.maps.start(mapId: string): boolean;"
    ]
  },
  {
    "namespace": "api.mods",
    "context": "main",
    "signatures": [
      "api.mods.getProviders(kind: string): readonly AssetProviderV1[];"
    ]
  },
  {
    "namespace": "api.patterns",
    "context": "main",
    "signatures": [
      "api.patterns.createCircle(size: number): number[][];",
      "api.patterns.excavateAtCell(cellX: number, cellY: number, pattern: number[][], outVelocity: { x: number; y: number; }, power: number, options?: PatternExcavateOptions): void;"
    ]
  },
  {
    "namespace": "api.player",
    "context": "main",
    "signatures": [
      "api.player.getWorldPosition(): { x: number; y: number; };",
      "api.player.setWorldPosition(worldX: number, worldY: number): void;",
      "api.player.setVelocity(velocityX: number, velocityY: number): void;",
      "api.player.setMovementSpeedMultiplier(multiplier: number): void;",
      "api.player.setMovementMode(mode: 'normal' | 'hover'): boolean;",
      "api.player.isOnGround(): boolean;",
      "api.player.teleportToGround(): void;",
      "api.player.isCollidingWithCell(cellX: number, cellY: number): boolean;",
      "api.player.isWithinRadiusOfCell(cellX: number, cellY: number, radius: number): boolean;",
      "api.player.isWorldPositionClear(worldX: number, worldY: number): boolean;"
    ]
  },
  {
    "namespace": "api.player.inventory",
    "context": "main",
    "signatures": [
      "api.player.inventory.addFromId(itemId: string): void;"
    ]
  },
  {
    "namespace": "api.player.buildings",
    "context": "main",
    "signatures": [
      "api.player.buildings.unlockByType(structureId: string): void;"
    ]
  },
  {
    "namespace": "api.progression",
    "context": "main",
    "signatures": [
      "api.progression.complete(request: ProgressionCompletionRequestV1): boolean;"
    ]
  },
  {
    "namespace": "api.processing",
    "context": "main",
    "signatures": [
      "api.processing.registerGrower(definition: PlanterBoxRecipeDefinitionV1): void;",
      "api.processing.registerShaker(definition: ShakerRecipeDefinitionV1): void;",
      "api.processing.registerKineticPress(definition: KineticPressRecipeDefinitionV1): void;"
    ]
  },
  {
    "namespace": "api.projectiles",
    "context": "main",
    "signatures": [
      "api.projectiles.register(definition: any): void;",
      "api.projectiles.getDefinitionById(projectileId: string): any;",
      "api.projectiles.createBlueprintFromId(projectileId: string): ProjectileBlueprint;",
      "api.projectiles.getAll(): Projectile[];",
      "api.projectiles.getById(projectileId: number): Projectile | undefined;",
      "api.projectiles.remove(projectile: Projectile): void;",
      "api.projectiles.spawnAtWorld(worldX: number, worldY: number, angle: number, blueprint: ProjectileBlueprint): Projectile;"
    ]
  },
  {
    "namespace": "api.random",
    "context": "main",
    "signatures": [
      "api.random.int(min: number, max: number): number;",
      "api.random.float(min: number, max: number): number;"
    ]
  },
  {
    "namespace": "api.raycast",
    "context": "main",
    "signatures": [
      "api.raycast.castFromWorld(startWorldX: number, startWorldY: number, angle: number, maxDistance: number): { x: number; y: number; distance: number; } | null;"
    ]
  },
  {
    "namespace": "api.reactions",
    "context": "main",
    "signatures": [
      "api.reactions.registerContact(definition: ContactRecipeDefinitionV1): void;"
    ]
  },
  {
    "namespace": "api.rendering",
    "context": "main",
    "signatures": [
      "api.rendering.getDrawPositionAtCell(cellX: number, cellY: number): { x: number; y: number; };",
      "api.rendering.getGridMetrics(): { cellSize: number; snapGridCellSize: number; };",
      "api.rendering.getOverlayViewportSize(): { width: number; height: number; };",
      "api.rendering.withOverlayContext<T>(callback: (context: CanvasRenderingContext2D) => T): T;"
    ]
  },
  {
    "namespace": "api.resources",
    "context": "main",
    "signatures": [
      "api.resources.collectFluxiteAtCell(cellX: number, cellY: number): void;",
      "api.resources.updateEnergy(amount: number, options?: { deferUi?: boolean; }): void;"
    ]
  },
  {
    "namespace": "api.schedule",
    "context": "main",
    "signatures": [
      "api.schedule.nextTick(callback: () => void): void;"
    ]
  },
  {
    "namespace": "api.signals.targets",
    "context": "main",
    "signatures": [
      "api.signals.targets.register(structureTypeOrId: string | StructureType, apply: (structure: Structure, payload: SignalTargetPayloadV1) => void): void;"
    ]
  },
  {
    "namespace": "api.sound",
    "context": "main",
    "signatures": [
      "api.sound.play(soundId: string, options?: any): SoundHandle;",
      "api.sound.playActive(soundId: string, options?: any): SoundHandle;",
      "api.sound.playLayers(layers: SoundLayer[], options?: { position?: { x: number; y: number; }; volume?: number; rateLimitKey?: string; rateLimitMs?: number; }): SoundHandle[];",
      "api.sound.calculateDistanceOptionsAtWorld(worldX: number, worldY: number, baseVolume?: number): SoundOptions;",
      "api.sound.stopById(soundId: string): void;",
      "api.sound.stopActive(): void;",
      "api.sound.stopAll(): void;"
    ]
  },
  {
    "namespace": "api.sprites",
    "context": "main",
    "signatures": [
      "api.sprites.load(spriteId: string, path: string, options?: { tint?: number; }): Promise<void>;",
      "api.sprites.loadFromMod(spriteId: string, relativePath: string, options?: { tint?: number; }): Promise<void>;",
      "api.sprites.getById(spriteId: string): any;",
      "api.sprites.hideAllPlayerModSprites(): void;",
      "api.sprites.rotatePlayerModSprites(angle: number): void;"
    ]
  },
  {
    "namespace": "api.storage",
    "context": "main",
    "signatures": [
      "api.storage.ensure(modId: string): any;",
      "api.storage.get(modId: string, key: string): any;",
      "api.storage.set(modId: string, key: string, value: any): void;",
      "api.storage.remove(modId: string, key: string): void;"
    ]
  },
  {
    "namespace": "api.storage.local",
    "context": "main",
    "signatures": [
      "api.storage.local.get(key: string): any;",
      "api.storage.local.set(key: string, value: any): void;",
      "api.storage.local.remove(key: string): void;"
    ]
  },
  {
    "namespace": "api.settings",
    "context": "main",
    "signatures": [
      "api.settings.get(fieldId: string): ConfigValueV1 | undefined;",
      "api.settings.getAll(): Readonly<Record<string, ConfigValueV1>>;",
      "api.settings.onChange(callback: (values: Readonly<Record<string, ConfigValueV1>>) => void): () => void;"
    ]
  },
  {
    "namespace": "api.structureBehaviors",
    "context": "main",
    "signatures": [
      "api.structureBehaviors.registerConveyorType(structureId: string, options?: { transportOffset?: { x: number; y: number; }; velocity?: { x: number; y: number; }; maxTransportDistance?: number; transportHeight?: number; runWith?: 'left' | 'right'; skipQueued?: boolean; }): void;",
      "api.structureBehaviors.registerLauncherType(definition: { upType: string; leftType: string; rightType: string; velocity: [number, number]; softDropVelocity: number; runTickSharedBufferKey?: string; }): void;"
    ]
  },
  {
    "namespace": "api.structures.recipes",
    "context": "main",
    "signatures": [
      "api.structures.recipes.register(id: 'planterBox', definition: PlanterBoxRecipeDefinitionV1): void;",
      "api.structures.recipes.register(id: 'shaker', definition: ShakerRecipeDefinitionV1): void;",
      "api.structures.recipes.register(id: 'kineticPress', definition: KineticPressRecipeDefinitionV1): void;",
      "api.structures.recipes.register(id: 'condenser' | 'steamDryer' | 'synthesizer' | 'snowmaker' | 'smelter', definition: WeightedRefineryRecipeDefinitionV1): void;"
    ]
  },
  {
    "namespace": "api.structures.processing",
    "context": "main",
    "signatures": [
      "api.structures.processing.register(id: string, definition: StructureProcessingDefinitionV1): void;",
      "api.structures.processing.isEnabledAt(cellX: number, cellY: number): boolean;",
      "api.structures.processing.setEnabledAt(cellX: number, cellY: number, enabled: boolean): boolean;"
    ]
  },
  {
    "namespace": "api.structures",
    "context": "main",
    "signatures": [
      "api.structures.addProcessor(structureId: string | StructureType, definition: StructureProcessorDefinitionV1): void;",
      "api.structures.register(definition: SandkitStructureDefinition, options?: { useRawShape?: boolean; }): void;",
      "api.structures.updateDefinition(structureTypeOrId: string | StructureType, partial: Partial<SandkitStructureDefinition>, options?: { useRawShape?: boolean; }): void;",
      "api.structures.addVariant(baseStructureTypeOrId: string | StructureType, variant: { id: string | StructureType; angles: number[]; }, options?: { addBuildMode?: any; }): void;",
      "api.structures.forEachOfType(structureTypeOrId: string | StructureType, callback: (structure: Structure) => void): void;",
      "api.structures.registerPlacementConfig(definition: PlacementConfigDefinition): void;",
      "api.structures.getAtCell(cellX: number, cellY: number): Structure | null;",
      "api.structures.getDefinitionByType(structureType: string | StructureType): any;",
      "api.structures.getUnlockedTypes(): Set<string | StructureType>;",
      "api.structures.getTypeFromId(structureId: string): string | StructureType;",
      "api.structures.hasBuiltAtCell(cellX: number, cellY: number): boolean;",
      "api.structures.isBlockedByPlayerAtCell(cellX: number, cellY: number): boolean;",
      "api.structures.isLauncherAtCell(cellX: number, cellY: number): boolean;",
      "api.structures.isType(structure: Structure | null, structureId: string): boolean;",
      "api.structures.isTypeAtCell(cellX: number, cellY: number, structureId: string): boolean;",
      "api.structures.isUnlockedByType(structureType: string | StructureType): boolean;",
      "api.structures.mapValueToSpritesheetIndex(value: number, thresholds: number[]): number;",
      "api.structures.setSpritesheetIndex(structure: Structure, index: number): void;",
      "api.structures.setSpritesheetIndexAtCell(cellX: number, cellY: number, index: number): void;",
      "api.structures.setSpritesheetIndexByValue(structure: Structure, value: number, thresholds: number[]): void;",
      "api.structures.setSpritesheetIndexByValueAtCell(cellX: number, cellY: number, value: number, thresholds: number[]): void;",
      "api.structures.update(structure: Structure, options?: { propagateToWorkers?: boolean; }): void;",
      "api.structures.setData(structure: Structure, partial: any, options?: { propagateToWorkers?: boolean; }): void;",
      "api.structures.buildAtCellWhenIdle(cellX: number, cellY: number, structureTypeOrId: string, options?: any): void;",
      "api.structures.removeAtCellWhenIdle(cellX: number, cellY: number, options?: { removeCells?: boolean; skipVisuals?: boolean; }): void;",
      "api.structures.removeBetweenCellsWhenIdle(startCellX: number, startCellY: number, endCellX: number, endCellY: number, options?: { removeCells?: boolean; preserveUnselectable?: boolean; onlyPositions?: { x: number; y: number; }[]; }): void;",
      "api.structures.removeAtCellsWhenIdle(positions: { x: number; y: number; }[], options?: { removeCells?: boolean; skipVisuals?: boolean; }): void;"
    ]
  },
  {
    "namespace": "api.tech",
    "context": "main",
    "signatures": [
      "api.tech.getDefinitionById(techId: string): any;",
      "api.tech.updateDefinition(techId: string, updates: any): void;",
      "api.tech.addDefinition(techId: string, definition: any): void;",
      "api.tech.registerNode(techId: TechGridId, definition: TechDefinition, options: { parentId: TechGridId; preferredPosition?: TechGridPosition; }): TechGridPosition;",
      "api.tech.isLockedById(techId: string | number): boolean;",
      "api.tech.setLockedById(techId: string | number, locked: boolean): void;"
    ]
  },
  {
    "namespace": "api.time",
    "context": "main",
    "signatures": [
      "api.time.getTimeMs(): number;",
      "api.time.getTick(): number;"
    ]
  },
  {
    "namespace": "api.tools.grabber",
    "context": "main",
    "signatures": [
      "api.tools.grabber.setSize(size: number): void;",
      "api.tools.grabber.getSize(): number;",
      "api.tools.grabber.isActive(): boolean;",
      "api.tools.grabber.isLoaded(): boolean;"
    ]
  },
  {
    "namespace": "api.terrains",
    "context": "main",
    "signatures": [
      "api.terrains.register(definition: TerrainDefinition): { cellType: number; };",
      "api.terrains.updateDefinition(cellTypeOrId: string | number, partial: Partial<TerrainDefinition>): void;",
      "api.terrains.getTypeFromId(terrainId: string): number;",
      "api.terrains.getTypeAtCell(cellX: number, cellY: number): number | null;",
      "api.terrains.getDataAtCell(cellX: number, cellY: number): { cellType: number; hp: number | null; } | null;",
      "api.terrains.isAtCell(cellX: number, cellY: number): boolean;",
      "api.terrains.isTypeAtCell(cellX: number, cellY: number, terrainId: string): boolean;",
      "api.terrains.isCellIdTerrain(cellId: number): boolean;",
      "api.terrains.createAtCellWhenIdle(cellX: number, cellY: number, terrainTypeOrId: string | number, options?: TerrainMutationOptions): void;",
      "api.terrains.replaceAtCellWhenIdle(cellX: number, cellY: number, terrainTypeOrId: string | number, options?: TerrainMutationOptions): void;",
      "api.terrains.removeAtCellWhenIdle(cellX: number, cellY: number, options?: TerrainMutationOptions): void;",
      "api.terrains.damageAtCell(cellX: number, cellY: number, damage: number): void;",
      "api.terrains.setHpAtCellWhenIdle(cellX: number, cellY: number, hp: number): void;"
    ]
  },
  {
    "namespace": "api.triggers",
    "context": "main",
    "signatures": [
      "api.triggers.register(triggerId: string, definition: MainTriggerDefinition): void;"
    ]
  },
  {
    "namespace": "api.ui",
    "context": "main",
    "signatures": [
      "api.ui.update(componentId: ComponentId, options?: any): void;",
      "api.ui.openPauseMenu(): void;",
      "api.ui.showTooltip(data: TooltipData): void;",
      "api.ui.toast(message: LocalizedText, options?: ToastOptions): void;",
      "api.ui.alert(message: LocalizedText, title?: LocalizedText): Promise<void>;",
      "api.ui.confirm(message: LocalizedText, title?: LocalizedText): Promise<boolean>;",
      "api.ui.prompt(message: LocalizedText, defaultValue?: string, placeholder?: LocalizedText, title?: LocalizedText, allowCopy?: boolean): Promise<string | null>;",
      "api.ui.inject(componentId: string, component: ComponentType<Record<string, never>>): () => void;"
    ]
  },
  {
    "namespace": "api.ui.overlays",
    "context": "main",
    "signatures": [
      "api.ui.overlays.register(slot: string, overlayId: string, render: () => any): void;",
      "api.ui.overlays.unregister(slot: string, overlayId: string): void;",
      "api.ui.overlays.update(slot: string): void;"
    ]
  },
  {
    "namespace": "api.ui.navigation",
    "context": "main",
    "signatures": [
      "api.ui.navigation.useFocusable<T extends HTMLElement = HTMLDivElement>(options: { readonly id: string; readonly scope: string; readonly onActivate: (element?: HTMLElement) => void; readonly onFocus?: (() => void); readonly disabled?: boolean; readonly x?: number; readonly y?: number; readonly neighbors?: Partial<Record<'left' | 'right' | 'up' | 'down', string>>; readonly scrollIntoView?: boolean; }): { readonly ref: RefObject<T>; readonly focused: boolean; readonly focus: () => void; };",
      "api.ui.navigation.useFocusScope(options: { readonly id: string; readonly active: boolean; readonly priority?: number; readonly defaultId?: string; readonly onBack?: (() => boolean | void); }): void;",
      "api.ui.navigation.controllerFocusClass(focused: boolean): string;"
    ]
  },
  {
    "namespace": "api.upgrades",
    "context": "main",
    "signatures": [
      "api.upgrades.registerCategory(definition: UpgradeCategoryDefinition): void;",
      "api.upgrades.register(definition: UpgradeDefinition): void;",
      "api.upgrades.updateDefinition(itemId: string, upgradeId: string, partial: Record<string, any>): void;",
      "api.upgrades.getLevelById(itemId: string, upgradeId: string): number;",
      "api.upgrades.getAvailableLevelById(itemId: string, upgradeId: string): number;"
    ]
  },
  {
    "namespace": "api.utils",
    "context": "main",
    "signatures": [
      "api.utils.getDistance(pointA: { x: number; y: number; }, pointB: { x: number; y: number; }): number;",
      "api.utils.getDirection(pointA: { x: number; y: number; }, pointB: { x: number; y: number; }): { x: number; y: number; };",
      "api.utils.getAngle(pointA: { x: number; y: number; }, pointB: { x: number; y: number; }): number;",
      "api.utils.getCoordinatesBetweenPoints(pointA: { x: number; y: number; }, pointB: { x: number; y: number; }): { x: number; y: number; }[];"
    ]
  },
  {
    "namespace": "api.world",
    "context": "main",
    "signatures": [
      "api.world.getCellIdAtCell(cellX: number, cellY: number): number;",
      "api.world.isCellEmptyAtCell(cellX: number, cellY: number): boolean;",
      "api.world.isTerrainAtCell(cellX: number, cellY: number): boolean;",
      "api.world.runWhenSimulationIdle(callback: () => void): void;",
      "api.world.reportActivityAtCell(cellX: number, cellY: number): void;",
      "api.world.excavateAtCell(cellX: number, cellY: number, outVelocity: { x: number; y: number; }, damage: number, options?: ExcavateOptions): void;",
      "api.world.revealFogAtCell(cellX: number, cellY: number): void;",
      "api.world.redrawAroundCellWhenIdle(cellX: number, cellY: number, range: number): void;"
    ]
  },
  {
    "namespace": "api.world.pickups",
    "context": "main",
    "signatures": [
      "api.world.pickups.spawnAtWorld(type: WorldItemType, worldX: number, worldY: number, data?: any, light?: WorldItemLight): any;",
      "api.world.pickups.destroy(worldItem: any): void;",
      "api.world.pickups.pickUp(worldItem: any): boolean;",
      "api.world.pickups.getAll(): any[];",
      "api.world.pickups.getById(worldItemId: number): any;"
    ]
  },
  {
    "namespace": "api.shared.buffers",
    "context": "main",
    "signatures": [
      "api.shared.buffers.create(key: string, config: { type: SharedArrayType; length: number; }): SharedArray;",
      "api.shared.buffers.get(key: string): SharedArray | undefined;"
    ]
  },
  {
    "namespace": "api.workers",
    "context": "main",
    "signatures": [
      "api.workers.setPostUpdateEnabled(enabled: boolean): void;"
    ]
  },
  {
    "namespace": "api.collector",
    "context": "worker",
    "signatures": [
      "api.collector.getValueFromCellId(cellId: number): number;",
      "api.collector.getValueByType(elementType: number): number;",
      "api.collector.isCellIdCollectable(cellId: number): boolean;",
      "api.collector.isCellIdCollectableForSprite(cellId: number): boolean;",
      "api.collector.notifyPickupAtCell(cellX: number, cellY: number): void;"
    ]
  },
  {
    "namespace": "api.effects",
    "context": "worker",
    "signatures": [
      "api.effects.createEffectAtWorld(effectId: string, worldX: number, worldY: number, options?: any): void;",
      "api.effects.createLightAtWorld(worldX: number, worldY: number, options?: TemporaryLightOptions): { index: number | null; };",
      "api.effects.createParticlesAtWorld(worldX: number, worldY: number, options?: ParticleEffectOptions): void;"
    ]
  },
  {
    "namespace": "api.elements",
    "context": "worker",
    "signatures": [
      "api.elements.getTypeFromId(elementId: string): ElementType;",
      "api.elements.getDefinitionByType(elementType: ElementType): ElementDefinition | undefined;",
      "api.elements.getTypeAtCell(cellX: number, cellY: number): ElementType | null;",
      "api.elements.getResolvedTypeAtCell(cellX: number, cellY: number): ElementType | null;",
      "api.elements.getResolvedTypeFromCellId(cellId: number): ElementType | null;",
      "api.elements.getInfoAtCell(cellX: number, cellY: number): { elementType: ElementType; isParticle: boolean; cellId: number; elementIndex: number; } | null;",
      "api.elements.getMatterTypeAtCell(cellX: number, cellY: number): MatterType | null;",
      "api.elements.isTypeAtCell(cellX: number, cellY: number, elementType: ElementType): boolean;",
      "api.elements.isFreeFallingAtCell(cellX: number, cellY: number): boolean;",
      "api.elements.createAtCell(cellX: number, cellY: number, elementType: ElementType, options?: ElementCreateOptions): void;",
      "api.elements.replaceAtCell(cellX: number, cellY: number, elementType: ElementType, options?: ElementCreateOptions): void;",
      "api.elements.removeAtCell(cellX: number, cellY: number, options?: ElementRemovalOptions): void;",
      "api.elements.moveBetweenCells(fromCellX: number, fromCellY: number, toCellX: number, toCellY: number): boolean;",
      "api.elements.teleportBetweenCells(fromCellX: number, fromCellY: number, toCellX: number, toCellY: number): void;",
      "api.elements.swapCells(firstCellX: number, firstCellY: number, secondCellX: number, secondCellY: number): boolean;",
      "api.elements.getVelocityAtCell(cellX: number, cellY: number): { x: number; y: number; } | null;",
      "api.elements.setVelocityAtCell(cellX: number, cellY: number, velocity: { x: number; y: number; }): boolean;",
      "api.elements.addParticleVelocityAtCell(cellX: number, cellY: number, velocity: { x: number; y: number; }, maxSpeed?: number): boolean;",
      "api.elements.convertToParticleAtCell(cellX: number, cellY: number, velocity: { x: number; y: number; }): boolean;",
      "api.elements.convertFromParticleAtCell(cellX: number, cellY: number): boolean;",
      "api.elements.getDataFieldAtCell(cellX: number, cellY: number, fieldNumber: 1 | 2 | 3 | 4): number | null;",
      "api.elements.setDataFieldAtCell(cellX: number, cellY: number, fieldNumber: 1 | 2 | 3 | 4, value: number): boolean;",
      "api.elements.refreshColorAtCell(cellX: number, cellY: number): void;",
      "api.elements.markMovementBlockedByElementIndex(elementIndex: number): void;",
      "api.elements.setPhysicsAtCell(cellX: number, cellY: number, physicsState: number): void;",
      "api.elements.setDurationAtCell(cellX: number, cellY: number, duration: number, options?: { updateMax?: boolean; }): boolean;"
    ]
  },
  {
    "namespace": "api.events",
    "context": "worker",
    "signatures": [
      "api.events.on<Payload = any>(eventId: string, callback: (payload: Payload) => void, options?: WorkerEventOptionsV1): () => void;",
      "api.events.emit<Payload = any>(eventId: string, payload: Payload, options?: WorkerEventOptionsV1): void;"
    ]
  },
  {
    "namespace": "api.hooks",
    "context": "worker",
    "signatures": [
      "api.hooks.intercept<Args = any>(hookId: string, callback: (args: Args, context: HookContext) => void, options?: WorkerHandlerOptionsV1): () => void;",
      "api.hooks.modify<Args = any>(hookId: string, callback: (args: Args) => void, options?: WorkerHandlerOptionsV1): () => void;"
    ]
  },
  {
    "namespace": "api.maps",
    "context": "worker",
    "signatures": [
      "api.maps.getActive(): Readonly<ActiveMapV1> | null;"
    ]
  },
  {
    "namespace": "api.fire",
    "context": "worker",
    "signatures": [
      "api.fire.canBurnElementAtCell(cellX: number, cellY: number): boolean;",
      "api.fire.burnElementAtCell(cellX: number, cellY: number): boolean;"
    ]
  },
  {
    "namespace": "api.patterns",
    "context": "worker",
    "signatures": [
      "api.patterns.createCircle(size: number): number[][];",
      "api.patterns.excavateAtCell(cellX: number, cellY: number, pattern: number[][], outVelocity: { x: number; y: number; }, power: number, options?: PatternExcavateOptions): void;"
    ]
  },
  {
    "namespace": "api.player",
    "context": "worker",
    "signatures": [
      "api.player.getWorldPosition(): { x: number; y: number; };",
      "api.player.isCollidingWithCell(cellX: number, cellY: number): boolean;",
      "api.player.isWithinRadiusOfCell(cellX: number, cellY: number, radius: number): boolean;"
    ]
  },
  {
    "namespace": "api.random",
    "context": "worker",
    "signatures": [
      "api.random.int(min: number, max: number): number;",
      "api.random.float(min: number, max: number): number;"
    ]
  },
  {
    "namespace": "api.structures.processing",
    "context": "worker",
    "signatures": [
      "api.structures.processing.isEnabledAt(cellX: number, cellY: number): boolean;"
    ]
  },
  {
    "namespace": "api.structures",
    "context": "worker",
    "signatures": [
      "api.structures.getAtCell(cellX: number, cellY: number): Structure | null;",
      "api.structures.getDefinitionByType(structureType: string | StructureType): any;",
      "api.structures.getTypeFromId(structureId: string): string | StructureType;",
      "api.structures.hasBuiltAtCell(cellX: number, cellY: number): boolean;",
      "api.structures.isType(structure: Structure | null, structureId: string): boolean;",
      "api.structures.isTypeAtCell(cellX: number, cellY: number, structureId: string): boolean;",
      "api.structures.forEachOfType(structureTypeOrId: string | StructureType, callback: (structure: Structure) => void): void;",
      "api.structures.update(structure: Structure, options?: { propagateToWorkers?: boolean; }): void;",
      "api.structures.setData(structure: Structure, partial: any, options?: { propagateToWorkers?: boolean; }): void;",
      "api.structures.setSpritesheetIndex(structure: Structure, index: number): void;",
      "api.structures.setSpritesheetIndexAtCell(cellX: number, cellY: number, index: number): void;",
      "api.structures.setSpritesheetIndexByValue(structure: Structure, value: number, thresholds: number[]): void;",
      "api.structures.setSpritesheetIndexByValueAtCell(cellX: number, cellY: number, value: number, thresholds: number[]): void;"
    ]
  },
  {
    "namespace": "api.terrains",
    "context": "worker",
    "signatures": [
      "api.terrains.getTypeFromId(terrainId: string): number;",
      "api.terrains.getTypeAtCell(cellX: number, cellY: number): number | null;",
      "api.terrains.getDataAtCell(cellX: number, cellY: number): { cellType: number; hp: number | null; } | null;",
      "api.terrains.isAtCell(cellX: number, cellY: number): boolean;",
      "api.terrains.isTypeAtCell(cellX: number, cellY: number, terrainId: string): boolean;",
      "api.terrains.isCellIdTerrain(cellId: number): boolean;",
      "api.terrains.createAtCell(cellX: number, cellY: number, terrainTypeOrId: string | number, options?: TerrainMutationOptions): void;",
      "api.terrains.replaceAtCell(cellX: number, cellY: number, terrainTypeOrId: string | number, options?: TerrainMutationOptions): void;",
      "api.terrains.removeAtCell(cellX: number, cellY: number, options?: TerrainMutationOptions): void;",
      "api.terrains.damageAtCell(cellX: number, cellY: number, damage: number): void;",
      "api.terrains.setHpAtCell(cellX: number, cellY: number, hp: number): boolean;"
    ]
  },
  {
    "namespace": "api.ui",
    "context": "worker",
    "signatures": [
      "api.ui.toast(message: LocalizedText, options?: ToastOptions): void;"
    ]
  },
  {
    "namespace": "api.utils",
    "context": "worker",
    "signatures": [
      "api.utils.getDistance(pointA: { x: number; y: number; }, pointB: { x: number; y: number; }): number;",
      "api.utils.getDirection(pointA: { x: number; y: number; }, pointB: { x: number; y: number; }): { x: number; y: number; };",
      "api.utils.getAngle(pointA: { x: number; y: number; }, pointB: { x: number; y: number; }): number;",
      "api.utils.getCoordinatesBetweenPoints(pointA: { x: number; y: number; }, pointB: { x: number; y: number; }): { x: number; y: number; }[];"
    ]
  },
  {
    "namespace": "api.world",
    "context": "worker",
    "signatures": [
      "api.world.getCellIdAtCell(cellX: number, cellY: number): number;",
      "api.world.isCellEmptyAtCell(cellX: number, cellY: number): boolean;",
      "api.world.isTerrainAtCell(cellX: number, cellY: number): boolean;",
      "api.world.reportActivityAtCell(cellX: number, cellY: number): void;",
      "api.world.excavateAtCell(cellX: number, cellY: number, outVelocity: { x: number; y: number; }, damage: number, options?: ExcavateOptions): void;"
    ]
  },
  {
    "namespace": "api.main",
    "context": "worker",
    "signatures": [
      "api.main.emitEvent<Payload = any>(eventId: string, payload: Payload): void;"
    ]
  },
  {
    "namespace": "api.worker",
    "context": "worker",
    "signatures": [
      "api.worker.getIndex(): number;",
      "api.worker.getCount(): number;"
    ]
  },
  {
    "namespace": "api.shared.buffers",
    "context": "worker",
    "signatures": [
      "api.shared.buffers.get(key: string): SharedArray | undefined;",
      "api.shared.buffers.require(key: string, config: { type: SharedArrayType; length: number; }): SharedArray;"
    ]
  }
];
