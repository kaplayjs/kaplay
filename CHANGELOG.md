# Changelog

<!-- markdownlint-disable no-duplicate-heading -->

All notable changes to this project will be documented in this file.

The format is (mostly) based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4000.0.0] - TBD

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
- Now there is a global option `sapDirection` so you can change the direction of
  the physics engine's sweep-and-pruner, to optimize for the shape of your game
  (mostly horizontal or mostly vertical) - @dragoncoder047, @mflerackers
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

## [4000.0.0-alpha.21] - TBD

### Added

- Added `throwError()` for throwing custom errors to the blue screen, even
  errors KAPLAY can't handle. - @lajbel
- Added Prefabs - @mflerackers, @lajbel, @amyspark-ng and other contributors.

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

### v3000.1.17

- exposed `vel` property on `BodyComp`

### v3000.1.16

- fixed error not being logged
- fixed error screen scaling error in letterbox mode

### v3000.1.15

- fixed `loadRoot()` not working sometimes
- fixed audio being resumed when the tab is switched on but `debug.paused` is
  true

### v3000.1.12

- fixed `color()` and `rgb()` not working

### v3000.1.11

- added option `kaboom({ focus: false })` to disable focus on start
- fixed `rand()` typing for numbers
- fixed mouse position in fullscreen
- added `Color#toHSL()`

### v3000.1.10

- fixed test code accidentally getting shipped (where a screenshot will be
  downloaded every time you press space)

### v3000.1.9

- added `fill` option to `rect()`, `circle()` and `sprite()`
- fixed view getting cut off in letterbox mode

### v3000.1.8

- fixed `scale` option acting weird when width and height are defined (by
  @hirnsalat)

### v3000.1.7

- fixed `debug.paused` not pausing audio
- added `mask()` component
- added support for colored font outline

```js
loadFont("apl386", "/examples/fonts/apl386.ttf", {
    outline: {
        width: 8,
        color: rgb(0, 0, 255),
    },
});
```

- fixed `wave()` not starting at `0` when time is `0`
- kaboom now only displays error screen for kaboom's own error, instead of
  catching all errors in current window
- added `KaboomError` class for errors related to current kaboom instance
- setting `obj.text` with `text()` component now immediately updates `width` and
  `height` property

```js
const obj = add([text("oh hi"), pos(100, 200)]);

// before
obj.text = "bye";
console.log(obj.width); // still the width of "oh hi" until next render

// before
obj.text = "bye";
console.log(obj.width); // will be updated to the width of "bye"
```

### v3000.1.6

- fixed `loadSound` typing to accept `ArrayBuffer`

### v3000.1.5

- added `Event#clear()` method
- fixed `add()` without argument

### v3000.1.4

- added `audio.stop()` method

```js
const music = play("music");
music.stop();
```

### v3000.1.3

- fixed `onCollideUpdate()` still runs when object is paused
- allow `add()` and `make()` without arguments
- added `debug.numObjects()`
- added `width` and `height` properties to `SpriteData`

```js
// get sprite size
getSprite("bean").then((spr) => {
    console.log(spr.width, spr.height);
});
```

### v3000.1.2

- fixed audio not pausing when tab hidden and `backgroundAudio` not set
- fixed `debug.timeScale` not working
- fixed `debug.paused` not able to resume
- fixed `quad` option not working in `sprite()` component
- added `onHide()` and `onShow()` for tab visibility event

### v3000.1.1

- fixed some indirect `fixed` related issues

## [3000.1.0] - 2023-08-18 (kaboom.js)

- added game object level input handling

```js
// add a scene game object
const scene = add([]);

const bean = scene.add([sprite("bean"), pos(100, 200), area(), body()]);

scene.onKeyPress("space", () => {
    bean.jump();
});

scene.onMousePress(() => {
    bean.jump();
});

// setting scene.paused will pause all the input events
scene.paused = true;

// destroying scene will cancel all its input events
scene.destroy();

const ui = add([]);

ui.add(makeButton());

// these will only work if ui game object is active
ui.onMousePress(() => {
    // ...
});

// before you'll have to manually clean up events on obj.onDestroy()
const scene = add([]);
const evs = [];
scene.onDestroy(() => {
    evs.forEach((ev) => ev.cancel());
});
evs.push(
    k.onKeyPress("space", () => {
        doSomeSceneSpecificStuff();
    }),
);
```

- added `make()` to create game object without adding to the scene

```js
const obj = make([sprite("bean"), pos(120, 60)]);

add(obj);
```

- fixed children not inheriting `fixed()` from parent

```js
// before
const ui = add([fixed()]);

ui.add([
    rect(),
    // have to also give all children game objects fixed()
    fixed(),
]);

// now
const ui = add([fixed()]);

// you don't have to add fixed() to children
ui.add([rect(100, 100)]);
```

- fixed `AreaComp#onClick()` event not getting cleaned up when game object is
  destroyed
