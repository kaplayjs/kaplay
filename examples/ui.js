kaplay({
    areaHasUI: false,
    buttons: {
        "focus-next": {
            keyboard: ["tab"],
        },
        "focus-prev": {
            keyboard: ["shift+tab"],
        },
        "enter": {
            keyboard: ["enter"]
        }
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
    layout({ type: "column", padding: 2, spacing: 2, halign: "stretch" }),
]);

container.add([
    pos(),
    button("test"),
]).onInvoke(() => {
    debug.log("test");
});

container.add([
    pos(),
    button("test2"),
]).onInvoke(() => {
    debug.log("test2");
});

container.add([
    pos(),
    checkbox("check"),
]).onInvoke(() => {
    debug.log("check");
});

container.add([
    pos(),
    radio("English", "options", { value: true }),
    "options",
]).onInvoke(() => {
    debug.log("check");
});
container.add([
    pos(),
    radio("日本語", "options"),
    "options",
]).onInvoke(() => {
    debug.log("check");
});

container.add([
    pos(),
    slider({ label: "vol", width: 100 }),
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
    scrollbar(bean, {
        height: 100,
        orientation: "vertical",
        padding: vec2(0, 0),
    }),
]);

add([
    pos(100, 500),
    scrollbar(bean, {
        width: 100,
        orientation: "horizontal",
        padding: vec2(0, 0),
    }),
]);
