kaplay();
loadBean();

const bean = add([
    pos(10, 10),
    move(RIGHT, 100),
    "friend",
]);

const r = bean.add([
    rect(10, 10),
]);

r.add([
    sprite("bean"),
]);

const beanPrefab = bean.serialize();

onMousePress(() => {
    const bean2 = addPrefab(beanPrefab, [
        pos(20, rand(40, height() - 40)),
    ]);

    debug.log(bean2.tags);
});
