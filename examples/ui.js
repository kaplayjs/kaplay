kaplay({
    buttons: {
        "focus-next": {
            keyboard: ["tab"],
        },
    },
});

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
    pos(100, 100),
    area(),
    button("test"),
]).onInvoke(() => {
    debug.log("test");
});

container.add([
    pos(100, 150),
    area(),
    button("test2"),
]).onInvoke(() => {
    debug.log("test2");
});

container.add([
    pos(100, 200),
    area(),
    checkbox("check"),
]).onInvoke(() => {
    debug.log("check");
});

container.add([
    pos(100, 250),
    area(),
    radio("English", "options"),
    "options",
]).onInvoke(() => {
    debug.log("check");
});
container.add([
    pos(100, 300),
    area(),
    radio("日本語", "options"),
    "options",
]).onInvoke(() => {
    debug.log("check");
});

container.add([
    pos(100, 350),
    area(),
    slider({ label: "slide" }),
]);

container.doLayout();
