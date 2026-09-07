kaplay();

const friends = [
    "bean",
    "beant",
    "zombean",
    "burpman",
    "skuller",
    "bag",
    "bobo",
    "sukomi",
    "dino",
    "ghosty",
    "mark",
    "kat",
    "tga",
    "lightening",
    "heart",
    "key",
    "meat",
    "sword",
    "watermelon",
].sort();

var delta = 0, friendCount = 0;
load((async () => {
    const start = performance.now();
    while (_k.assets.packer._getPacker("nearest")._textures.length < 2) {
        const friend = friends[friendCount % friends.length];
        await loadSprite(friend, `/crew/${friend}.png`);
        friendCount++;
    }
    const end = performance.now();
    delta = end - start;
})());

onLoad(() => {
    add([
        text(delta + " ms to fill the atlas with " + friendCount + " friends"),
    ]);
    for (let friend of friends) {
        add([
            sprite(friend),
            pos(rand(vec2(width() - 100, height() - 100))),
            area(),
        ]);
    }
});
onMouseMove(() => addKaboom(mousePos()));
