# Changelog

<!-- markdownlint-disable no-duplicate-heading -->

All notable changes to this project will be documented in this file.

The format is (mostly) based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!--
Hey, KAPLAY Dev, you must changelog here, in unreleased, so later your
best friend, lajbel, can put the correct version name here
-->

## [unreleased]

### Added

- Added named animations - @mflerackers

  By giving a name to an animation, you can define more than one animation

  ```js
  const anim = obj.animation.get("idle");
  anim.animate("pos", [0, 5, 0], { relative: true });
  ```
- Added `screenshotToBlob()` to get a screenshot as a `Blob` - @dragoncoder047
- Added `getButtons()` to get the input binding buttons definition - @lajbel
- Added `RuleSystem` for enemy AI - @mflerackers
- Added `DecisionTree` for enemy AI - @mflerackers

### Changed

- `loadShader()` now also checks for link errors as well as compile errors and
  reports them rather than just silently trying to use a borked shader -
  @dragoncoder047
- The debug `record()` function now records with sound enabled like it should -
  @dragoncoder047
- Now `KAPLAYOpt.spriteAtlasPadding` is set to `2` by default - @lajbel

## [unreleased] (v3001)

---

## [4000.0.0-alpha.21] - 2025-08-07

### Added

- Added Prefabs - @mflerackers, @lajbel, @amyspark-ng and other contributors.
- Added new scene methods `pushScene()` and `popScene()`, for stack behaviour in
  scenes - @itzKiwiSky
- Added `throwError()` for throwing custom errors to the blue screen, even
  errors KAPLAY can't handle. - @lajbel
- Added `insertionSort()` - @dragoncoder047
- Added a mapping for PS5 (DualSense) gamepads, so now you can bind actions to
  the touchpad press (only works in Chrome for some reason) - @dragoncoder047

### Changed

- Renamed `KAPLAYOpt.tagsAsComponents` to `KAPLAYOpt.tagComponentIds` - @lajbel
- Now moving mouse changes the value of `getLastInputDevice()` - @amyspark-ng
- Now `GameObjRaw.exists()` work for nested objects

### Fixed

- Fixed shader error messages - @dragoncoder047

## [4000.0.0-alpha.20] - 2025-06-15

### Added

- Now you can use the frames of a sprite in an atlas also as a font -
  @dragoncoder047
- Improved various doc entries. - All Contributors.

### Fixed

- Fixed `AreaComp#onClick()` attaching events to app, instead of object, so
  event wasn't being paused with `obj.paused` - @lajbel
- Fixed all touch events having a bad transform - @lajbel
- Fixed sprite scaling not working properly when letterbox - @mflerackers
- Fixed "add" event running twice in `addLevel()` tiles - @lajbel
- Fixed blend component having a wrong ID - @lajbel

### Removed

- `loadPedit` was removed - @lajbel

## [4000.0.0-alpha.0 to 4000.0.0-alpha.19]

### Added

- Added `ellipse()` component - @mflerackers
- Added circle and (rotated) ellipse collision shapes - @mflerackers
- Added `clipLineToRect()` - @mflerackers
- Added `obj.setParent()` to change the parent of a game object - @mflerackers
- Added `fakeMouse()` to create a fake mouse cursor - @lajbel

  ```js
  const myCursor = add([fakeMouse(), sprite("kat"), pos(100, 100)]);

  myCursor.press(); // trigger onClick events if the mouse is over
  myCursor.release();
  myCursor.moveBy(vec2(100, 200)); // move as your wish
  ```

- Added restitution and friction to physics - @mflerackers
- Added `k.system()` to replace internal events or create new - @mflerackers

  ```js
  system("collision", () => {
    // system code
  }, [SystemPhase.AfterFixedUpdate, SystemPhase.AfterUpdate]),
  ```

- All game objects have methods `onTag()` and `onUntag()` for watching tag
  changes - @mflerackers
- Added `SystemPhase` enum to identify different lifecycle events in the game
  loop that systems can hook into - @mflerackers
- Blend mode is selectable to change how sprites are composited on top of each
  other - @mflerackers
- Picture API to cache drawing of selected objects - @mflerackers
- drawCanvas - @mflerackers
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
- The `offscreen()` component now has an option `offscreenDistance` to change
  the distance at which an object is considered off-screen - @dragoncoder047
