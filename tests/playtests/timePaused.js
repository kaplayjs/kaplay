kaplay();

loadBean();

const bean = add([
    sprite("bean"),
    pos(100, 500),
    anchor("center"),
    area(),
]);

bean.onUpdate(() => {
    bean.pos.x = wave(100, 800, time());
});
