/**
 * @file scrollObjTest
 * @description Testing for parallax component
 * @difficulty 1
 * @tags basics
 * @minver 3001.1
 */

kaplay();

const mouseObject = add([
    pos(mousePos()),
    rect(8, 8),
    anchor("center"),
]);

mouseObject.onUpdate(() => {
    mouseObject.pos = toWorld(mousePos());
});

for (i = 0; i < 20; i++) {
    let randPosX = randi(64, width() - 64);
    let randPosY = randi(64, width() - 64);
    let randFactor = rand(1.1, 1.75);
    const o = add([
        pos(randPosX, randPosY),
        z(20),
        rect(64, 64),
        color(RED),
        parallax(randFactor, randFactor),
    ]);
    o.add([
        pos(5, 5),
        z(0),
        rect(64, 64),
        color(BLACK),
        opacity(0.5),
    ]);
}

for (i = 0; i < 20; i++) {
    let randPosX = randi(32, width() - 32);
    let randPosY = randi(32, width() - 32);
    let randFactor = rand(0.1, 0.75);
    const ob = add([
        pos(randPosX, randPosY),
        z(-90),
        rect(32, 32),
        color(BLUE),
        parallax(randFactor, randFactor),
    ]);
    ob.add([
        pos(5, 5),
        z(-200),
        rect(32, 32),
        color(BLACK),
        opacity(0.5),
    ]);
}

onUpdate(() => {
    if (isKeyDown("left")) {
        setCamPos(getCamPos().x - 3, getCamPos().y);
    }
    if (isKeyDown("right")) {
        setCamPos(getCamPos().x + 3, getCamPos().y);
    }
    if (isKeyDown("up")) {
        setCamPos(getCamPos().x, getCamPos().y - 3);
    }
    if (isKeyDown("down")) {
        setCamPos(getCamPos().x, getCamPos().y + 3);
    }
});

add([
    pos(0, 0),
    z(9999),
    fixed(),
    text(
        "Oh Hi! Use the arrows to move the camera\npress space to change to object parallax",
    ),
]);

setCamScale(0.9);
