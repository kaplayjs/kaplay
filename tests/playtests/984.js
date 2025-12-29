kaplay();

// Load tiny
loadSprite("tiny", "https://file.garden/aAAniAgY3QmuIh36/tiny.png", {
    "sliceX": 6,
    "sliceY": 1,
    "anims": {
        "idle": 0,
        "ouch": 1,
        "run": {
            "from": 2,
            "to": 3,
            "loop": true,
            "speed": 15,
        },
        "walk": {
            "from": 4,
            "to": 5,
            "loop": true,
            "speed": 6,
        },
    },
});

// Do this
scene("game", async () => {
    const me = add([
        text("No animation is playing"),
        pos(30, 30),
    ]);

    const tiny = add([
        sprite("tiny"),
        pos(center()),
        scale(2),
        anchor("center"),
        rotate(0),
        offscreen({ destroy: true }),
    ]);

    async function test(animName) {
        me.text = `Play ${animName} animation`;
        tiny.play(animName);
        await wait(2);
        me.text = tiny.hasAnim(animName) ? "This exists" : "This doesnt exist";
        me.text += "\nAccording to Kaplay's\n hasAnim() function";
        await wait(2);
    }

    await wait(2);
    await test("walk");
    await test("idle");
    await test("ouch");
    tiny.play("idle");
    me.text = "Y'all see my problem\n with hasAnim()?";
    await wait(2);
    me.text = "(was this already patched?)";
    await wait(2);
    me.text = "Anyways";
    await wait(2);
    me.text = "You can get out now, tiny";
    await wait(0.5);
    tiny.onUpdate(() => {
        tiny.move(650, 0);
    });
    tiny.play("run");
    await wait(1.5);
});

go("game");