- Now you can cherry-pick specific frames of a sprite sheet by using the
  `frames` list, instead of being limited to consecutive frames `start` and
  `end` - @dragoncoder047
- `wave()` can now go back and forth between any value that is able to be used
  with `lerp()` - @dragoncoder047, @mflerackers
- The `textInput` component has more events: `focus`, `blur`, `input`, and
  `change`, to better interact with the text input state - @dragoncoder047
- Layers now work globally, no longer only between siblings. @mflerackers
- Areas no longer struggle with parents whose transform inst't up-to-date -
  @mflerackers
- Exported step and smoothstep - @mflerackers
- Small circles and arcs use now less points than larger ones - @mflerackers
- Added pushMatrix, storeMatrix and loadIdentity to the stack functions -
  @mflerackers
- Typed `StateComp` - @amyspark-ng
- Added bias to line drawing, which controls the offset from the center of the
  line - @mflerackers
- Added `sprite.play("anim", {preventRestart: true})` to allow play() to be
  called from update() and not reset the animation to frame 0 - @dragoncoder047
- Added `throwError()` for trowing custom errors in the blue screen, even errors
  KAPLAY can't handle. - @lajbel
- Added Prefabs - @mflerackers, @lajbel, @amyspark-ng and other contributors.

### Fixed

- `obj.exists()` now correctly returns false if the parent was destroyed but obj
  wasn't - @dragoncoder047
- Various typescript type fixes - @amyspark-ng, @lajbel, @KeSuave
- 9slice sprites behave properly when using anchor - @mflerackers
- Rendering glitches with outlines on circles - @mflerackers
- `wait()` now fires the callback and its onEnd events at the same time like was
  intended, instead of onEnd being waiting for twice the duration -
  @dragoncoder047
- `Vec2.dot()` now actually does the Correct Calculation&trade; - @andrenanninga
- `setCursorLocked(true)` doesn't error if the browser is using the old
  non-Promise-based API return value - @imaginarny
- changing `debug.timeScale` now actually makes the game change speed by
  affecting `dt()` - @lajbel
