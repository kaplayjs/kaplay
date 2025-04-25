kaplay({
    background: "#f2ae99",
});

loadBean();

const origPos = add([
    anchor("center"),
    pos(center().x, 100),
    circle(4),
    color("#5ba675"),
    outline(4, { color: BLACK }),
]);

const card = add([
    anchor("center"),
    pos(origPos.pos),
    rect(300, 100, { radius: 16 }),
    color(WHITE),
    outline(8, BLACK),
]);

const bean = card.add([
    sprite("bean"),
    anchor("center"),
    scale(2),
    area(),
    z(1),
]);

bean.onHover(() => {
    setCursor("pointer");
    card.color = Color.fromHex("#5ba675");
});

bean.onHoverEnd(() => {
    setCursor("default");
    card.color = WHITE;
});

wait(2, () => {
    tween(
        card.pos.y,
        center().y,
        0.25,
        y => card.pos.y = y,
        easings.easeOutBack,
    );
});
