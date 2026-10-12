kaplay({ pixelDensity: Math.min(2, devicePixelRatio) });
debug.inspect = true;

const pauseMenu = add([
    rect(300, 260, { radius: 10 }),
    color(255, 255, 255),
    outline(4),
    anchor("center"),
    pos(center()),
]);

pauseMenu.add([
    text("Pause Menu"),
    color(BLACK),
    anchor("top"),
    pos(0, -pauseMenu.height / 2 + 24),
]);

pauseMenu.buttons = [
    ["Resume", () => {}],
    ["Restart", () => {}, rgb(244, 66, 94)],
].map(([txt, fn, bg], i) =>
    pauseMenu.add([
        {
            draw() {
                drawRect({
                    width: pauseMenu.width - 64,
                    height: this.height + 24,
                    color: bg ?? rgb(0, 127, 255),
                    radius: 8,
                    outline: { width: 4, color: BLACK },
                    anchor: this.anchor,
                });
            },
            add() {
                /* this.use(area({
                shape: new Rect(vec2(0), pauseMenu.width - 64, this.height + 24),
            })); */
                fn && this.onClick(fn);
                this.onHover(() => this.scale = vec2(1.06));
                this.onHoverEnd(() => this.scale = vec2(1));
            },
        },
        text(txt, { size: 28 }),
        anchor("center"),
        pos(0, 64 * i - 20),
        scale(1),
        area(),
    ])
);
