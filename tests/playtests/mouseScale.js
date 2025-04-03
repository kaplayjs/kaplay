kaplay({
    scale: 3,
    width: 20,
    height: 40,
});

const x = add([
    anchor("center"),
    circle(3),
    color(RED),
    pos(),
]);

getTreeRoot().use(pos());

onMouseMove(pos => {
    x.pos = getTreeRoot().fromScreen(pos);
});