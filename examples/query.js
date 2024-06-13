kaplay();

loadSprite("bean", "/sprites/bean.png");
loadSprite("ghosty", "/sprites/ghosty.png");

const bean = add([
    pos(50, 50),
    sprite("bean"),
    color(WHITE),
    "bean",
]);

add([
    pos(200, 50),
    sprite("ghosty"),
    color(WHITE),
    "ghosty",
]);

add([
    pos(400, 50),
    sprite("ghosty"),
    color(WHITE),
    "ghosty",
]);

add([
    pos(100, 250),
    sprite("ghosty"),
    color(WHITE),
    "ghosty",
    named("Candy&Carmel"),
]);

function makeButton(p, t, cb) {
    const button = add([
        pos(p),
        rect(150, 40, { radius: 5 }),
        anchor("center"),
        color(WHITE),
        area(),
        "button",
    ]);
    button.add([
        text(t),
        color(BLACK),
        anchor("center"),
        area(),
    ]);
    button.onClick(() => {
        get("button").forEach(o => o.color = WHITE);
        button.color = GREEN;
        cb();
    });
}

makeButton(vec2(200, 400), "bean", () => {
    get("sprite").forEach(o => o.color = WHITE);
    query({ include: "bean" }).forEach(o => o.color = RED);
});

makeButton(vec2(360, 400), "ghosty", () => {
    get("sprite").forEach(o => o.color = WHITE);
    query({ include: "ghosty" }).forEach(o => o.color = RED);
});

makeButton(vec2(200, 450), "near", () => {
    get("sprite").forEach(o => o.color = WHITE);
    bean.query({
        distance: 150,
        distanceOp: "near",
        hierarchy: "siblings",
        exclude: "button",
    }).forEach(o => o.color = RED);
});

makeButton(vec2(360, 450), "far", () => {
    get("sprite").forEach(o => o.color = WHITE);
    bean.query({
        distance: 150,
        distanceOp: "far",
        hierarchy: "siblings",
        exclude: "button",
    }).forEach(o => o.color = RED);
});

makeButton(vec2(520, 400), "name", () => {
    get("sprite").forEach(o => o.color = WHITE);
    query({ name: "Candy&Carmel" }).forEach(o => o.color = RED);
});
