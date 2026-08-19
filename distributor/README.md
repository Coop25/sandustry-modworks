# Distributor

Adds a **Distributor** logistics structure researched immediately after the
base game's Advanced Filter technology and reuses its visual style.

Version 1.4.2 prevents fire from entering the network in either direction.
Version 1.4.1 reduced allocation pressure during sustained throughput and added
cheap cached-member validation before rebuilding network topology.

## Behavior

- A click places one square Distributor; click-drag places separate adjacent
  Distributors that automatically form one network.
- Every edge- or corner-adjacent Distributor belongs to the same multiblock network.
- Any solid, liquid, or gas touching the four-cell top edge of a Distributor is
  accepted.
- Gas touching a bottom edge is accepted and distributed upward across the
  network. Solids and liquids touching the bottom are not accepted.
- Fire is ignored at both top and bottom inputs.
- Accepted materials are sent below connected Distributor blocks in deterministic
  round-robin order, giving an even distribution over time.
- The solid 4x4 body prevents material on top from falling through while all
  outputs are obstructed; it waits until the network can distribute it.
- If the next block is obstructed, the network tries the next available output.
- Horizontal, vertical, and diagonal drag directions are supported in either
  direction; only blocks with free space underneath can act as outputs.
- Networks are limited to 256 connected Distributor blocks.
- Empty or fully blocked networks gradually back off to one scan every eight
  simulation ticks and immediately return to per-tick processing after a move.

## Install

Copy `distributor` into Sandustry's local `mods` directory and restart the game.
Research the Distributor node after Advanced Filter to unlock the building.

## Steam Workshop upload

Place the `distributor` folder in Sandustry's local `mods` directory and launch
the game through Steam. Open **Mods**, choose **Create mods**, select
**Distributor**, and click **Upload**. Sandustry uses `preview.png` as the
Workshop thumbnail and creates `workshop.json` after the first successful
upload. Keep that generated file for future updates to the same Workshop item.