- fixed typo `isTouchScreen()` -> `isTouchscreen()`
- fixed inspect mode doesn't show the properties box of indirect children game
  objects
- fixed some problem causing kaboom to not work with vite
- fixed "destroy" event not run on children game objects
- calling `shake()` when another shake is happening adds to the shake instead of
  reset it?
- fixed incorrect touch position when canvas is not at top left of page

## [3000.0.0] - 2023-05-25 (kaboom.js)

### Game Objects

- added scene graph, game objects are now stored in a tree-like structure and
  can have children with `obj.add()`

```js
const bean = add([sprite("bean"), pos(160, 120)]);

const sword = bean.add([
    sprite("sword"),
    // transforms will be relative to parent bean object
    pos(20, 20),
    rotate(20),
]);

const hat = bean.add([
    sprite("hat"),
    // transforms will be relative to parent bean object
    pos(0, -10),
]);

// children will be moved alongside the parent
bean.moveBy(100, 200);

// children will be destroyed alongside the parent
bean.destroy();
```

- added `recursive` and `liveUpdate` options to `get()`

```js
const enemies = get("enemy", {
    // get from all children and descendants, instead of only direct children
    recursive: true,
    // live update the returned list to listen to onAdd and onDestroy events
    liveUpdate: true,
});

console.log(enemies.length); // 3

add([sprite("bigbird"), "enemy"]);

console.log(enemies.length); // 4
```

- changed object update order from reversed to not reversed
- (**BREAK**) removed `GameObj#every()` and `GameObj#revery()` in favor of
  `obj.get("*").forEach()`
- (**BREAK**) renamed `GameObj#_id` to `GameObj#id`
- `addLevel()` now returns a `GameObj` which has all individual grid objects as
  its children game objects, with `LevelComp` containing its previous methods
- added `onAdd()` and `onDestroy()` events to listen to added / destroyed game
  objects

### Components

- added support for getter and setters in component properties

#### Area

- added collision support for rotate shapes and polygons
- added option `collisionIgnore` to `area()` component, which accepts a list of
  tags to ignore when checking collision

```js
const bean = add([
    sprite("bean"),
    pos(100, 80),
    area({
        collisionIgnore: ["cloud", "particle"],
    }),
]);
```

- added `Area#getCollisions` to get a list of all current collisions happening

```js
for (const col of player.getCollisions()) {
    const c = col.target;
    if (c.is("chest")) {
        c.open();
    }
}
```

- added `Area#onCollideUpdate()` and `onCollideUpdate()` to register an event
  that runs every frame when 2 objects are colliding
- added `Area#onCollideEnd()` and `onCollideEnd()` to register an event that
  runs once when 2 objects stop colliding
- added `Area#onHover()` and `onHover()` to register an event that runs once
  when an object(s) is hovered over
- added `Area#onHoverEnd()` and `onHoverEnd()` to register an event that runs
  once when an object(s) stops being hovered over
- (**BREAK**) renamed `onHover()` to `onHoverUpdate()` (it registers an event
  that runs every frame when an object is hovered over)
- (**BREAK**) renamed `pushOut()` to `resolveCollision()`

#### Body

- added `Body#onFall()` which fires when object starts falling
- added `Body#onPhysicsResolve()` and `Body#onBeforePhysicsResolve()` to
  register events relating to collision resolution

```js
// make semi-solid platforms that doesn't block player when player is jumping over it
player.onBeforePhysicsResolve((collision) => {
    if (collision.target.is(["platform", "soft"]) && player.isJumping()) {
        collision.preventResolution();
    }
});
```

- (**BREAK**) removed `solid()` in favor of `body({ isStatic: true })`
- added option `body({ mass: 3 })` to define how hard a non-static body is to be
  pushed by another non-static body
- added option `body({ stickToPlatform: false })` to turn off object moving with
  platform
- (**BREAK**) removed `Body#doubleJump()` in favor of `doubleJump()` component
- (**BREAK**) renamed `Body#weight` to `Body#gravityScale`
- (**BREAK**) renamed `Body#onFall()` to `Body#onFallOff()` which triggers when
  object fall off a platform
- (**BREAK**) defining `setGravity()` is now required for enabling gravity,
  `body()` by default will only prevent objects from going through each other

#### Others

- (**BREAK**) renamed `origin()` to `anchor()`, so it won't mess up typescript
  in global mode
- (**BREAK**) `anchor` (previously `origin`) no longer controls text alignment,
  use `text({ align: "left" })` option instead
- added `doubleJump()` component to enable double jump (or any number of jumps)
- (**BREAK**) renamed `outview()` to `offscreen()`, and uses a much faster check
  (but less accurate) for if object is offscreen
  - removed `offset` option in favor of a simpler `distance` option
  - renamed `onExitView()` and `onEnterView()` to `onExitScreen()` and
    `onEnterScreen()`
