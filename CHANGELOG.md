# Changelog

<!-- markdownlint-disable no-duplicate-heading blanks-around-fences single-h1 -->

All notable changes to this project will be documented in this file.

The format is (mostly) based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

- Breaking changes are marked with: **(!)**.
- [Jump to v3001 changelog](#changelog-for-v3001).

<!--
Hey, KAPLAY Dev, you must changelog here, in unreleased, so later your
best friend, lajbel, can put the correct version name here
-->

## [unreleased]

### Added

- Added `tileMode` option to 9-slice sprites with four tiling strategies:
  `'none'` (stretch all), `'edges'` (tile edges only), `'center'` (tile center
  only), and `'all'` (tile both edges and center) (#996) - @JustKira
- Added a `calculate()` method to the internal FPS counters, so advanced users
  can access them to create their own FPS monitor (#1010) - @dragoncoder047
- Added Intl.Segmenter-based grapheme splitting for proper Indic language
  support, via the `locale` option in `DrawTextOpt (#1013) - @shajidhasan
- Added topMostOnlyActivate kaplay option. When true, only the topmost object
  will receive clicks. This avoids problems in a UI where elements overlap -
  @mflerackers

### Changed

- Updated `drawSprite()` to allow slice9'ed sprites, and so now the `sprite()`
  component just calls `drawSprite()` (#1036) - @dragoncoder047
- Updated the texture packer to use a new packing algorithm which may get more
  sprites onto the same texture, improving graphics batching performance
  (#1011) - @dragoncoder047

### Fixed

- Fixed tiled mode drawing of sprites ignoring opacity when it was 0 (#1020) -
  @dragoncoder047
- Now, all global events handlers are avaible in scopes, `app.onXXXX` and
  `scene.onXXXX()` (#977) - @lajbel
- Fixed input events attached to paused ancestors not being paused (#1009) -
  @amyspark-ng, @dragoncoder047
- Fixed type `UniformValue` union not including `Texture`, a valid option
  (#1018) - @dragoncoder047
- Text component no longer hangs if the requested width is too narrow for a
  single character - @dragoncoder047
- Fixed input events attached to paused ancestors not being paused (#1009) -
  @amyspark-ng, @dragoncoder047
- Fixed type `UniformValue` union not including `Texture`, a valid option
  (#1018) - @dragoncoder047
- Fixed event crash when using `onLoad` or other events that doesn't return an
  EventController, and then using `go()` (#1024) - @lajbel, credits to
  @dragoncoder047
- Fixed `onClick()` and `onCollide()` tag variants no longer working -
  @mflerackers

## [4000.0.0-alpha.26] - 2026-01-12

### Added

- Added `floodFill()` for puzzle games - @mflerackers
- Added `AreaComp.isVisuallyColliding` to test collisions in screen space. This
  can be used for fixed objects which do not necessarily collide in world space.
  Note that this involves additional processing as it tests outside the
  collision system, which works in world space - @mflerackers
- Added `buildConnectivityMap()` - @mflerackers
- Added `buildConvexHull()` - @mflerackers

### Changed

- **(!)** Added `AreaCompOpt.isSensor`. Areas without body or is sensor will no
  longer be eligible for collisions - @mflerackers
- Both worldPos and screenPos are properties now - @mflerackers

### Fixed

- Fixed `tween()` not cloning the passed vectors/colors - @lajbel
- Fixed `timer()` related events (tween/loop/wait) not taking `debug.timeScale`
  into account - @Stanko
- Fixed the vibration effect on bodies introduced in alpha.25 thanks to
  @lajbel's debugging skills - @mflerackers
- Fixed `SpriteComp.hasAnim()` returning false erroneously when the animation
  named was just constant frame 0 - @dragoncoder047
- Fixed `levelComp.serialize()` use _for...of_ in the place of the _for...in_
  when looping through the tile object keys - @benhuangbmj
- Fixed input events attached to a game object having the event's paused value
  reset when the object is paused or unpaused - @dragoncoder047
- Hidden objects are processed again in transform - @mflerackers
- When the parent is changed, the transform is invalidated - @mflerackers
- Fixed click and hover for `fixed()` objects - @mflerackers
- Object toWorld/fromWorld/toScreen/fromScreen work more logical now -
  @mflerackers
- Sticky platforms work again - @mflerackers

## Removed

- **(!)** `onClick(() => {})` was removed, use `onMousePress()` instead.
  `onClick("tag", () => {});` stays the same,

## [4000.0.0-alpha.25] - 2025-12-23

### Added

- Added the `fakeMouseMove` event in `FakeMouseComp`, it will triggers when you
  move the object - @lajbel
- Global `retrieve()` method to get the objects with area within a certain
  rectangle - @mflerackers

## Changed

- **(!)** You can no longer change the position of an object by doing obj.pos.x
  += 1. You need to assign a new Vec2 or use moveBy instead - @mflerackers
- Transforms are now only recalculated when needed. Thus static objects no
  longer increase computation in the transform phase - @mflerackers
- Areas are now only recalculated when the area settings or (optional)
  renderArea has changed - @mflerackers
- World (transformed) areas are now only recalculated when the area or transform
  has changed - @mflerackers
- World bounding boxes are now only recalculated when the world area has
  changed - @mflerackers
- Broad stage collision detection spatial structures are now only updated when
  an object's world bounding box has changed - @mflerackers
- The grid broadphase has been rewritten for performance - @mflerackers
- Global `retrieve()` method to get the objects with area within a certain
  rectangle - @mflerackers

## [4000.0.0-alpha.24] - 2025-12-12

### Added

- Added the `maxTimeStep` and `fixedUpdateMode` options, as well as
  `setFixedSpeed()` for more granular control over fixed update and timing -
  @dragoncoder047
- Added parameterized formatting tags like `"[color=red]Red text![/color]"` in
  `CharTransformFunc` for more powerful text formatting options -
  @dragoncoder047
- Added `createRegularPolygon()` and `createStarPolygon()` to create 2D regular
  polytopes - @mflerackers
- Added `createCogPolygon()` to create 2D regular cogs - @mflerackers
- Added `getSpriteOutline()` that takes a sprite asset and returns a polygon
  showing the outline - @milosilo-dev
- Added Quadtree for collision detection (only for fixed size screen for now,
  needs expansion) - @mflerackers
- Added vertical sweep and prune - @mflerackers
- Added configuration to choose broad phase algorithm - @mflerackers

### Fixed

- Fixed the `fakeMouse()` component not giving the right position when the
  camera transform was not the identity matrix - @dragoncoder047
- Fixed tall fonts being cropped - @anthonygood
- Fixed the sprite animation `onEnd()` callback being called before the
  animation actually stopped, so if the onEnd callback started a new animation,
  the new animation was instantly stopped - @dragoncoder047
- Now `playMusic()` actually uses the requested volume and playback rate given
  in the options - @dragoncoder047

## [4000.0.0-alpha.23] - 2025-11-05

### Added

- Added `getGamepadAnalogButton()` to read the analog value of buttons like the
  triggers - @dragoncoder047

  ```js
  isGamepadButtonDown("rtrigger"); // -> true/false, 0/1
  getGamepadAnalogButton("rtrigger"); // -> analog value between 0 (not pressed) and 1 (fully pressed)
  ```

- Added chorded button bindings using the Buttons API, so you can bind different
  actions to `tab` and `shift+tab`, and handle them like normal. Also works with
  gamepads and mouse! - @dragoncoder047

  ```js
  kaplay({
      buttons: {
          forward: {
              keyboard: "tab",
              gamepad: "south",
          },
          backward: {
              keyboard: "shift+tab",
              gamepad: "rshoulder+south",
          },
      },
  });
  ```

- Added `skew` to text formatting, so now italics is possible - @dragoncoder047

- Added **lifetime scopes**, a way to define the lifetime of an event handler
  using a specific scope, `scene`, `app` or a game object - @lajbel,
  @dragoncoder047

  ```js
  app.onUpdate(() => {
      // runs until it is cancelled
  });

  scene("game", () => {
      const obj = add([]);

      obj.onUpdate(() => {
          // runs until obj is destroyed
      });

      scene.onUpdate(() => {
          // or just onUpdate(() => {
          // runs until scene is changed
      });
  });
  ```

  All the available handlers in the scopes are `GameEventHandlers` ones:
  - `onKeyDown()`
  - `onKeyPress()`
  - `onKeyPressRepeat()`
  - `onKeyRelease()`
  - `onCharInput()`
  - `onMouseDown()`
  - `onMousePress()`
  - `onMouseRelease()`
  - `onMouseMove()`
  - `onScroll()`
  - `onTouchStart()`
  - `onTouchMove()`
  - `onTouchEnd()`
  - `onGamepadConnect()`
  - `onGamepadDisconnect()`
  - `onGamepadButtonDown()`
  - `onGamepadButtonPress()`
  - `onGamepadButtonRelease()`
  - `onGamepadStick()`
  - `onButtonDown()`
  - `onButtonPress()`
  - `onButtonRelease()`
  - `onTabHide()`
  - `onTabShow()`

  And this game object handlers may differ when using it with `obj` and
  `scene`/`app`:
  - `onFixedUpdate()`
  - `onUpdate()`
  - `onDraw()`

- Added `app` scope for app event handlers - @lajbel

  ```js
  app.onUpdate(() => {
      // runs until it is cancelled
  });
  ```

- Added `KAPLAYOpt.defaultLifetimeScope` for setting the default lifetime scope
  used for event handlers - @lajbel

  ```js
  kaplay({
      defaultLifetimeScope: "app", // default is "scene"
  });

  onKeyPress("space", () => {
      // runs until is cancelled
  });
  ```

- Added `skew` to text formatting, so now italics is possible - @dragoncoder047

### Changed

- (**!**) Renamed `onShow()` to `onTabShow()` and `onHide()` to `onTabHide()` -
  @lajbel

- In addition to being the `scene()` function, now `scene` is also a scope for
  scene event handlers - @lajbel

  ```js
  scene("game", () => {
      scene.onUpdate(() => {
          // or just onUpdate(() => {
          // runs until scene is changed
      });
  });
  ```

### Fixed

- Now `pushScene()` and `popScene()` give the arguments to the scene in the same
  way that `go()` does rather than passing them all to the first argument as an
  array - @dragoncoder047
- Fixed a flicker due to the fadeIn not setting opacity until the next frame -
  @mflerackers
- Fixed FPS cap not working correctly - @mflerackers, @dragoncoder047

## [4000.0.0-alpha.22] - 2025-10-9

### Added

- Added `KAPLAYOpt.types`, `kaplayTypes()` and `Opt` to config specific
  TypeScript Advanced Features (TAF) - @lajbel

  ```ts
  kaplay({
      types: kaplayTypes<
          // Opt<> is optional but recommended to get autocomplete
          Opt<{
              scenes: {}; // define scenes and arguments
              strictScenes: true; // you can only use defined scenes
          }>
      >(),
  });
  ```

- Added `TypesOpt.scenes` to type scenes and parameters - @lajbel

  ```ts
  const k = kaplay({
      types: kaplayTypes<
          Opt<{
              scenes: {
                  game: [gamemode: "normal" | "hard"];
                  gameOver: [score: number, highScore: number];
              };
          }>
      >(),
  });

  // If you trigger autocomplete it shows "game" or "gameOver"
  k.scene("game", (gamemode) => {
      // gamemode is now type "normal" | "hard"

      // @ts-expect-error Argument of type 'string' is not assignable
      // to parameter of type 'number'.
      k.go("gameOver", "10", 10); //
  });
  ```

  The methods that support this are:
  - `scene`
  - `go`
  - `onSceneLeave`
  - `getSceneName`

- Added `TypesOpt.strictScenes` to make usable scenes just the ones defined -
  @lajbel

  ```ts
  const k = kaplay({
      types: kaplayTypes<
          Opt<{
              scenes: {
                  game: [gamemode: "normal" | "hard"];
                  gameOver: [score: number, highScore: number];
              };
              strictScenes: true;
          }>
      >(),
  });

  // @ts-expect-error Argument of type '"hi"' is not assignable to
  // parameter of type '"game" | "gameOver"'.
  k.scene("hi", () => {});
  ```

- Added named animations - @mflerackers

  By giving a name to an animation, you can define more than one animation

  ```js
  const anim = obj.animation.get("idle");
  anim.animate("pos", [0, 5, 0], { relative: true });
  ```

- Added `screenshotToBlob()` to get a screenshot as a `Blob` - @dragoncoder047
- Added `getButtons()` to get the input binding buttons definition - @lajbel
- Added `RuleSystem`, `DecisionTree` and `StateMachine` for enemy AI -
  @mflerackers
- Added constraint components for distance, translation, rotation, scale and
  transform constraints - @mflerackers
- Added inverse kinematics constraint components using FABRIK and CCD, the
  latter one can use bone constraints to constrain the angle - @mflerackers
- Added skew to Mat23, transformation stack, RenderProps, GameObjRaw as well as
  a component - @mflerackers
- Added texture uniforms, in order to access more than one texture at a time in
  shaders - @mflerackers

### Fixed

- Now error screen should be instantly shown - @lajbel

### Changed

- Now, you can use `color(c)` with a hexadecimal literal number (ex: 0x00ff00) -
  @lajbel
  ```js
  // blue frog
  add([sprite("bean"), color(0x0000ff)]);
  ```
- **(!)** `KAPLAYCtx` doesn't use generics anymore. Now, `KAPLAYCtxT` uses
  them - @lajbel
- Now, `kaplay` will return `KAPLAYCtx` or `KAPLAYCtxT` depending if it's using
  Advanced TypeScript Features or not - @lajbel
- `loadShader()` now also checks for link errors as well as compile errors and
  reports them rather than just silently trying to use a borked shader -
  @dragoncoder047
- The debug `record()` function now records with sound enabled like it should -
  @dragoncoder047
- Now `KAPLAYOpt.spriteAtlasPadding` is set to `2` by default - @lajbel
- Transformation and drawing is split now, so the transform can be modified
  before drawing - @mflerackers

## [4000.0.0-alpha.21] - 2025-08-07

### Added

- Added `GameObjRaw.serialize()` for serializing the game object and its
  components. - @mflerackers, @lajbel

  ```js
  const bean = add([sprite("prefab")]);
  const beanSerialized = bean.serialize();
  ```

- Added `createPrefab()` for serializing an object and register it (or not) as a
  prefab from a Game Object. - @mflerackers, @lajbel

  ```js
  const beanObj = add([sprite("bean")]);

  // Serialize game object and register it as a prefab asset
  createPrefab("bean", beanObj);

  addPrefab("bean");

  // Just get serialized data
  const serializedBean = createPrefab(beanObj);

  addPrefab(beanObj);
  ```

- Added `addPrefab()` for creating an object previously serialized -
  @mflerackers, @lajbel

  ```js
  loadPrefab("bean", "/bean.kaprefab");

  addPrefab("bean");
  ```

- Added new scene methods `pushScene()` and `popScene()`, for stack behaviour in
  scenes - @itzKiwiSky
- Added `throwError()` for throwing custom errors to the blue screen, even
  errors KAPLAY can't handle. - @lajbel
- Added `insertionSort()` - @dragoncoder047
- Added a mapping for PS5 (DualSense) gamepads, so now you can bind actions to
  the touchpad press (only works in Chrome for some reason) - @dragoncoder047

### Changed

- Now `GameObjRaw.exists()` work for nested objects
- Now moving mouse changes the value of `getLastInputDevice()` - @amyspark-ng
- (**!**) Renamed `KAPLAYOpt.tagsAsComponents` to `KAPLAYOpt.tagComponentIds` -
  @lajbel

### Fixed

- Fixed shader error messages - @dragoncoder047
- Fixed compatibility issues when calculating font height with missing
  TextMetrics props - @imaginarny

## [4000.0.0-alpha.20] - 2025-06-15

### Added

- Added `loadSpriteFromFont()` for loading a bitmap font from a loaded sprite. -
  @dragoncoder047

### Changed

- Improved various doc entries. - Many contributors

### Fixed

- Fixed `AreaComp#onClick()` attaching events to app, instead of object, so
  event wasn't being paused with `obj.paused` - @lajbel
- Fixed all touch events having a bad transformation - @lajbel
- Fixed sprite scaling not working properly with `KAPLAYOpt.letterbox` -
  @mflerackers
- Fixed "add" event running twice in `addLevel()` tiles - @lajbel
- Fixed blend component having a wrong ID - @lajbel

### Removed

- **(!)** `loadPedit()` was removed - @lajbel

## [4000.0.0-alpha.19] - 2025-05-16

> This version changelog covers versions 4000.0.0-alpha.0 through
> 4000.0.0-alpha.19, as we didn't have a concise changelog strategy before.

### Added

- Added `fakeMouse()` to create a fake mouse cursor - @lajbel

  ```js
  const myCursor = add([fakeMouse(), sprite("kat"), pos(100, 100)]);

  myCursor.press(); // trigger onClick events if the mouse is over
  myCursor.release();
  myCursor.moveBy(vec2(100, 200)); // move as your wish
  ```

- Added `system()` to replace internal events or create new - @mflerackers

  ```js
  system("collision", () => {
    // system code
  }, [SystemPhase.AfterFixedUpdate, SystemPhase.AfterUpdate]),
  ```

- Added `ellipse()` component - @mflerackers
- Added circle and (rotated) ellipse collision shapes - @mflerackers
- Added `clipLineToRect()` - @mflerackers
- Added `obj.setParent()` to change the parent of a game object - @mflerackers
- Added restitution and friction to physics - @mflerackers
- All game objects have methods `onTag()` and `onUntag()` for watching tag
  changes - @mflerackers
- Added `SystemPhase` enum to identify different lifecycle events in the game
  loop that systems can hook into - @mflerackers
- Added Blend mode is selectable to change how sprites are composited on top of
  each other - @mflerackers
- Added Picture API to cache drawing of selected objects - @mflerackers
- Added `drawCanvas()` - @mflerackers
- Added `video()` component to embed a video file into the game - @mflerackers
- Added `level()` component and parent argument to `addLevel()` - @KeSuave
- Allow the `text()` component to change the font and apply shaders
  per-character - @dragoncoder047
- Allow characters in text to be scaled and have the text flow around it with
  `stretchInPlace: false` - @dragoncoder047
- Expose the formatted text parsing functions to allow manipulation of formatted
  text - @dragoncoder047
- Now you can use the frames of a sprite in an atlas also as a font -
  @dragoncoder047
- More errors raised during object creation are caught and cause the blue crash
  screen - @lajbel
- The blue crash screen will no longer fail to draw if the error message
  contains brackets - @dragoncoder047
- Now you can use the global option `inspectOnlyActive: false` to prevent paused
  objects from showing in the debug inspect view, this is useful if you are
  swapping out objects for different views - @dragoncoder047
- The `OffScreenComp` now has an option `offscreenDistance` to change the
  distance at which an object is considered off-screen - @dragoncoder047
- Now you can cherry-pick specific frames of a sprite sheet by using the
  `frames` list, instead of being limited to consecutive frames `start` and
  `end` - @dragoncoder047
- `wave()` can now go back and forth between any value that is able to be used
  with `lerp()` - @dragoncoder047, @mflerackers
- The `TextInputComp` has more events: `focus`, `blur`, `input`, and `change`,
  to better interact with the text input state - @dragoncoder047
- Areas no longer struggle with parents whose transform inst't up-to-date -
  @mflerackers
- Exported step and smoothstep - @mflerackers
- Small circles and arcs use now less points than larger ones - @mflerackers
- Added pushMatrix, storeMatrix and loadIdentity to the stack functions -
  @mflerackers
- Typed `StateComp` - @amyspark-ng
- Added bias to line drawing, which controls the offset from the center of the
  line - @mflerackers
- Added `SpriteAnimPlayOpt.preventRestart` to allow `SpriteComp.play()` to be
  called from an `onUpdate()` and not reset the animation to frame 0 -
  @dragoncoder047

### Changed

- **(!)** - Now `z()` is global instead of relative - @mflerackers
- **(!)** Layers now work globally, no longer only between siblings -
  @mflerackers
- **(!)**: Changed default behavior to `kaplay({ tagsAsComponents: false })`
- The physics engine creates less garbage - @mflerackers
- Tag-based events are slightly faster - @dragoncoder047
- Moved camera to the shader - @mflerackers
- Replaced the Separating Axis Theorem (SAT) collision detection module with the
  [Gilbert–Johnson–Keerthi
  (`GJK`) algorithm](https://en.wikipedia.org/wiki/Gilbert–Johnson–Keerthi_distance_algorithm),
  which is faster - @mflerackers
- Now if you pass a nullish value to `.use()` it throws an error
- Improved TypeScript in game objects - @amyspark-ng, @lajbel, @KeSuave
  - Added/updated JSDoc comments to some members - @ErikGXDev, @dragoncoder047
- The `textInput` component's `isFocused` property is now a one-hot lockout,
  setting it to true (focused) will clear focus from all the other text inputs -
  @dragoncoder047
- Changed the API of `HealthComp` - @amyspark-ng
- CapsLock now affects `TextInputComp` - @amyspark-ng

### Fixed

- `GameObjRaw.exists()` now correctly returns false if the parent was destroyed
  but obj wasn't - @dragoncoder047
- `Vec2.dot()` now actually does the Correct Calculation&trade; - @andrenanninga
- Fixed `debug.timeScale` not affecting `dt()` scale - @lajbel
- Fixed `wait()`'s `TimerComp.onEnd()` being waiting for twice the duration -
  @dragoncoder047
- Fixed non-focused `TextInputComp` backspace - @KeSuave
- Fixed 9slice sprites behaving wrong when using `Anchor` - @mflerackers
- Fixed rendering glitches with outlines on circles - @mflerackers
- Fixed `setCursorLocked(true)` throwing error if the browser is using the old
  non-Promise-based API return value - @imaginarny
- Fixed `PatrolComp` not going to last waypoint - @nojaf
- Fixed various TypeScript types - @amyspark-ng, @lajbel, @KeSuave

### Removed

- **(!)** `make()` was sent to doom - @lajbel

---

# Changelog for v3001

## [unreleased]

### Fixed

- Fixed compatibility issues when calculating font height with missing
  TextMetrics props - @imaginarny

## [3001.0.19] - 2025-06-15

- Fixed `AreaComp#onClick()` attaching events to app, instead of object, so
  event wasn't being paused with `obj.paused` - @lajbel
- Fixed all touch events having a bad transform - @lajbel

## [3001.0.18] - 2025-05-16

### Fixed

- Removed beant - @lajbel
- Fixed TexPacker loading big images - @lajbel, @mflerackers
- Various fixes and improvements - All Contributors

## [3001.0.17] - 2025-05-08

### Added

- New way to import globals in JS `/dist/types.d.ts`

### Fixed

- Removed beant - @lajbel
- Various fixes and improvements - All Contributors

## [3001.0.16] - 2025-04-18

### Fixed

- Removed beant - @lajbel
- Various fixes and improvements - All contributors

## [3001.0.15] - 2025-04-18

### Fixed

- Various fixes and improvements - All contributors

## [3001.0.14] - 2025-04-18

### Fixed

- Various fixes and improvements - All contributors

## [3001.0.13] - 2025-04-18

### Fixed

- Various fixes and improvements - All contributors

## [3001.0.12] - 2025-04-12

### Fixed

- Blockers - @lajbel

## [3001.0.11] - 2025-04-12

### Added

- Added **CSS Colors!** 🎨 - @lajbel (based on @dragoncoder047 idea)

  ```js
  color("slateblue");
  color("red");
  color("wheat");
  color("tomato"); // yum!
  ```

- Added `loadHappy()` font to load a default font, happy :D - @lajbel

  ```js
  kaplay({ font: "happy" });
  loadHappy();

  add([text("ohhi")]);
  ```

### Fixed

- Random errors - @lajbel
- General type bugs - @lajbel

## [3001.0.10] - 2025-03-22

### Added

- Added new option in `LoadSpriteOpt` for loading sprites in an individual
  spritesheet - @chqs-git

  ```js
  loadSprite("player", "sprites/player.png", {
      singular: true,
  });
  ```

- Frame option for load animations with singular frames - @dragoncoder047

  ```js
  loadSpriteAtlas("/examples/sprites/dungeon.png", {
      wizard: {
          x: 128,
          y: 140,
          width: 144,
          height: 28,
          sliceX: 9,
          anims: {
              bouncy: {
                  frames: [8, 5, 0, 3, 2, 3, 0, 5],
                  speed: 10,
                  loop: true,
              },
          },
      },
  });

  add([sprite("wizard", { anim: "bouncy" }), pos(100, 100)]);
  ```

### Fixed

- Args were not being passed to global `trigger()` - @lajbel
- AreaComp.onClick now returns the correct type, KEventController, instead of
  void - @lajbel
- Lifespan was using async - @lajbel
- Wrong calculation in Vector.dot() - @andrenanninga
- Fixed pointer lock undefined catch error for non-promise version - @imaginarny

## [3001.0.9] - 2025-01-15

### Added

- **(examples)** Added a new `particle` example! - @lajbel

### Changed

- Improved `lifespan()` explanation - @lajbel
- **(examples)** `particle` example renamed to `lifespan` - @lajbel

### Fixed

- Fixed a bug where `lifespan()` was working incorrectly - @lajbel

## [3001.0.8] - 2025-01-15

### Fixed

- Fixed a bug where alpha channel wasn't correctly setted - @mflerackers

## [3001.0.7] - 2025-01-15

### Added

- Added `kaplay({ sprit`e`AtlasPadding })` for setting the space between the
  sprites in the sprite atlas - @marianyp

```js
kaplay({
    spriteAtlasPadding: 10, // 10 pixels of space between each sprite
});
```

### Changed

- Now you cannot pass parameters that are not a component or string to `.use()`.
  Otherwise it will throw an error - @lajbel

### Fixed

- Fixed a bug where font atlas were working strange - @mflerackers

## [3001.0.6] "Santa Events" - 2024-12-27

### Added

- Added `trigger(event, tag, ...args)` for global triggering events on a
  specific tag - @lajbel

  ```js
  trigger("shoot", "target", 140);

  on("shoot", "target", (obj, score) => {
      obj.destroy();
      debug.log(140); // every bomb was 140 score points!
  });
  ```

- Added `{ override?: true }` in `CharTransform` for overridding text styles -
  @dragoncoder047

  ```js
  add([
      pos(100, 150),
      text("With override: Hello [foo]styled[/foo] text", {
          transform: {
              color: BLACK, // Default text color for every character
          },
          styles: {
              foo: {
                  color: RED, // [foo] will be red
                  override: true, // will override the black def color
              },
          },
      }),
  ]);
  ```

- Added `TextCompOpt.identAll` boolean to indent every new line -
  @dragoncoder047

- Added TypeScript definition for all App Events and missing Game Object
  Events - @lajbel

### Fixed

- Fixed an incorrect mention to the component in `TextInputComp` type -
  @dragoncoder047

## [3001.0.5] - 2024-12-18

### Added

- Added tags and components separation in `KAPLAYOpt.tagsAsComponents`
- Added `GameObjRaw.is()`, `GameObjRaw.tag()` and `GameObjRaw.untag()` to check,
  add and remove tags
- Added `GameObjRaw.has()` to check if a game object has a component tags
- Added events for listen to comps being removed or added `onUse()` and
  `onUnused()`
- Added `cancel()` to cancel the current event

  ```js
  onKeyPress("space", () => {
      // do something
      // cancel the event
      return cancel();
  });
  ```

- Added `getDefaultLayer()` to get the default layer
- Added `getLayers()` to get the layers list
- Added many JSDoc specifiers on many functions (@require, @deprecated, @since,
  @group, etc)

### Changed

- Added `.use()`, `.unuse()` and `.has()` to `GameObjRaw`, to add, remove and
  check components. This only works with `KAPLAYOpt.tagsAsComponents` set to
  `true`

### Deprecated

- Deprecated camera methods `camScale()`, `camPos()` and `camRot()` in favor of
  `setCamScale()`, `getCamScale()`, `setCamPos()`, `getCamPos()`, `setCamRot()`
  and `getCamRot()`
- Deprecated `camTransform()` in favor of `getCamTransform()`
- Deprecated `camFlash()` in favor of `flash()`, for a `shake()`-like name

### Fixed

- Fixed artifacts present in some TrueType fonts
- Fixed `.use()` and `.unuse()` with area components

## [3001.0.0] - 2024-10-31

### Added

- Added `getTreeRoot()` to get the game's root object, which is the parent of
  all other objects

  ```js
  // get the root object
  const root = getTreeRoot();
  root.add(); // same as add()
  root.get(); // same as get()
  ```

- Added Buttons API for using Input bindings, `onButtonPress()`,
  `onButtonRelease()`, `onButtonDown()`, and it's corresponding boolean
  versions, `isButtonPressed()`, `isButtonDown()` and `isButtonReleased()`

  ```js
  kaplay({
      // bind your buttons
      buttons: {
          jump: {
              keyboard: ["space", "up"],
              keyboardCode: "Space", // you can also use key codes
              gamepad: ["south"],
          },
      },
  });

  onButtonPress("jump", () => {
      player.jump();
  });
  ```

- Added `getButton(btn)` and `setButton(btn)` to get and set button bindings

  ```js
  // ["space", "up"]
  debug.log(getButton("jump").keyboard);

  // change the jump button in keyboard to "w"
  setButton("jump", {
      keyboard: ["w"],
      // gamepad binding is not changed
  });
  ```

- Added `getLastInputDeviceType()` to get what was the last pressed device

  ```js
  onButtonPress(() => {
      const lastInputDevice = getLastInputDeviceType(); // keyboard, mouse or gamepad
      // change icons, etc
  });
  ```

- Added `pressButton(btn)` and `releaseButton(btn)` to simulate button press and
  release

  ```js
  pressButton("jump"); // triggers onButtonPress and starts onButtonDown
  releaseButton("jump"); // triggers onButtonRelease and stops onButtonDown
  ```

- Added `GameObjRaw.tags` to get a game object's tags

  ```js
  const obj = add([sprite("bean"), "enemy", "dangerous"]);

  // get the tags
  debug.log(obj.tags); // ["enemy", "dangerous"]
  ```

- Added the `animate()` component to _animate_ the properties of an object using
  keyframes. Check out
  [Animation Example](https://play.kaplayjs.com/?example=animation)

  ```js
  // prop to animate, frames, options
  rotatingBean.animate("angle", [0, 360], {
      duration: 2,
      direction: "forward",
  });
  ```

- Readded `layers()` and the `layer()` component

  Before the `z()` component, there was a `layer()` component that allowed you
  to control the draw order of objects. It was removed in v3000, but now it's
  back from the void.

  ```js
  // define the layers
  layers(
      [
          "bg",
          "game",
          "ui",
          // the default layer
      ],
      "game",
  );

  // use the layer component
  add([sprite("bg"), layer("bg")]);
  ```

- Added `SpriteComp.hasAnim()` to check if an animation exists

  ```js
  const obj = add([sprite("bean", { anim: "walk" })]);

  // check if an animation exists
  debug.log(obj.hasAnim("walk")); // true
  ```

- Added `SpriteComp.getAnim()` for get any animation data

  ```js
  loadSprite("bean", "bean.png", {
      sliceX: 4,
      sliceY: 1,
      anims: {
          walk: {
              from: 0,
              to: 3,
          },
      },
  });

  const obj = add([sprite("bean")]);

  // get the animation data
  debug.log(obj.getAnim("walk")); // { from: 0, to: 3 }
  ```

- Added `SpriteComp.getCurAnim()` to get the current animation data

  ```js
  const obj = add([sprite("bean", { anim: "walk" })]);

  // get the current animation name
  debug.log(obj.getCurAnim().name); // "walk"
  ```

- Added `camFlash()` to flash the screen

  ```js
  camFlash(0.5, 0.5, 0.5, 0.5);
  ```

- Added support for radius in individual corners for `RectComp,radius`

  ```js
  add([
      rect(100, 100, {
          radius: [10, 20, 30, 40],
      }),
  ]);
  ```

- Added `loadMusic()` to load streaming audio (doesn't block in loading screen)

  ```js
  loadMusic("bgm", "bgm.mp3");

  // play the music
  play("bgm");
  ```

- Added `Vec2.fromArray()` to convert an array to a `Vec2`

  ```js
  const point = Vec2.fromArray([100, 200]); // vec2(100, 200);
  ```

- Added `Vec2.toArray()` to convert a `Vec2` to an array

  ```js
  const point = vec2(100, 200);
  const arr = point.toArray(); // [100, 200]
  ```

- Added `chooseMultiple()` to choose a random element from an array

  ```js
  const numbers = [1, 2, 3, 4, 5];
  const random = chooseMultiple(numbers, 3); // [3, 1, 5]
  ```

- Added `shuffle()` to shuffle an array

  ```js
  const numbers = [1, 2, 3, 4, 5];
  shuffle(numbers); // [3, 1, 5, 2, 4]
  ```

- Added `KAPLAYOpt.debugKey` for customizing the key used to toggle debug mode

  ```js
  kaplay({
      debugKey: "l",
  });
  ```

- Added compatibility with custom properties in debug mode

  ```js
  const obj = add([
      sprite("bean"),
      {
          health: 100, // on debug.inspect
          damage: 10, // on debug.inspect
          hp() {
              this.health -= this.damage;
          }, // not on debug.inspect
      },
  ]);

  // see the custom properties in debug mode
  debug.inspect = true;
  ```

- Added effector components: `areaEffector()`, `buoyancyEffector()`,
  `pointEffector()`, `surfaceEffector()`
- Added `constantForce()` component
- Added `pathfinder()` component to calculate a list of waypoints on a graph
- Added `patrol()` component to move along a list of waypoints
- Added `sentry()` component to notify when certain objects are in sight
- Added `NavMesh` class for pathfinding on a mesh
- Added `particles()` component to emit and draw particles
- Added `SpriteComp.animFrame` to get the frame of the current animation (not on
  the spritesheet)
- Added `outline()`, `shader()`, and `area()` properties to `debug.inspect`
- Added `getSceneName()` to get the current scene name
- Added `Color.toArray()` to convert a color to an array
- Added `raycast` and `LevelComp.raycast` method to level
- Added support for textured polygons
- Added support for concave polygon drawing
- Added support for arrays in uniforms
- Added support for texture larger than 2048x2048
- Added support for gravity direction
- Added line join (bevel, miter, round) and line caps (square, round)
- Added quadratic bezier and Catmull-Rom evaluation
- Added evaluation of the first and second derivatives for all splines
- Added higher order easing functions linear, steps and cubic-bezier

### Changed

- Now collision checks are only done if there's area objects
- Now you can use arrays in all input handlers

  ```js
  onKeyPress(["w", "up"], () => {
      player.jump();
  });
  ```

- Now gamepad events return what gamepad triggered the action

  ```js
  onGamepadButtonPress("south", (btn, gp) => {
      console.log(gp.index); // gamepad number on navigator's gamepad list
  });
  ```

- Now `ScaleComp` and `SpriteComp` uses setters/getters for it's state

  ```js
  const obj = add([sprite("bean"), scale(2)]);

  // set it with = syntax
  obj.scale = vec2(3, 4);
  obj.sprite = "bag";
  ```

- Now you can type `get()` with a type parameter and passing component types

  ```ts
  const player = get<BodyComp>("player");
  ```

- Now you can pass an `AudioBuffer` to `loadSound()`
- Now `debug.log()` accepts multiple argument of any type, like `console.log()`
- Now `Key` also accepts a string as an acceptable value
- Now `text()` component doesn't require to pass a string
- Now `camScale()` and `camPos()` accept only 1 number as parameter
- Now `shake()` can be called without args
- Now `loadShader()` and `loadShaderURL()` accepts null for unused parameters
- Now `RectCompOpt` accepts a array of numbers for `radius`

### Deprecated

- Deprecated `kaboom()` in favor of `kaplay()` (you can still use `kaboom*`)
- Deprecated `SpriteComp.curAnim()` in favor of `SpriteComp.getCurAnim().name`
- Deprecated `fadeIn` component in favor of `OpacityComp.fadeIn()`
- Deprecated `Event`, `EventHandler` and `EventController` in favor of `KEvent`,
  `KEventHandler` and `KEventController`

### Removed

- **(!)** Removed compatibility to use two KAPLAY frames in the same page
- **(!)** Many TypeScript definitions were fixed, if you use TypeScript now
  maybe you see new errors that make your code strict
- Fix error screen not showing with not Error object
- Fix error where debug screen was scaling bad the blue rectangles
- Fix error where error screen was not showing when the error was thrown in a
  input event
- Fix error where fonts was cropped in the bottom
- Fix an error where `stay()` object loose their input events on scene change
