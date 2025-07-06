kaplay();

loadBean();

// #region Prefab made with an object

const root = getTreeRoot();

const bean = add([
    sprite("bean"),
    pos(10, 10),
    move(RIGHT, 100),
]);

const beanPrefab = bean.serialize();

console.log(beanPrefab);

onClick(() => {
    const bean2 = root.addPrefab(beanPrefab);
    bean2.use(pos(20, rand(40, height() - 40)));
});

// #endregion
