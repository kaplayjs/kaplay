/**
 * @file Issue #984 Test
 * @description Test for using checking if an anim exists using hasAnim() when the anim is just constant frame 0
 * @difficulty 1
 * @author @Minamotion
 * @minver 30001.0.19
 */

kaplay();

// Load tiny
loadSprite("tiny", "/sprites/minatiny.png", {
    sliceX: 6,
    sliceY: 1,
    anims: {
        idle: 0, // <-- this is the key line
        ouch: 1, //     the rest are irrelevant
        run: {
            from: 2,
            to: 3,
            loop: true,
            speed: 15,
        },
        walk: {
            from: 4,
            to: 5,
            loop: true,
            speed: 6,
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
});

go("game");
