# Native desktop builds

KAPLAY games can be packaged as native Windows, Linux, and macOS applications
with Steam overlay and Steamworks support through the
[`kaplay-native`](https://github.com/kaplayjs/kaplay-native) runtime.

> [!NOTE]
> The native runtime is experimental and lives in its own repository. KAPLAY's
> browser behavior and public API are not affected by it, and no changes to
> game code are required for the supported feature set.

## Why a custom runtime

Steam's overlay attaches to the graphics API calls a game makes when it
presents frames (WGL/GLX swap, DXGI `Present`, Vulkan `vkQueuePresentKHR`).
Webview shells such as Tauri, Wails, and Neutralino do not expose that device
creation to the game process — WebView2 renders through DirectComposition in a
separate process — which is why the Steam overlay cannot hook them.

`kaplay-native` therefore ships a small Rust host that owns the window and
presents frames through OpenGL itself, runs the game in an embedded QuickJS
engine, and provides the browser APIs KAPLAY expects (`window`, `document`,
canvas, WebGL, Web Audio, `fetch`, and so on) as a drop-in shim. No Chromium or
other browser engine is involved.

## Usage

Install the CLI in a game project:

```sh
pnpm add -D kaplay-native
```

Add a `kaplay-native.config.json`:

```json
{
  "name": "My Game",
  "version": "1.0.0",
  "entry": "src/main.js",
  "appId": 123456,
  "assets": ["assets/**/*"],
  "window": { "width": 960, "height": 540 }
}
```

Run the game natively during development:

```sh
pnpm kaplay-native dev
```

Produce a build folder per platform:

```sh
pnpm kaplay-native build --target win-x64
```

`build` emits a folder containing `kaplay-native-host`, `game.pak`, and the
game icon, plus a sample `app_build_<appid>.vdf` for `steamcmd`. macOS builds
are wrapped in a `.app` bundle.

### Steam

Steam redistributables are never bundled in public releases. Pass the Steamworks
SDK redistributable directory when producing a release build:

```sh
pnpm kaplay-native build --target linux-x64 --steam-sdk /path/to/steamworks/sdk/redistributable_bin
```

When the game is launched from Steam with the overlay enabled, Shift+Tab and
achievement toasts work out of the box. `kaplay-native doctor --steam` prints
init status, app id, and overlay state to help with setup.

Games can import Steam features from `@kaplayjs/native`; the same import is
safe in browser builds and reports `steam.available === false` there.

## Compatibility

Tier 1 features are expected to match the browser:

- Sprites, shapes, text, shaders, fonts, audio, keyboard, mouse, gamepads,
  scenes, timers, `localStorage` save data, and screenshots.

Tier 2 features are best-effort:

- Touch input, pointer lock, and debug recording.

Out of scope for v1:

- `video()`, `WebGL2`, `WebGPU`, workers, WebRTC, dynamic ESM imports, and
  top-level await.

## Verification

Each release is checked with:

- The `@test`-marked examples in this repository, run headlessly on Linux with
  software rendering, comparing screenshots against stored goldens.
- A manual overlay matrix on Windows, Linux, and macOS covering windowed and
  fullscreen modes, achievement toasts, and Steam Deck (native and Proton).
