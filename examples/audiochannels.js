kaplay({
    // This makes it so the audio doesn't pause when the tab is changed
    backgroundAudio: true,
    background: "5ba675",
});

loadSound("burp", "/sounds/burp.mp3");
loadSound("bell", "/sounds/bell.mp3");
loadSound("shoot", "/sounds/shoot.mp3");
loadMusic("OtherworldlyFoe", "/sounds/OtherworldlyFoe.mp3");
// bag loves music
loadSprite("bag", "/sprites/bag.png");
loadSprite("note", "/sprites/note.png");
loadSprite("jumpy", "/sprites/jumpy.png");
loadSprite("gun", "/sprites/gun.png");

onLoad(() => {
    const sfx = createChannel("sfx");
    const music = createChannel("music");

    music.play("OtherworldlyFoe");
    music.mute = true;

    add([
        text("Click to play a sound", { width: 300, align: "center" }),
        pos(center().x, center().y - 125),
        anchor("center"),
    ]);

    const note = add([
        sprite("note"),
        anchor("center"),
        pos(center()),
        scale(2),
        area({ cursor: "pointer" }),
    ]);

    note.onClick(() => {
        sfx.play("bell");
        tween(
            vec2(2.5),
            vec2(2),
            0.15,
            (p) => note.scale = p,
            easings.easeOutQuint,
        );
    });

    // sfx
    add([
        text("SFX"),
        pos((1 / 6) * width(), 30),
        anchor("center"),
    ]);

    const sfxArrowUp = add([
        sprite("jumpy"),
        anchor("center"),
        pos((1 / 6) * width(), (1 / 6) * height()),
        scale(1),
        area(),
        opacity(1),
        {
            add() {
                this.onClick(() => {
                    sfx.volume += 0.1;

                    tween(
                        vec2(1.5),
                        vec2(1),
                        0.15,
                        (p) => this.scale = p,
                        easings.easeOutQuint,
                    );
                });
            },
        },
    ]);

    const sfxMute = add([
        sprite("gun"),
        anchor("center"),
        pos((1 / 6) * width() - 100, (3 / 6) * height()),
        scale(1),
        area(),
        opacity(1),
        {
            add() {
                this.onClick(() => {
                    sfx.mute = !sfx.mute;
                    // play out of sfx channel so it's played regardless of sfx being muted
                    play("shoot");

                    if (sfx.mute) {
                        this.color = RED;
                        sfxArrowUp.opacity = 0.5;
                        sfxText.opacity = 0.5;
                        sfxArrowDown.opacity = 0.5;
                    }
                    else {
                        this.color = WHITE;
                        sfxArrowUp.opacity = 1;
                        sfxText.opacity = 1;
                        sfxArrowDown.opacity = 1;
                    }
                });
            },
        },
    ]);

    const sfxText = add([
        text(sfx.volume.toString()),
        anchor("center"),
        pos((1 / 6) * width(), (3 / 6) * height()),
        scale(2),
        area(),
        opacity(1),

        {
            update() {
                this.text = sfx.volume.toFixed(1);
            },
        },
    ]);

    const sfxArrowDown = add([
        sprite("jumpy"),
        anchor("center"),
        pos((1 / 6) * width(), (5 / 6) * height()),
        scale(1),
        rotate(180),
        area(),
        opacity(1),
        {
            add() {
                this.onClick(() => {
                    sfx.volume -= 0.1;

                    tween(
                        vec2(1.5),
                        vec2(1),
                        0.15,
                        (p) => this.scale = p,
                        easings.easeOutQuint,
                    );
                });
            },
        },
    ]);

    // music
    add([
        text("MUSIC"),
        pos((5 / 6) * width(), 30),
        anchor("center"),
    ]);

    const musicArrowUp = add([
        sprite("jumpy"),
        anchor("center"),
        pos((5 / 6) * width(), (1 / 6) * height()),
        scale(1),
        area(),
        opacity(1),
        {
            add() {
                this.onClick(() => {
                    music.volume += 0.1;

                    tween(
                        vec2(1.5),
                        vec2(1),
                        0.15,
                        (p) => this.scale = p,
                        easings.easeOutQuint,
                    );
                });
            },
        },
    ]);

    const musicMute = add([
        sprite("gun"),
        color(),
        anchor("center"),
        pos((5 / 6) * width() - 100, (3 / 6) * height()),
        scale(1),
        area(),
        opacity(1),
        {
            add() {
                this.onClick(() => {
                    music.mute = !music.mute;
                    // play out of sfx channel so it's played regardless of sfx being muted
                    play("shoot");

                    if (music.mute) {
                        this.color = RED;
                        musicArrowUp.opacity = 0.5;
                        musicText.opacity = 0.5;
                        musicArrowDown.opacity = 0.5;
                    }
                    else {
                        this.color = WHITE;
                        musicArrowUp.opacity = 1;
                        musicText.opacity = 1;
                        musicArrowDown.opacity = 1;
                    }
                });
            },
        },
    ]);

    const musicText = add([
        text(music.volume.toString()),
        anchor("center"),
        pos((5 / 6) * width(), (3 / 6) * height()),
        scale(2),
        area(),
        opacity(1),

        {
            update() {
                this.text = music.volume.toFixed(1);
            },
        },
    ]);

    const musicArrowDown = add([
        sprite("jumpy"),
        anchor("center"),
        pos((5 / 6) * width(), (5 / 6) * height()),
        scale(1),
        rotate(180),
        area(),
        opacity(1),
        {
            add() {
                this.onClick(() => {
                    music.volume -= 0.1;

                    tween(
                        vec2(1.5),
                        vec2(1),
                        0.15,
                        (p) => this.scale = p,
                        easings.easeOutQuint,
                    );
                });
            },
        },
    ]);
});
