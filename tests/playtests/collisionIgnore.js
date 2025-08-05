kaplay();
loadBean();

var n = 1000;
function randomTagsList() {
    return new Array(5).fill().map(() => (++n).toString());
}

for (var i = 0; i < 500; i++) {
    add([
        sprite("bean"),
        pos(rand(vec2(0), vec2(100))),
        area({ collisionIgnore: randomTagsList() }),
        ...randomTagsList(),
    ]);
}

onUpdate(() => {
    debug.log(debug.fps(), "fps");
});