- (**BREAK**) removed `cleanup()` component in favor of
  `offscreen({ destroy: true })`
- added `OpacityComp#fadeOut()`
- added `fadeIn()` component
- `stay()` now accepts a list of scenes to stay for, like
  `stay(["gameover", "menu"])`
- (**BREAK**) changed `SpriteComp#flipX` and `SpriteComp#flipY` to properties
  instead of functions
- (**BREAK**) `sprite.onAnimStart()` and `sprite.onAnimEnd()` now triggers on
  any animation

```js
// before
obj.onAnimEnd("walk", () => {
    // do something
});

// v3000
obj.onAnimEnd((anim) => {
    if (anim === "walk") {
        // do something
    }
});
```

- (**BREAK**) `ScaleComp#scale` will always be a `Vec2` not `number`
- `shader()` comp `uniform` parameter now supports a callback that returns the
  uniform every frame

```js
const player = add([
    sprite("bean"),
    // will calculate and send u_time every frame
    shader("flashy", () => ({
        u_time: time(),
    })),
]);
```

### Assets

- added `loadProgress()` that returns a `0.0 - 1.0` that indicates current asset
  loading progress
- added option `loadingScreen` to `kaboom()` where you can turn off the default
  loading screen
- added `onLoadUpdate()` to register a custom loading screen (see "loader"
  example)

```js
// custom loading screen
onLoadUpdate((progress) => {
    drawCircle({
        pos: center(),
        radius: 32,
        end: map(progress, 0, 1, 0, 360),
    });
});
```

- added support for multiple sprite sources as frames in `loadSprite()`

```js
loadSprite("player", [
    "sprites/player_idle.png",
    "sprites/player_run.png",
    "sprites/player_jump.png",
]);
```

- (**BREAK**) added `loadShaderURL()`, `loadShader()` now only load shader code
  not files

### Text

- added `loadFont()` to load `.ttf`, `.otf`, `.woff2` or any font supported by
  browser `FontFace`

```js
// Load a custom font from a .ttf file
loadFont("FlowerSketches", "/examples/fonts/FlowerSketches.ttf");

// Load a custom font with options
loadFont("apl386", "/examples/fonts/apl386.ttf", {
    outline: 4,
    filter: "linear",
});
```

- (**BREAK**) renamed previous `loadFont()` to `loadBitmapFont()`
- (**BREAK**) removed built-in `apl386`, `apl386o`, `sink`, `sinko` (still
  available under `examples/fonts`)
- changed default font size to `36`
- (**BREAK**) changed to bbcode syntax for styled text

```js
// before
"[oh hi].green here's some [styled].wavy text";
// v3000
"[green]oh hi[/green] here's some [wavy]styled[/wavy] text";
```

### Graphics

- fixed visual artifacts on text rendering
- added `colors` option to `drawPolygon()` that controls the color of each
  corner
- added `gradient` option to `drawRect()` that specifies the start and end color
- added `drawMasked()` and `drawSubtracted()`
- added `pushRotateX()`, `pushRotateY()` and `pushRotateZ()`
- added `pixelDensity` option to `kaboom()`
- (**BREAK**) changed position vertex format from `vec3` to `vec2` (which is
  passed in as the first argument of custom `frag` and `vert` shader functions)
- added `usePostEffect()` to add post process shader

```js
loadShader(
    "invert",
    null,
    `
vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();
    return vec4(1.0 - c.r, 1.0 - c.g, 1.0 - c.b, c.a);
}
`,
);

usePostEffect("invert");
```

