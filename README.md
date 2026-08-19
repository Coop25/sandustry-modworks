# Sandustry Modworks

Sandustry mods, Sandkit API documentation, practical development guides, and AI-ready reference material maintained by [Coop25](https://github.com/Coop25).

[Open the documentation](https://coop25.github.io/sandustry-modworks/) · [Browse the API Explorer](https://coop25.github.io/sandustry-modworks/api.html) · [Give the docs to an AI](https://coop25.github.io/sandustry-modworks/llms-full.txt)

## Mods

| Mod | Version | Description | Links |
| --- | ---: | --- | --- |
| **Distributor** | 1.4.2 | Adds a connected logistics building that distributes incoming materials evenly across available outputs, including gas-only upward transport from below. | [Source](./distributor/) · [Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3785874614) |
| **Void Gun Overhaul** | 2.0.1 | Expands the Void Gun with terrain abilities, blast-radius upgrades, additional tank capacity, and improved Sunsand behavior. | [Source](./void-gun-overhaul/) · [Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3785761682) |

Each released mod keeps its own manifest, source code, assets, preview, documentation, and `workshop.json` identity inside its folder.

## Modding documentation

The repository also contains community-focused Sandustry modding documentation built around Sandkit API v1 and verified working mods.

- [Documentation homepage](https://coop25.github.io/sandustry-modworks/)
- [Practical modding guides](https://coop25.github.io/sandustry-modworks/guides.html)
- [Searchable API Explorer](https://coop25.github.io/sandustry-modworks/api.html)
- [Steam Workshop publishing guide](https://coop25.github.io/sandustry-modworks/publishing.html)
- [Exact API method reference](./docs/apireference.md)
- [Mod folder structure](./docs/modstructure.md)
- [Texture and configuration overrides](./docs/textureconfig.md)
- [Bundle patching](./docs/patching.md)
- [Custom maps](./docs/custommaps.md)

The API Explorer currently indexes 372 main-entry and worker-entry methods. Entries include exact signatures, plain-language descriptions, example use cases, starter code, typical output, and an **Observed in game** badge when an output was verified through the diagnostic probe.

## AI-ready context

To give an AI enough context to help create, review, or debug a Sandustry mod, provide this single URL:

```text
https://coop25.github.io/sandustry-modworks/llms-full.txt
```

That document combines the practical AI guide, exact main/worker API signatures, manifest structure, overrides, patching, and custom-map reference into one plain-text resource.

The smaller [`llms.txt`](./docs/llms.txt) file provides AI discovery links, while [`ai-context.md`](./docs/ai-context.md) contains the core reliability rules and development patterns.

## Installing a mod

1. Download or clone this repository.
2. Choose the individual mod folder you want, such as `distributor` or `void-gun-overhaul`.
3. Copy that complete folder into Sandustry's local mods directory.
4. Start Sandustry and enable the mod.
5. Check the mod's own README and Workshop page for features, compatibility information, and update notes.

Do not install `api-documentation-probe` for normal gameplay. It is a development-only diagnostic mod used to capture real Sandkit return values for the documentation.

## Repository layout

```text
sandustry-modworks/
├─ distributor/                 # Distributor mod
├─ void-gun-overhaul/           # Void Gun Overhaul mod
├─ api-documentation-probe/     # Development-only API probe
├─ docs/                        # GitHub Pages root and public documentation
│  ├─ index.html               # Public documentation homepage
│  ├─ api.html                 # Searchable API Explorer
│  ├─ llms.txt                 # Public AI discovery file
│  ├─ llms-full.txt            # Public single-file AI context
│  ├─ apireference.md          # Exact Sandkit API signatures
│  └─ ai-context.md            # Practical AI modding guide
```

## Working on mods

Before changing or creating a mod:

1. Read the [practical guides](https://coop25.github.io/sandustry-modworks/guides.html).
2. Confirm every API call in the [API Explorer](https://coop25.github.io/sandustry-modworks/api.html).
3. Keep main-thread and worker-thread APIs separate.
4. Use `WhenIdle` methods or other documented safe boundaries for main-thread simulation mutations.
5. Preserve stable mod IDs and existing `workshop.json` files.
6. Validate JavaScript syntax, strict JSON parsing, asset paths, and bundle-patch match counts before testing in game.

## Feedback

Feedback, bug reports, documentation corrections, and mod ideas are welcome. Open an issue in [Sandustry Modworks](https://github.com/Coop25/sandustry-modworks/issues) with the affected mod or documentation page, the Sandustry build you tested, and steps to reproduce the problem.
