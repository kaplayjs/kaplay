/**
 * @file Retrieve
 * @description Using the retrieve function to detect collisions
 * @difficulty 0
 * @tags physics
 * @minver 4000.0
 * @category concepts
 * @test
 */

kaplay({
    // broadPhaseCollisionAlgorithm: "quadtree",
    // broadPhaseCollisionAlgorithm: "grid",
    // broadPhaseCollisionAlgorithm: "sap"
    broadPhaseCollisionAlgorithm: "sapv",
});

loadBean();

onLoad(() => {
    for (let i = 0; i < 32; i++) {
        add([
            pos(rand(64, width() - 64), rand(64, height() - 64)),
            sprite("bean"),
            anchor("center"),
            color(WHITE),
            area(),
        ]);
    }
});

onMouseMove(pos => {
    debug.log(pos);
    let beans = get("*");
    debug.log("There are", beans.length, "beans");
    for (const bean of beans) {
        bean.color = WHITE;
    }
    beans = retrieve(new Rect(pos.sub(2, 2), 4, 4), bean => {
        debug.log(bean.id);
        bean.color = RED;
    });
});
