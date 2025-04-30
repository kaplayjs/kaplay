kaplay();

loadBean();

const bean = add([
    sprite("bean"),
    pos(),
    health(100, 100),
    area(),
]);

bean.onClick(() => {
    bean.hurt(100);
    debug.log(bean.hp);
});

bean.onDeath(() => {
    debug.log("running from on death, bean hp: " + bean.hp);
});
