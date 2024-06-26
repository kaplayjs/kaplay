# KAPLAY

![KAPLAY](assets/brand/kaplay-o.webp)

> KAPLAY is the spiritual successor (and fork) of Kaboom, a JavaScript library that helps you make games fast and fun!
> For now, there's links to the Kaboom documentation and examples, but in the future, they will be linked
> to our own site.

[**KAPLAY**](https://kaplayjs.com/) is a JavaScript library that helps you make games fast and fun!

Start playing around with it in the [KAPLAYGROUND](https://play.kaplayjs.com/)

## Examples

```js
// initialize context
kaplay();

// define gravity
setGravity(2400);

// load a sprite called "bean"
loadSprite("bean", "sprites/bean.png");

// compose the player game object from multiple components and add it to the game
const bean = add([
    sprite("bean"),
    pos(80, 40),
    area(),
    body(),
]);

// press space to jump
onKeyPress("space", () => {
    // this method is provided by the "body" component above
    bean.jump();
});
```

KAPLAY uses a powerful component system to compose game objects and behaviors.

```js
// add a game obj to the scene from a list of component
const player = add([
    // it renders as a sprite
    sprite("bean"),
    // it has a position
    pos(100, 200),
    // it has a collider
    area(),
    // it is a physical body which will respond to physics
    body(),
    // it has 8 of health
    health(8),
    // or give it tags for easier group behaviors
    "player",
    "friendly",
    // plain objects fields are directly assigned to the game obj
    {
        dir: vec2(-1, 0),
        dead: false,
        speed: 240,
    },
]);
```

Blocky imperative syntax for describing behaviors

```js
// .onCollide() comes from "area" component
player.onCollide("enemy", () => {
    // .hurt() comes from "health" component
    player.hurt(1);
});

// check fall death
player.onUpdate(() => {
    if (player.pos.y >= height()) {
        destroy(player);
        gameOver();
    }
});

// if 'player' onCollide with any object with tag "enemy", run the callback
player.onCollide("enemy", () => {
    player.hp -= 1;
});

// all objects with tag "enemy" will move towards 'player' every frame
onUpdate("enemy", (e) => {
    e.move(player.pos.sub(e.pos).unit().scale(e.speed));
});

// move up 100 pixels per second every frame when "w" key is held down
onKeyDown("w", () => {
    player.move(0, 100);
});
```

## Usage

### Start a Project With `create-kaplay`

The fastest way to start a KAPLAY game is with [`create-kaplay`](https://github.com/marklovers/create-kaplay)

```sh
$ create-kaplay mygame
```

This will create a directory called `mygame` for you, containing all the files we need

```sh
$ cd mygame
$ npm run dev
```

Then open http://localhost:5173 and edit `src/game.js`

### Install as NPM Package

```sh
$ npm install kaplay
```

```js
import kaplay from "kaplay";

kaplay();

add([
    text("oh hi"),
    pos(80, 40),
]);
```

also works with CommonJS

```js
const kaboom = require("kaplay");
```

Note that you'll need to use a bundler like `esbuild` or `webpack` to use KAPLAY with NPM

### Browser CDN

This exports a global `kaplay` function

```html
<script src="https://unpkg.com/kaplay@3000.1.17/dist/kaboom.js"></script>
<script>
kaplay()
</script>
```

or use with es modules

```html
<script type="module">
import kaplay from "https://unpkg.com/kaplay@3000.1.17/dist/kaboom.mjs"
kaplay()
</script>
```

works all CDNs that supports NPM packages, e.g. jsdelivr, skypack

## Documentation

- **v3001**: https://kaplayjs.com/
- **v3000**: https://kaboomjs.com/
- **v2000**: https://2000.kaboomjs.com/
- **v0.5.0**: https://legacy.kaboomjs.com/

## Community

- [Discord Server](https://discord.gg/aQ6RuQm3TF)
- [GitHub Discussions](https://github.com/marklovers/kaplay/discussions)
- [Twitter](https://twitter.com/Kaboomjs)

### Games

Collections of games made with KAPLAY (and Kaboom), selected by KAPLAY:

- [Itch.io](https://itch.io/c/4494863/kag-collection)
- [Newgrounds.com](https://www.newgrounds.com/playlist/379920/kaplay-games)

## Credits

- Thanks to [tga](https://space55.xyz) for all his work on the original Kaboom.js
- Thanks to [mulfok](https://twitter.com/MulfoK) for the amazing [mulfok32](https://lospec.com/palette-list/mulfok32) color palette, used in KAPLAY sprites
- Thanks to [abrudz](https://github.com/abrudz) for the amazing [APL386 font](https://abrudz.github.io/APL386/)
- Thanks to [Polyducks](http://polyducks.co.uk/) for the amazing [kitchen sink font](https://polyducks.itch.io/kitchen-sink-textmode-font) font
- Thanks to [0x72](https://0x72.itch.io/) for the amazing [Dungeon Tileset](https://0x72.itch.io/dungeontileset-ii)
- Thanks to [Kenney](https://kenney.nl/) for the amazing [1-Bit Platformer Pack](https://kenney.nl/assets/1-bit-platformer-pack)
