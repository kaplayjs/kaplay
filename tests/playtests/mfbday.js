// created by @imaginarny

kaplay({
    background: "#ffc3f2",
    buttons: {
        "left": { keyboard: ["left", "a"] },
        "right": { keyboard: ["right", "d"] },
    },
    scale: 2,
    font: "happy",
});

loadBean();
loadSprite("beant", "/crew/beant.png");
loadSprite("cake", "/crew/cake.png");
loadSprite("door", "/crew/door.png");
loadHappy();

onLoad(() => go("game"));

scene("game", () => {
    const game = add([
        timer(),
    ]);

    const MF = game.add([
        pos(center().sub(120, 0)),
        anchor("center"),
        sprite("beant"),
        body(),
        area({ isSensor: true }),
        scale(),
    ]);

    game.add([
        pos(center()),
        anchor("center"),
        sprite("cake"),
        area({ isSensor: true }),
        scale(),
        "cake",
    ]);

    game.add([
        pos(center().add(120, 0)),
        anchor("center"),
        sprite("door"),
        area({ isSensor: true }),
        scale(),
        "exit",
    ]);

    game.children.forEach((obj, i) => {
        if (!obj?.scale) return;

        const to = obj.scale.clone();
        obj.scale = vec2(0);
        wait(
            i * 0.25,
            () =>
                tween(
                    vec2(0),
                    to,
                    0.5,
                    s => obj.scale = s,
                    easings.easeOutBack,
                ),
        );
    });

    game.onButtonDown("left", () => MF.move(-200, 0));
    game.onButtonDown("right", () => MF.move(200, 0));

    MF.onCollide("cake", () => {
        game.paused = true;
        showMessage("Happy birthday MF!", 2, () => {
            game.paused = false;
            MF.sprite = "bean";
            burp();
        });
    });

    MF.onCollide("exit", () => {
        game.paused = true;
        showMessage("oh bye!", 1, () => go("game"));
    });
});

function showMessage(message, duration, onEnd) {
    return add([
        anchor("botleft"),
        pos(30, height() + 200),
        rect(width() - 60, 100, { radius: 8 }),
        outline(2, "#1f102a"),
        timer(),
        {
            elapsed: 0,
        },
        {
            async add() {
                this.add([
                    anchor("center"),
                    pos(this.width / 2, -this.height / 2),
                    text(message, {
                        size: 18,
                        width: this.width - 20,
                        align: "center",
                    }),
                    color("#1f102a"),
                ]);

                this.tween(
                    this.pos.y,
                    height() - 30,
                    0.25,
                    y => this.pos = vec2(this.pos.x, y),
                    easings.easeOutBack,
                );
                await wait(duration);
                await this.tween(
                    this.pos.y,
                    height() + 200,
                    0.25,
                    y => this.pos = vec2(this.pos.x, y),
                    easings.easeInBack,
                ).then(() => this.destroy());
                onEnd && onEnd();
            },

            draw() {
                this.elapsed += dt();

                drawRect({
                    pos: vec2(4, -10),
                    width: lerp(this.width - 8, 0, this.elapsed / duration),
                    height: 6,
                    radius: 4,
                    color: Color.fromHex("#751756"),
                    opacity: 0.25,
                });
            },
        },
    ]);
}
