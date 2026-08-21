kaplay({
    doubleClickDelay: 0.25,
})

loadBean();
setBackground(BLUE.lighten(150));

let clicks = 0;

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

bean.onMousePress(() => {
    if (!bean.isHovering()) return;
    tween(2.2, 2, 0.15, (p) => bean.scale = vec2(p), easings.easeOutQuad)
})

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

    burp()

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

    window.add([
        rect(50, 50),
        color(RED),
        pos(window.width / 2 - 50, -window.height / 2),
        area(),
        {
            add() {
                this.onClick(() => {
                    windowOpen = false
                    window.destroy()
                })
            },
        },
    ])
});
