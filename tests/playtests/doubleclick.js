kaplay();

loadBean();
setBackground(BLUE.lighten(150));

const bean = add([
    sprite("bean"),
    scale(2),
    pos(center()),
    area(),
    anchor("center"),
    {
        draw() {
            drawText({
                color: BLACK,
                text: "bean.png",
                anchor: "center",
                pos: vec2(0, 35),
                size: 15,
            });
        },
    },
]);

let windowOpen = false;

bean.onMouseDoublePress(() => {
    if (!bean.isHovering()) return;
    if (windowOpen) return;

    windowOpen = true;

    // open window
    const window = add([
        color(WHITE.darken(50)),
        rect(650, 450),
        pos(center()),
        anchor("center"),
        area(),
    ]);

    window.add([
        rect(650, 50),
        color(BLUE),
        pos(-window.width / 2, -window.height / 2),
        {
            add() {
                this.add([
                    text("bean.png"),
                    color(WHITE),
                    pos(10),
                ]);
            },
        },
    ]);

    window.add([
        sprite("bean"),
        scale(4),
        pos(),
        area(),
        anchor("center"),
    ]);

    window.onKeyPress("escape", () => {
        window.destroy();
        windowOpen = false;
    });
});
