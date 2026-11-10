# Roomba

Literally just a little Roomba moving around Lumiverse.

It rolls around the screen, bumps into the edges, turns, and carries on. No sounds, chat changes, AI calls, or remote assets. The robot is click-through, so you can use Lumiverse normally. It pauses in hidden tabs and parks when your device requests reduced motion. Disabling the extension removes it completely.

## Googly eye mode

Open the **Extensions settings**, as with LumiWeather, and turn on **Googly eye mode** for two loose googly pupils that react to acceleration, braking, and turning. Turn it off for the original Roomba. The choice is saved in Lumiverse extension settings and survives reloads. Gravity settles the pupils against the bottom rims. They use inertia, friction, and collisions with the eye rims, with no looping animation. Eye physics pauses with the Roomba and respects reduced motion.

## Install

This folder is a standalone Spindle extension. Copy its contents (excluding `node_modules`) into `<Lumiverse data directory>/extensions/lumi_roomba/repo/`, so `spindle.json` is directly inside `repo`. In Lumiverse's Extensions tab, click **Import local**. Alternatively, publish this folder to a GitHub repository and install its repository URL. The manifest's GitHub URL is the intended repository address; this project has not been published by creating these files.

Enable **Roomba** and grant **app_manipulation** so it can mount its roaming overlay. No other permissions are requested. Requires Lumiverse 1.2.4 or newer with `ctx.ui.mountApp` support.

The committed `dist/frontend.js` is ready to load; users do not need to build it.

## Develop

Use Bun:

```sh
bun install
bun run typecheck
bun test
bun run build
bun run preview
```

The preview at http://127.0.0.1:4178 uses a minimal mock host to check animation and unloading independently of a live Lumiverse session.
