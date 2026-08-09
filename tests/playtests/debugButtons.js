const k = kaplay({
    debug: true,
    background: "1f102a",
    debugButtons: {
        inspect: { keyboard: "g" },
        slowdown: { keyboard: "h" },
        pause: { keyboard: "j" },
        speedup: { keyboard: "k" },
        clearlogs: { keyboard: "l" },
    },
});

loadBean();

function addButton(
    txt = "start game",
    p = vec2(200, 100),
    f = () => debug.log("hello"),
) {
    // add a parent background object
    const btn = add([
        rect(60, 60, { radius: 8 }),
        pos(p),
        area(),
        scale(1),
        anchor("center"),
        outline(4),
        color(255, 255, 255),
        {
            set text(val) {
                description.text = val;
            },
        },
    ]);

    // add a child object that displays the text
    const description = btn.add([
        text(txt),
        anchor("center"),
        color(0, 0, 0),
    ]);

    // onHoverUpdate() comes from area() component
    // it runs every frame when the object is being hovered
    btn.onHoverUpdate(() => {
        const t = time() * 10;
        btn.color = hsl2rgb((t / 10) % 1, 0.6, 0.7);
        btn.scale = vec2(1.2);
        setCursor("pointer");
    });

    // onHoverEnd() comes from area() component
    // it runs once when the object stopped being hovered
    btn.onHoverEnd(() => {
        btn.scale = vec2(1);
        btn.color = rgb();
        setCursor("default");
    });

    // onClick() comes from area() component
    // it runs once when the object is clicked
    btn.onClick(f);

    return btn;
}

function addBindable(action, xPos = center().x) {
    const name = add([
        text(action),
        anchor("center"),
        pos(xPos, center().y),
    ]);

    const button = addButton(
        getDebugButton(action).keyboard,
        name.pos.add(0, 60),
        () => {
            button.text = "_";
            const keyEv = onKeyPress((key) => {
                keyEv.cancel();
                button.text = key;
                setDebugButton(action, { keyboard: key });
            });
        },
    );
}

addBindable("inspect", 100);
addBindable("slowdown", 300);
addBindable("pause", 500);
addBindable("speedup", 700);
addBindable("clearlogs", 900);

const bean = add([
    sprite("bean"),
    pos(100, 500),
    anchor("center"),
    area(),
]);

bean.onClick(() => {
    debug.log("i'm a bean!");
});

bean.onUpdate(() => {
    bean.pos.x = wave(100, 800, time());
});
