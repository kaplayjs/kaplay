/**
 * @file Gamepad Analog Triggers
 * @description How to read analog triggers on connected gamepads.
 * @difficulty 1
 * @tags input
 * @minver 4000.0
 * @category input
 */

kaplay({ background: "black" });

loadSprite("bean", "./sprites/bean.png");
loadSprite("gun", "./sprites/gun.png");
loadSprite("ghosty", "./sprites/ghosty.png");

scene("main", () => {
    const player = add([
        pos(50, 50),
        sprite("bean"),
        anchor("center"),
    ]);

    const gun = player.add([
        sprite("gun"),
        anchor(vec2(-2, 0)),
        rotate(0),
    ]);

    onGamepadStick("left", v => {
        if (v.slen() > 0.01) { // deadzone
            player.move(v.scale(400));
        }
    });

    onGamepadStick("right", v => {
        if (v.slen() > 0.01) {
            gun.angle = v.angle();
        }
        gun.flipY = Math.abs(gun.angle) > 90;
    });

    onGamepadDisconnect(() => {
        go("nogamepad", true);
    });

    // add 3 ghostys
    for (let i = 0; i < 3; i++) {
        add([
            pos(rand(vec2(width() - 60, height() - 60))),
            sprite("ghosty"),
            area(),
            color(WHITE),
            "ghosty",
        ]);
    }

    function shoot() {
        const analogValue = getGamepadAnalogButton("rtrigger");
        if (analogValue > 0.1) {
            // add bullet
            const dir = RIGHT.rotate(gun.angle);
            add([
                rect(20, 5, { radius: 5 }),
                color(YELLOW.darken(100 * (1 - analogValue))),
                rotate(gun.angle),
                move(dir, 1000 * analogValue),
                pos(player.pos.add(dir.scale(60))),
                area(),
                offscreen({ destroy: true }), // Destroy them on offscreen to avoid lag
                "bullet",
                {
                    power: analogValue,
                },
            ]);
        }
        // increase in speed as analog trigger is pressed
        wait(Math.min(0.2, Math.pow(analogValue, -4) / 20), shoot);
    }
    shoot();

    onCollide("ghosty", "bullet", (ghosty, bullet) => {
        ghosty.moveBy(Vec2.fromAngle(bullet.angle).scale(10 * bullet.power));
        tween(RED, WHITE, 0.2, c => ghosty.color = c);
        destroy(bullet);
    });
});

scene("nogamepad", had => {
    add([
        text(
            had
                ? "Gamepad disconnected"
                : "Gamepad not found.\nConnect a gamepad and press a button!",
            {
                width: width() - 80,
                align: "center",
            },
        ),
        pos(center()),
        anchor("center"),
    ]);
    onGamepadConnect(() => {
        go("main");
    });
});

if (getGamepads().length > 0) {
    go("main");
}
else {
    go("nogamepad", false);
}
