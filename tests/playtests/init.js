const k = kaplay();

k.loadSprite("bean", "sprites/bean.png");
k.loadSprite("ghosty", "sprites/ghosty.png");

// Not hidden bean
const bean = k.add([
    k.sprite("bean"),
]);

// Hidden bean
const hiddenBean = k.add([
    k.sprite("bean"),
    k.pos(80, 0),
    k.hidden(),
]);

// Not hidden ghosty
const ghosty = k.add([
    k.sprite("ghosty"),
    k.pos(80 * 2, 0),
]);

// Hidden ghosty
const hiddenGhosty = k.add([
    k.sprite("ghosty"),
    k.pos(80 * 3, 0),
    k.hidden(),
]);

k.debug.inspect = true;
