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
].sort();

load((async () => {
    while (_k.assets.packer._getPacker("nearest")._textures.length < 2) {
        for (let friend of friends) {
            await loadSprite(friend, `/crew/${friend}.png`);
        }
    }
})());

onLoad(() => {
    for (let friend of friends) {
        add([
            sprite(friend),
            pos(rand(vec2(width() - 100, height() - 100))),
            area(),
        ]);
    }
});
onMouseMove(() => addKaboom(mousePos()));
