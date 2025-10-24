kaplay();

for (i = 0; i < 20; i++) {
    let randPosX = randi(64, width() - 64);
    let randPosY = randi(64, width() - 64);
    let randFactor = rand(0.1, 0.75);
    add([
        pos(randPosX, randPosY),
        z(20),
        rect(64, 64),
        color(RED),
        scrollcam(randFactor, randFactor),
    ]);
}

for (i = 0; i < 20; i++) {
    let randPosX = randi(32, width() - 32);
    let randPosY = randi(32, width() - 32);
    let randFactor = rand(0.1, 0.75);
    add([
        pos(randPosX, randPosY),
        z(-90),
        rect(32, 32),
        color(BLUE),
        scrollcam(randFactor, randFactor),
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
    pos(10, height - 64),
    text("Oh Hi! Use the arrows to move the camera"),
]);

setCamScale(0.9);