- shader error logs now yields the correct line number
- added `slice9` option to `loadSprite()` to enable
  [9 slice scaling](https://en.wikipedia.org/wiki/9-slice_scaling)

```js
loadSprite("grass", "/sprites/grass.png", {
    slice9: {
        left: 8,
        right: 8,
        top: 8,
        bottom: 8,
    },
});

const g = add([sprite("grass")]);

onMouseMove(() => {
    const mpos = mousePos();
    // updating width / height will scale the image but not the sliced frame
    g.width = mpos.x;
    g.height = mpos.y;
});
```

### Audio

- added option `kaboom({ backgroundAudio: false })` to not pause audio when tab
  not active
- changed `speed`, `detune`, `volume`, `loop` in `AudioPlay` from functions to
  properties
- added `onEnd()` event for `const pb = play("sound")`

```js
// before
const music = play("song");
music.speed(2);
music.volume(0.5);
music.loop(true);

// v3000
const music = play("song");
music.speed = 2;
music.volume = 0.5;
music.loop = true;
```

### Input

- added `onScroll(action: (delta: Vec2) => void)` to listen mouse wheel scroll
- fixed touches not treated as mouse
- (**BREAK**) changed `onTouchStart()`, `onTouchMove()` and `onTouchEnd()`
  callback signature to `(pos: Vec2, touch: Touch) => void` (exposes the native
  `Touch` object)
- added `onGamepadButtonPress()`, `onGamepadButtonDown()`,
  `onGamepadButtonRelease()`
- added `isGamepadButtonPressed()`, `isGamepadButtonDown()`,
  `isGamepadButtonReleased()`
- added `onGamepadStick()` to handle gamepad axes info for left and right sticks
- added `getConnectedGamepads()`
- added `onGamepadConnect()` and `onGamepadDisconnect()`
- added `gamepads` option to `kaboom()` to define custom gamepads

### Level

- (**BREAK**) changed `addLevel()` options API
  - renamed `width` and `height` to `tileWidth` and `tileHeight`
  - renamed `any` to `wildcardTile`
  - now all tile symbols are defined in the `tiles` object

```js
// before
addLevel(["@  ^ $$", "======="], {
    width: 32,
    height: 32,
    "=": () => [sprite("grass"), area(), body({ isStatic: true })],
    $: () => [sprite("coin"), area(), "coin"],
    any: (symbol) => {
        if (symbol === "@") {
            return [
                /* ... */
            ];
        }
    },
});

// v3000
addLevel(["@  ^ $$", "======="], {
    tileWidth: 32,
    tileHeight: 32,
    tiles: {
        "=": () => [sprite("grass"), area(), body({ isStatic: true })],
        $: () => [sprite("coin"), area(), "coin"],
    },
    wildcardTile: (symbol) => {
        if (symbol === "@") {
            return [
                /* ... */
            ];
        }
    },
});
```

### Misc

- sprites are now automatically packed, improving performance
- (**BREAK**) renamed `gravity()` into `getGravity()` and `setGravity()`
- (**BREAK**) removed all deprecated functions in v2000.2
- (**BREAK**) raised esbuild target to `esnext`
- added `setBackground()` and `getBackground()` in addition to `background`
  option in `kaboom()`
- moved type defs for global functions to `import "kaboom/global"`

```js
// if use global functions
import "kaboom";
import "kaboom/global"; // required to load global types

kaboom();

// will have definition
add();
```

```js
// if don't use global function
import "kaboom";

kaboom({ global: false });

// type error, won't pollute global namespace if not manually import "kaboom/global"
add();
```

- added `tween()` for tweening, and a set of built-in easing functions in
  `easings`

```js
onMousePress(() => {
    tween(
        bean.pos.x,
        mousePos().x,
        1,
        (val) => (bean.pos.x = val),
        easings.easeOutBounce,
    );
    tween(
        bean.pos.y,
        mousePos().y,
        1,
        (val) => (bean.pos.y = val),
        easings.easeOutBounce,
    );
});
```

- (**BREAK**) changed all event handlers to return a `EventController` object
  instead of a function to cancel event

```js
// before
const cancel = onUpdate(() => {
    /* ... */
});
cancel();

// v3000
const ev = onUpdate(() => {
    /* ... */
});
ev.paused = true;
ev.cancel();
```

- timers can now be paused

```js
const timer = wait(4, () => {
    /* ... */
});
timer.paused = true;
timer.resume();

const timer = loop(1, () => {
    /* ... */
});
timer.paused = true;
timer.resume();
```

- `kaboom()` now automatically focuses the canvas
- added `quit()` to end everything
- added `download()`, `downloadText()`, `downloadJSON()`, `downloadBlob()`
- added `Recording#stop()` to stop the recording and returns the video data as
  mp4 Blob
- added `debug.numFrames()` to get the total number of frames elapsed
- added `onError()` to handle error or even custom error screen
- added `onResize()` to register an event that runs when canvas resizes
- added `setCursorLocked()` and `isCursorLocked()`
- (**BREAK**) renamed `cursor()` to `setCursor()`
- (**BREAK**) renamed `fullscreen()` to `setFullscreen()`
- (**BREAK**) renamed `isTouch()` to `isTouchscreen()`
- (**BREAK**) removed `layers()` in favor of parent game objects (see "layers"
  example)
- (**BREAK**) removed `load()` event for components, use `onLoad()` in `add()`
  event
- (**BREAK**) removed `debug.objCount()` in favor of `getAll().length`
- added `debug.numFrames()` to get the current frame count

## [2000.2.6] - 2022-01-27 (kaboom.js)

- fixed text always being wrapped if updated
- fixed text comp properties `letterSpacing`, `charSpacing`, `transform`,
  `styles` not being exposed

### v2000.2.5

- fixed updating `font` property on gameobj not updating the text font

### v2000.2.4

- fixed `focus()` not properly exported
- deprecated `focus()` in favor of `canvas.focus()` due to name collision

### v2000.2.3

- fixed `kaboom.d.ts` completely messed up

### v2000.2.2

- fixed doc for `TextCompOpt#styles` and `DrawTextOpt#styles`

### v2000.2.1

- fixed updates not running at all when `kaboom({ debug: false })`

## [2000.2.0] "Fancy Text Mode" 2022-01-23 (kaboom.js)

- added `formatText()` and `drawFormattedText()`
- added `charSpacing` and `lineSpacing` in `TextCompOpt` and `DrawTextOpt`
- added optional `transitions` argument in `state()` to define allowed
  transitions
- added `StateComp#onStateTransition` to register event for specific transitions
- added syntax to style a piece of text `"this is a [styled].wavy text"` and
  `style` option in `TextCompOpt` and `DrawTextOpt` to define the styles with
  `CharTransformFunc`
- deprecated `dir()` in favor of `Vec2.fromAngle()`
- fixed `onTouchEnd()` fired on `touchmove`
- added `outview()` component to control behavior when object leaves visible
  area
- deprecated `cleanup(delay?: number)` in favor of `cleanup(opt?: CleanupOpt)`
- deprecated `mouseWorldPos()` in favor of `toWorld(mousePos())`
- deprecated `rng()` in favor of `new RNG()`
- added classes `Vec2`, `Color`, `Mat4`, `Timer`, `Quad`, `RNG`, `Line`, `Rect`,
  `Circle`
- added deprecation warning
- fixed letterbox view mode
- allow non-stretch letterbox
- fixed mouse position malfunction in fullscreen, stretch and letterbox mode

### [2000.1.8]

- fixed `Color#eq()` not giving correct result

### v2000.1.7

- fixed not having export if installed from github repo with npm
- fixed event canceller returned by raw `onUpdate()` and `onDraw()` crashing

### v2000.1.6

- fixed debug widget scale

### v2000.1.5

- fixed `enterState()` not passing args to `onStateEnter()` callback

### v2000.1.4

- fixed `state()` to not require registering `onStateUpdate()` before using any
  state

### v2000.1.2

- fixed `onKeyRelease()` wrongfully check for key press instead of release

### v2000.1.1

- fixed `StateComp#enterState()` not accepting any state

## [2000.1.0] "Record Mode" - 2021-11-04 (kaboom.js)

- added `hsl2rgb()` for converting HSL color to kaboom RGB
- added `record()` to start a screen recording
- added F5 to screenshot and F6 to toggle record mode in debug mode
- added `DrawTextOpt#transform()` and `TextCompOpt#transform()` for defining
  style and transformation for each character
- added `state()` component for finite state machine
- added support for multiple tags in `get()` and `every()`
- added UI indicator for `debug.paused` and `debug.timeScale`
- changed inspect mode UI style
- added color constants `WHITE`, `BLACK`, `BLUE`, `GREEN`, `RED`, `MAGENTA`,
  `CYAN`, `YELLOW`
- added new API style (`on` prefix for all event handler function, `is` prefix
  for all boolean state getters)
  - `onLoad()`
  - `onUpdate()`
  - `onDraw()`
  - `onKeyPress()`
  - `onKeyPressRepeat()`
  - `onKeyDown()`
  - `onKeyRelease()`
  - `onMousePress()`
  - `onMouseDown()`
  - `onMouseRelease()`
  - `onMoueMove()`
  - `onTouchStart()`
  - `onTouchMove()`
  - `onTouchEnd()`
  - `onCollide()`
  - `onClick()`
  - `onHover()`
  - `isFocused()`
  - `isKeyDown()`
  - `isKeyPressed()`
  - `isKeyPressedRepeat()`
  - `isKeyDown()`
  - `isMouseDown()`
  - `isMousePressed()`
  - `isMouseReleased()`
  - `isMouseMoved()`
  - `isMouseMoved()`
  - `GameObj#onUpdate()`
  - `GameObj#onDraw()`
  - `AreaComp#onCollide()`
  - `AreaComp#onHover()`
  - `AreaComp#onClick()`
  - `BodyComp#onGround()`
  - `BodyComp#onFall()`
  - `BodyComp#onHeadbutt()`
  - `BodyComp#onDoubleJump()`
  - `BodyComp#isGrounded()`
  - `BodyComp#isFalling()`
  - `SpriteComp#onAnimEnd()`
  - `SpriteComp#onAnimStart()`
  - `HealthComp#onDeath()`
  - `HealthComp#onHurt()`
  - `HealthComp#onHeal()`
  - `AudioPlay#isStopped()`
  - `AudioPlay#isPaused()`

## [2000.0.0] "Burp Mode" - 2021-10-20 (kaboom.js)

- version jumped to v2000.0.0 (still semver, just big)
- added `burp()` for easy burping
- added decent typescript / autocomplete support and jsdocs
- introducing new character "bean" ![bean](assets/sprites/bean.png)
- added `loadBean()` to load `"bean"` as a default sprite
- changed default font to [APL386](https://abrudz.github.io/APL386/), as
  `"apl386o"` (default outlined version) and `"apl386"`
- included font
  [kitchen sink](https://polyducks.itch.io/kitchen-sink-textmode-font) as
  `"sinko"` (outlined version) and `"sink"` (standard version with extended
  characters for text-mode games)
- added `font` field in `KaboomOpt` to set the default font
- added `loadSpriteAtlas(src, entries)` to load sprite atlas
- inspect mode now displays every comp's state
- **BREAK** added continuous collision resolution which checks collision in
  `move()` if 2 objects are both "solid" (objects now won't pass through other
  solid object at high speed or low framerate)

```js
// before
add([sprite("player"), area()]);

add([sprite("rock"), solid()]);

keyDown("left", () => {
    player.move(-120, 0);
});

player.action(() => {
    player.resolve(); // or pushOutAll() in beta versions
});

// after
const player = add([sprite("player"), area(), solid()]);

// both should be solid
add([sprite("rock"), area(), solid()]);

keyDown("left", () => {
    // this will handle collision resolution for you, if the other obj is also "solid"
    player.move(-120, 0);
});
```

- added comp `opacity()` to set opacity
- added comp `health()` to manage health related logic
- added comp `move()` to manage projectile-like behavior
- added comp `cleanup()` to auto destroy obj when it leaves screen
- added comp `outline()` to draw a lil outline
- added comp `timer()` to attach timers to a game obj
- added comp `fixed()` to make a game obj unaffected by camera
- added comp `stay()` to make a game obj stay after scene switch
- added comp `lifespan()` to destroy game obj after certain amount of time
- added comp `z()` to define draw order for objs on the same layer
- added `weight` to `BodyComp` and `BodyCompOpt` to control the gravity
  multiplier
- added `djump()` to `BodyComp` for double jump
- added `dir()` to calculate directional vector from angle
- added constants `LEFT`, `RIGHT`, `UP`, `DOWN` for unit directional vector
- added `fullscreen()` to enable real fullscreen mode
- **BREAK** separated color and opacity, removed `rgba()` in favor of `rgb`, use
  component `opacity()` to define opacity
- **BREAK** changed color from 0-1 range to 0-255, angles from radians to
  degrees

```js
// before
add([rotate(Math.PI / 2), color(0, 0.5, 1.0, 0.5)]);

// after
add([rotate(90), color(0, 127, 255), opacity(0.5)]);
```

- `global` and `debug` flag now are enabled by default, need to turn off
  manually if you don't want
- added input events `touchStart(id, pos)`, `touchMove(id, pos)`,
  `touchEnd(id, pos)`, `mouseMove(pos)`
- added `mouseDeltaPos()`
- added `touchToMouse` to control if touch events should be translated to mouse
  events
- added `mousePos()` now gets the screen mouse pos, use `mouseWorldPos()` to get
  the mouse position affected by camera
- added `anim` field in `SpriteCompOpt` to play an anim on start
- better type support for components
- `scene()` and `start()` (also removed in favor of `go()`) are optional now, if
  you don't need multiple scenes yet you can just go directly

```js
kaboom();
// no mandatory scene() to start kabooming
add(...);
keyPress(...);
```

- **BREAK** `area()` is now explicit and not automatically added by `sprite()`,
  `rect()`, and `text()`, removed each `noArea` or `area` config field
- **BREAK** `area()` now takes an `AreaCompOpt`, where you can define the area
  size, scale, and hover cursor

```js
add([
    sprite("bean"),
    area(), // empty area will derive from sprite size
    area({ scale: 0.5 }), // 0.5x the sprite size
    area({ offset: vec2(0, 12), width: 4, height: 12 }), // more control over the collider region
]);
```

- **BREAK** renamed `isCollided()` to `isColliding()`, `isHovered()` to
  `isHovering()`
- **BREAK** removed `overlaps()` and `isOverlapped()` and replaced with
  `isColliding()` and `collides()` only checks doesn't return true when 2
  objects are just touching each other, use `isTouching()` to check if they're
  not colliding but just touching each other
- added `isTouching()` to check if 2 objects are collided or just touching other
- audio is now paused when you leave the tab
- audio is now paused on `debug.paused = true`
- added local storage helper `getData(key, default?)` and `setData(key, data)`
- added `loadShader(id, vert, frag, isUrl)`
- added `shader()` comp for attaching custom shader to an obj
- different layers do not prevent collisions now
- **BREAK** changed last argument of `loadFont()` to `FontLoadOpt`
- all event handlers like `keyPress()`, `mouseClick()`, `action()`, `collides()`
  now returns a function to cancel that listener
- added `require` on component definitions, making it possible to declare
  dependencies for components, e.g.

```js
function alwaysRight() {
    return {
        // the id of this component
        id: "alwaysRight",
        // list of component ids that this requires
        require: ["pos"],
        update() {
            // so you can use `move()` from pos() component with no worry
            this.move(100, 0);
        },
    };
}
```

- **BREAK** overlapping component fields are not allowed, e.g. you can't have a
  custom comp that has a `collides` field if it already have a `area` component,
  since it already has that
- **BREAK** changed `text(txt, size, conf)` to `text(txt, conf)` with `size` as
  a field
- added `obj.c(id)` for getting a specific comp's state (by default all comps'
  states are mounted to the obj by `Object.defineProperty`)

```js
// both works
obj.play("anim");
obj.c("sprite").play("anim");
```

- pedit, aseprite plugins are now included by default
- added `addKaboom()` for quick kaboom explosion
- `load*()` now accepts `null` as name and not load into assets manager, instead
  just return the resource data handle
- **BREAK** renamed event `headbump` to `headbutt`
- **BREAK** renamed event `grounded` to `ground`
- added `width`, `height`, and `tiled` attrib to `SpriteCompOpt`, for better
  control over sprite size and tiled sprite support
- **BREAK** renamed `resolve()` to `pushOutAll()` on `area` comp
- added `pushOut()` for pushing a single object out from another with `area`
  comp
- fixed `"add"` event getting called twice for tagged objs
- added `moveTo(dest: Vec2, speed?: number)` to `pos()` comp
- added `keyPress()` (and all other key events) with no arg to check for any key
- **BREAK** renamed `camShake()` to `shake()`
- added `flipX` and `flipY` on `sprite()` comp configuration, and `flipX()`
  `flipY()` methods
- **BREAK** remove `flipX()` and `flipY()` on `scale()` comp
- **BREAK** removed `start()` in favor of `go()`
- **BREAK** removed `changeSprite()` in favor of `use(sprite("newsprite"))`
- tags and components are converged, tags are just empty components now
- added `unuse()` to remove a component or tag
- **BREAK** removed `rmTag()` in favor of `unuse()`
- **BREAK** removed `camIgnore()` in favor of `fixed()`
- **BREAK** renamed `makeRng()` to `rng()`
- sprite animation now supports defining properties like loop and speed in load
  step and play step

```js
loadSprite("hero", "hero.png", {
    sliceX: 9,
    anims: {
        idle: { from: 0, to: 3, speed: 3, loop: true },
        run: { from: 4, to: 7, speed: 10, loop: true },
        hit: 8,
    },
});
```

- **BREAK** changed `.play(anim, ifLoop)` under `sprite()` to accept a dict of
  properties `.play(anim, { loop: true, speed: 60, pingpong: true })`
- **BREAK** now every symbol definition in `addLevel()` should be a function
  returning the component list, to ensure there's no weird shared states

```js
addLevel(["*    *", "*    *", "======"], {
    "*": () => [sprite("wall"), area(), solid()],
    "=": () => [sprite("floor"), area(), solid()],
});
```

- **BREAK** renamed `clearColor` to `background`
- added collision detection functions `testLineLine()`, `testRectRect()`,
  `testRectLine()` etc.
- added drawing functions `drawSprite()`, `drawRect()`, `drawCircle()`,
  `drawPolygon()`, `drawEllipse()`, `drawLine()`, `drawLines()`
- added transformation functions `pushTransform()`, `popTransform()`,
  `pushTranslate()`, `pushRotate()`, `pushScale()`
- **BREAK** removed `areaWidth()` and `areaHeight()` since they won't make sense
  if the area shape is not rectangle, use `worldArea()` if you need area data

```js
const area = player.worldArea();
if (area.shape === "rect") {
    const width = area.p2.x - area.p1.x;
    const height = area.p2.y - area.p1.y;
}
```

### v0.5.1

- added plugins npm package support e.g.
  `import asepritePlugin from "kaboom/plugins/aseprite"`

## [0.5.0] "Sticky Type" - 2021-05-11 (kaboom.js)

- platforms are now sticky
- moved to TypeScript
- improved graphics performance
- improved inspect drawing performance
- added on-screen log that catches all kinds of errors
- added `cursor()`
- added `curPlatform()` by `body()`
- added `falling()` by `body()`
- added `changeSprite()` by `sprite()`
- added `duration()` and `time()` for the handle returned by `play()`
- added optional `seek` field to the audio play conf `play([conf])`
- added `LoopHandle` returned by `loop()` that has a `stop()`
- added a default background (can be dismissed by setting `clearColor`)
- fixed `sound.pause()` to work on firefox
- fixed collisions not treating explicit default layer the same as implicit
  default layer
- fixed unable to play another anim in `onAnimEnd()`
- fixed scene switches happen in the middle of a frame
- fixed `scale(0)` not working
- fixed `mousePos()` not returning the camera affected pos with no layers
- **BREAK** changed `dbg()` to plain `debug` object
- **BREAK** moved `fps()`, `objCount()`, `stepFrame()`, `log()`, `error()` under
  `debug`
- **BREAK** removed `debug.logTime`
- **BREAK** changed component `debugInfo()` hook to `inspect()`
- **BREAK** removed `timer()` component
- **BREAK** renamed `removeTag()` to `rmTag()`
- **BREAK** changed `SpriteAnim` from `[ from, to ]` to
  `{ from: number, to: number }`
- **BREAK** removed `onAnimPlay()` and `onAnimEnd()` in favor of generic event
  `on("animEnd", (anim: string) => {})`
- **BREAK** removed `obj.addTag()` in favor of `obj.use()`
- **BREAK** merged `debug.hoverInfo` and `debug.showArea` into `debug.inspect`
- **BREAK** removed `sound.resume()` in favor of `sound.play()`

### v0.4.1

- fixed `on("destroy")` handler getting called twice
- fixed sprite `play()` not playing

## [0.4.0] "Multiboom" - UNKNOWN (kaboom.js)

- **BREAK** removed `init()` and `kaboom.global()`, in favor of `kaboom()`, also
  allows multiple kaboom games on one page

```js
// replaces init(), and added a 'global' flag for previous kaboom.global()
kaboom({
    global: true,
    width: 480,
    height: 480,
});
```

or not global

```js
const k = kaboom();
k.scene();
k.start();
k.vec2();
```

- **BREAK** changed `clearColor` on `kaboom(conf)` to accept a 4 number array
  instead of `rgba()`
- added a plugin system, see the `multiboom` example and `src/plugins`
- **BREAK** removed support for `.kbmsprite`, supports newer version of `.pedit`
  through pedit plugin
- **BREAK** `loadAseprite()` and made it an external plugin under
  `plugins/aseprite.js`
- added `sceneData()` for custom scene data kv store
- fixed `mouseClick` doesn't work on mobile
- disabled context menu on canvas
- prevented default behavior for 'tab' and function keys
- added `numFrames()` by `sprite()`
- added `screenshot()` that returns of a png base64 data url for a screenshot

## [0.3.0] "King Dedede...Bug!" - UNKNOWN

- **BREAK** removed `pause()` and `paused()` in favor to `kaboom.debug.paused`
- **BREAK** removed `velY`, `curPlatform` and `maxVel` fields by `body()`
- **BREAK** changed `curAnim` by `sprite()` to method `curAnim()`
- fixed `dt()` surge on page visibility change (#20)
- pause audio when page is not visible
- added built in debug control with `init({ debug: true, })`
  - `` ` ``: toggle `showLog` (default on with `debug: true`)
  - `f1`: toggle `showArea`
  - `f2`: toggle `hoverInfo`
  - `f8`: toggle `paused`
  - `f7`: decrease `timeScale`
  - `f9`: increase `timeScale`
  - `f10`: `stepFrame()`
- added on screen logging with `log()` and `error()`
- fixed `loadRoot()` sometimes doesn't work in async tasks

## [0.2.0] "Hear the Tremble" - UNKNOWN

- **BREAK** removed `aseSpriteSheet` conf field from
  `loadSprite(name, src, conf)`
- added `pause()`, `resume()`, `stop()`, `loop()`, `unloop()`, `volume()`,
  `detune()`, `speed()` methods to the handle returned by `play()`
- added `camShake()` for built in camera shake
- added `loadAseprite(name, imgSrc, jsonSrc)`
- added area component generation for `text()`
- added `noArea` to conf field of `sprite()`, `rect()` and `text()`, allowing to
  disable auto area component generation
- added a `quad` field to sprite comp creation config
  `sprite(id, { quad: quad(0, 0, 0.5, 0.5) })`
- fixed `resolve()` not working if the obj also has `solid`, so it does not
  check for itself (#8)
- `mousePos()` accepts a layer argument, which returns the mouse position
  affected by camera transform if that layer is not `camIgnore()`-ed
- fixed camera position getting calculated before completing every object's
  update (#14)
- fixed some cases `on("grounded", f)` called multiple times when moving on a
  smooth platform
- added `revery()` to iterate objects in reverse order
- added `readd()` to re-add an object to the scene without triggering events
- added `level.spawn()`

## [0.1.0] "Oh Hi Mark" -

- **BREAK** changed default origin point to `"topleft"`, so if you want object
  origin point to be at center you'll need to manual `origin("center")`
- **BREAK** integrated `kit/physics` and `kit/level` to main lib
- **BREAK** makes `collides()` only run on first collision, not run every frame
  during the same collision
- **BREAK** `camPos()` by default focuses to center, so `camPos(player.pos)`
  puts player in the center of the screen
- **BREAK** renamed `kaboom.import()` to `kaboom.global()`
- added an arg field to `start(scene, ...)` to forward args to start scene
- added `camScale()`, `camRot()` and `camIgnore()`
- added `obj.overlaps()` by `area()`, and `overlaps()`
- added 3 ext fonts under `ext/fonts`
