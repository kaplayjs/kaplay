kaplay();
loadBean();
loadSprite("ghosty", "sprites/ghosty.png");

const bean = add([
    sprite("bean"),
    pos(100),
    area(),
    color(),
]);

bean.onClick(() => {
    shake(20);
});

bean.onHover(() => {
    bean.color = RED;
});

bean.onHoverEnd(() => {
    bean.color = WHITE;
});

const ghosty = add([
    sprite("ghosty"),
    pos(200),
    area(),
    color(),
    fixed(),
]);

ghosty.onClick(() => {
    shake(20);
});

ghosty.onHover(() => {
    ghosty.color = RED;
});

ghosty.onHoverEnd(() => {
    ghosty.color = WHITE;
});

debug.inspect = true;
