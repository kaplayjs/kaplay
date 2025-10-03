kaplay({
    buttons: {
        "focus-next": {
            keyboard: ["tab"],
        },
    },
});

loadBean();

loadAseprite("ui", "/sprites/ui.png", "/sprites/ui.json");
loadSprite("button", "/sprites/button.png", {
    slice9: { left: 3, top: 3, right: 3, bottom: 3 },
});
loadSprite("buttonpressed", "/sprites/buttonpressed.png", {
    slice9: { left: 3, top: 3, right: 3, bottom: 3 },
});

const container = add([
    pos(20, 20),
    layout({ type: "column", padding: 2, spacing: 2 }),
]);

container.add([
    pos(),
    area(),
    button("test"),
]).onInvoke(() => {
    debug.log("test");
});

container.add([
    pos(),
    area(),
    button("test2"),
]).onInvoke(() => {
    debug.log("test2");
});

container.add([
    pos(),
    area(),
    checkbox("check"),
]).onInvoke(() => {
    debug.log("check");
});

container.add([
    pos(),
    area(),
    radio("English", "options"),
    "options",
]).onInvoke(() => {
    debug.log("check");
});
container.add([
    pos(),
    area(),
    radio("日本語", "options"),
    "options",
]).onInvoke(() => {
    debug.log("check");
});

container.add([
    pos(),
    area(),
    slider({ label: "slide", width: 100 }),
]);

container.doLayout();

mask = add([
    pos(100, 400),
    mask(),
    rect(100, 100),
]);

const bean = mask.add([
    pos(),
    sprite("bean", { width: 61 * 3, height: 53 * 3 }),
]);

add([
    pos(200, 400),
    area(),
    slider({ scrollObject: bean, height: 100, orientation: "vertical" }),
]);

add([
    pos(100, 500),
    area(),
    slider({ scrollObject: bean, width: 100, orientation: "horizontal" }),
]);
