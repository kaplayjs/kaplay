kaplay({
    tagsAsComponents: true,
});

loadBean();

function recur(obj, level) {
    if (level < 0) return;
    const obj2 = obj.add([
        pos(rand(vec2(0), vec2(100))),
        scale(rand(vec2(2))),
        rotate(rand(0, 360)),
    ]);
    if (level === 0) {
        obj2.use(sprite("bean"));
        obj2.use(area());
        // obj2.collisionIgnore.push("*");
    }
    recur(obj2, level - 1);
}

for (var i = 0; i < 500; i++) {
    recur(getTreeRoot(), 2);
}
var frames = 0;
onUpdate(() => {
    frames++;
    debug.log((frames / time()).toFixed(), "fps");
});