- CapsLock now affects textInput() - @amyspark-ng
- PatrolComp is not going to last waypoint
  ([#734](https://github.com/kaplayjs/kaplay/issues/734)) - @nojaf
- Fixed non-focused textInput component backspace - @KeSuave

### Removed

- `make()` was sent to doom - @lajbel
- `loadPedit` was removed - @lajbel

### Changed

- **BREAKING**: Changed default behavior to
  `kaplay({ tagsAsComponents: false })`.
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

[Read commit history](https://github.com/kaplayjs/kaplay/compare/3001.0.15...3001.0.16)

## [3001.0.15] - 2025-04-18

### Fixed

- Various fixes and improvements - All contributors

[Read commit history](https://github.com/kaplayjs/kaplay/compare/3001.0.14...3001.0.15)

## [3001.0.14] - 2025-04-18

### Fixed

- Various fixes and improvements - All contributors

[Read commit history](https://github.com/kaplayjs/kaplay/compare/3001.0.13...3001.0.14)

## [3001.0.13] - 2025-04-18

### Fixed

- Various fixes and improvements - All contributors

[Read commit history](https://github.com/kaplayjs/kaplay/compare/3001.0.12...3001.0.13)

## [3001.0.12] - 2025-04-12

### Fixed

- Blockers - @lajbel

## [3001.0.11] - 2025-04-12

### Added

- Added **CSS Colors!** 🎨 **(experimental)** - @lajbel (based on
  @dragoncoder047 idea) (**experimental**)

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

- Frame option for load animations with singular frames (**experimental**) -
  @dragoncoder047

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
  specific tag (**experimental**) - @lajbel

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

- Added `{ indentAll?: boolean }` in `TextCompOpt` to indent every new line -
  @dragoncoder047

- Added TypeScript definition for all App Events and missing Game Object
  Events - @lajbel

### Fixed

- Fixed an incorrect mention to the component in `TextInputComp` type -
  @dragoncoder047

## [3001.0.5] - 2024-12-18

### Added

- Added tags and components separation in `KAPLAYOpt.tagsAsComponents`
  (**experimental**)
- Added `.is()`, `.tag()` and `.untag()` to `GameObjRaw`, check, add and remove
  (**experimental**)
- Added `.has()` to `GameObjRaw`, to check if a game object has a component tags
  (**experimental**)
- Added events for listen to comps being removed or added `onUse()` and
  `onUnused()` (**experimental**)
- Added `k.cancel()` to cancel the current event (**experimental**)

- ```js
  onKeyPress("space", () => {
      // do something
      // cancel the event
      return cancel();
  });
  ```

- Added `getDefaultLayer()` to get the default layer (**experimental**)
- Added `getLayers()` to get the layers list (**experimental**)
- Added many JSDoc specifiers on many functions (@require, @deprecated, @since,
  @group, etc)

### Changed

- Added `.use()`, `.unuse()` and `.has()` to `GameObjRaw`, to add, remove and
  check components. This only works with `KAPLAYOpt.tagsAsComponents` set to
  `true` (**experimental**)

### Deprecated

- Deprecated camera methods `camScale()`, `camPos()` and `camRot()` in favor of
  `setCamScale()`, `getCamScale()`, `setCamPos()`, `getCamPos()`, `setCamRot()`
  and `getCamRot`.
- Deprecated `camTransform()` in favor of `getCamTransform()`.
- Deprecated `camFlash()` in favor of `flash()`, for a `shake()`-like name.

### Fixed

- Fixed artifacts present in some TrueType fonts.
- Fixed `.use()` and `.unuse()` with area components.

## [3001.0.0] "Spooky Beans!" - 2024-10-31

### Input

- Added input bindings, `onButtonPress`, `onButtonRelease`, `onButtonDown`, and
  it's corresponding boolean versions, `isButtonPressed`, `isButtonDown` and
  `isButtonReleased`.

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

- added `getButton(btn)` and `setButton(btn)` to get and set button bindings

  ```js
  // ["space", "up"]
  debug.log(getButton("jump").keyboard);

  // change the jump button in keyboard to "w"
  setButton("jump", {
      keyboard: ["w"],
      // gamepad binding is not changed
  });
  ```

- added `getLastInputDeviceType()` to get what was the last pressed device

  ```js
  onButtonPress(() => {
      const lastInputDevice = getLastInputDeviceType(); // keyboard, mouse or gamepad
      // change icons, etc
  });
  ```

- added `pressButton(btn)` and `releaseButton(btn)` to simulate button press and
  release

  ```js
  pressButton("jump"); // triggers onButtonPress and starts onButtonDown
  releaseButton("jump"); // triggers onButtonRelease and stops onButtonDown
  ```

- added the possibility of use arrays in all input handlers

  ```js
  onKeyPress(["w", "up"], () => {
      player.jump();
  });
  ```

- now gamepad events return what gamepad triggered the action

  ```js
  onGamepadButtonPress("south", (btn, gp) => {
      console.log(gp.index); // gamepad number on navigator's gamepad list
  });
  ```

### Physics

- added effector components: `areaEffector()`, `buoyancyEffector()`,
  `pointEffector()`, `surfaceEffector()`.
- added `constantForce()` component.
- added `patrol()` component to move along a list of waypoints.
- added `sentry()` component to notify when certain objects are in sight.
- added `NavMesh` class for pathfinding on a mesh.
- added `pathfinder()` component to calculate a list of waypoints on a graph.
- now collision checks are only done if there's area objects.

### Game Object

- added `getTreeRoot()` to get the game's root object, which is the parent of
  all other objects

  ```js
  // get the root object
  const root = getTreeRoot();
  root.add(); // same as add()
  root.get(); // same as get()
  ```

- added `GameObjRaw.tags` to get a game object's tags.

  ```js
  const obj = add([sprite("bean"), "enemy", "dangerous"]);

  // get the tags
  debug.log(obj.tags); // ["enemy", "dangerous"]
  ```

### Components

- added support to setters/getters syntax in `ScaleComp` and `SpriteComp`
  components

  ```js
  const obj = add([sprite("bean"), scale(2)]);

  // set it with = syntax
  obj.scale = vec2(3, 4);
  obj.sprite = "bag";
  ```

### Rendering and Animation

- added the `animate()` component to _animate_ the properties of an object using
  keyframes. Check out
  [Animation Example](https://play.kaplayjs.com/?example=animation)

  ```js
  // prop to animate, frames, options
  rotatingBean.animate("angle", [0, 360], {
      duration: 2,
      direction: "forward",
  });
  ```

- added `particles()` component to emit and draw particles.

- readded `layers()` and the `layer()` component.

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

- added `SpriteComp.getCurAnim()` to get the current animation data

  ```js
  const obj = add([sprite("bean", { anim: "walk" })]);

  // get the current animation name
  debug.log(obj.getCurAnim().name); // "walk"
  ```

- added `SpriteComp.getAnim()` for get any animation data

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

- added `SpriteComp.hasAnim()` to check if an animation exists

  ```js
  const obj = add([sprite("bean", { anim: "walk" })]);

  // check if an animation exists
  debug.log(obj.hasAnim("walk")); // true
  ```

- added `camFlash()` to flash the screen.

  ```js
  camFlash(0.5, 0.5, 0.5, 0.5);
  ```

- added support for radius in individual corners for `RectComp` component.

  ```js
  add([
      rect(100, 100, {
          radius: [10, 20, 30, 40],
      }),
  ]);
  ```

- (**! break**) removed compatibility to use two KAPLAY frames in the same page,
  due to performance improvements

- fix error screen not showing with not Error object

- Added `SpriteComp.animFrame` to get the frame of the current animation (not on
  the spritesheet)

### Audio

- now you can pass an `AudioBuffer` to `loadSound()`
- added `loadMusic()` to load streaming audio (doesn't block in loading screen).

  ```js
  loadMusic("bgm", "bgm.mp3");

  // play the music
  play("bgm");
  ```

### Math

- added `Vec2.fromArray()` to convert an array to a `Vec2`.

  ```js
  const point = Vec2.fromArray([100, 200]); // vec2(100, 200);
  ```

- added `Vec2.toArray()` to convert a `Vec2` to an array.

  ```js
  const point = vec2(100, 200);
  const arr = point.toArray(); // [100, 200]
  ```

- added `chooseMultiple()` to choose a random element from an array.

  ```js
  const numbers = [1, 2, 3, 4, 5];
  const random = chooseMultiple(numbers, 3); // [3, 1, 5]
  ```

- added `shuffle()` to shuffle an array.

  ```js
  const numbers = [1, 2, 3, 4, 5];
  shuffle(numbers); // [3, 1, 5, 2, 4]
  ```

### Debug mode

- added `outline()`, `shader()`, and `area()` properties to `debug.inspect`.
- added `KAPLAYOpt.debugKey` for customizing the key used to toggle debug mode.

  ```js
  kaplay({
      debugKey: "l",
  });
  ```

- added compatibility with custom properties in debug mode

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

- Now `debug.log()` accepts multiple argument of any type, like `console.log()`.

### Helpers

- added `getSceneName()` to get the current scene name
- added `Color.toArray()` to convert a color to an array
- added global raycast function and raycast method to level
- added support for textured polygons
- added support for concave polygon drawing
- added support for arrays in uniforms
- added support for texture larger than 2048x2048
- added support for gravity direction
- added line join (bevel, miter, round) and line caps (square, round)
- added quadratic bezier and Catmull-Rom evaluation
- added evaluation of the first and second derivatives for all splines
- added higher order easing functions linear, steps and cubic-bezier

### TypeScript

- Now you can type `get()` with a type parameter and passing component types.
  (**v4000**)

  ```ts
  const player = get<BodyComp>("player");
  ```

- Now `Key` also accepts a string as an acceptable value.
- Now `text()` component doesn't require to pass a string.
- Now `camScale()` and `camPos()` accept only 1 number as parameter.
- Now `shake()` can be called without args.
- Now `loadShader()` and `loadShaderURL()` accepts null for unused parameters.
- Now `RectCompOpt` accepts a array of numbers for `radius`.

### Deprecations

> All changes applies for both v3001 and v4000

- deprecated `kaboom()` in favor of `kaplay()` (you can still use `kaboom*`)
- deprecated `SpriteComp.curAnim()` in favor of `SpriteComp.getCurAnim().name`
- deprecated `fadeIn` component in favor of `OpacityComp.fadeIn()`
- deprecated `Event`, `EventHandler` and `EventController` in favor of `KEvent`,
  `KEventHandler` and `KEventController`

### Bug fixes

> All changes applies for both v3001 and v4000

- **(break)** much typescript definitions was fixed, if you use typescript now
  maybe you see new errors that make your code strict
- fix error screen not showing with not Error object
- fix error where debug screen was scaling bad the blue rectangles
- fix error where error screen was not showing when the error was thrown in a
  input event
- fix error where fonts was cropped in the bottom
- fix an error where `stay()` object loose their input events on scene change
