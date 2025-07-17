kaplay();

loadBean();

// #region Prefab made with an object

const root = getTreeRoot();

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

console.log(beanPrefab);

onClick(() => {
    const bean2 = root.addPrefab(beanPrefab, [
        pos(20, rand(40, height() - 40)),
    ]);

    debug.log(bean2.tags);
});

// #endregion
