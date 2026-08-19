# Void Gun Overhaul

This Sandustry mod extends the normal **Void Gun**:

- Sunsand caught in its blast becomes ordinary Sand instead of hardening into
  Dune terrain.
- A persistent five-level **Terrain Abilities** progression appears under
  Utility upgrades while the Void Gun is owned:

  1. Dune excavation creates ordinary Sand instead of Sunsand.
  2. Stone is removed in one shot with 8 damage.
  3. Copper Ore is mined in one shot with 12 damage and produces Copper.
  4. Ice melts into Water.
  5. Sandstone is removed in one shot with 42 damage.

- Terrain Ability tiers cost 100, 300, 750, 1,500, and 3,000 upgrade currency.
- A persistent five-level **Blast Radius** upgrade appears under Utility
  upgrades while the Void Gun is owned. Each level adds 4 cells to the radius.
- The radius upgrade costs 100, 300, 750, 1,500, and 3,000 upgrade currency.
- The native **Tank Capacity** upgrade is extended from 3 to 5 levels. Each
  level adds 2,000 Voidjuice capacity, raising the maximum from 10,000 to
  14,000. The two new tiers cost 4,000 and 8,000 upgrade currency.
- These values modify the Void Gun's native excavation options. The mod does
  not directly set terrain HP.
- The affected area grows with the gun's charge, matching the native blast.
- The normal Voidjuice cost, unlock, charging, visuals, and sound are unchanged.

## Install

Copy the entire `void-gun-overhaul` directory into Sandkit's `mods` directory,
then enable **Void Gun Overhaul** and restart Sandustry if Sandkit asks you to.

## Steam Workshop upload

Place this folder in Sandustry's local `mods` directory and launch the game
through Steam. Open **Mods**, choose **Create mods**, and upload **Void Gun
Overhaul**. Sandustry uses `preview.png` as the Workshop thumbnail and creates
`workshop.json` after the first successful upload. Keep that generated file for
future updates to the same Workshop item.

Sunsand and Ice conversion wrap the Void Gun projectile's native hit handler
through the public Sandkit API. Dune output and native terrain damage use
strict match-count patches for the main and simulation bundles; Sandkit will
reject those patches safely if a future game update changes the target code.
