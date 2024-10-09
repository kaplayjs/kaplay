kaplay();

loadSprite("grass", "/sprites/grass.png");

const level = addLevel([
    " =",
], {
    tileWidth: 64,
    tileHeight: 64,
    tiles: {
        "=": () => [
            sprite("grass"),
        ],
    },
});

const pos = vec2(0, 0);
level.spawn("=", pos);

wait(1, () => {
    const obj = level.getAt(pos);
    console.log(obj);
    destroy(obj[0]);
});

wait(2, () => {
    // shouldn't print the object
    const obj = level.getAt(pos);
    console.log(obj);
});
