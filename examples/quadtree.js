kaplay();

loadBean();

const quadtree = makeQuadtree(vec2(0, 0), width(), height(), 8, 4);

function drawNode(node) {
    drawRect({
        pos: node.bounds.pos,
        width: node.bounds.width,
        height: node.bounds.height,
        fill: false,
        outline: {
            color: RED,
            width: 2,
        }
    });
    for (const n of node.nodes) {
        drawNode(n);
    }
}

onDraw(() => {
    drawNode(quadtree)
})

onLoad(() => {
    for (let i = 0; i < 64; i++) {
        const obj = add([
            pos(rand(0, width()), rand(0, height())),
            sprite("bean"),
            anchor("center"),
            area(),
            color(WHITE),
            {
                draw() {
                    const r = this.screenArea().bbox();
                    pushTransform();
                    pushMatrix(new Mat23());
                    drawRect({
                        pos: r.pos,
                        width: r.width,
                        height: r.height,
                        fill: false,
                        outline: {
                            color: RED,
                            width: 2,
                        }
                    });
                    popTransform();
                }
            }
        ]);

        quadtree.add(obj);
    }
});

onMouseMove(() => {
    const pos = mousePos();
    const objects = [];
    const rect = new Rect(pos.sub(4, 4), 8, 8);
    quadtree.retrieve(rect, objects);
    get("*").forEach(bean => {
        bean.color = WHITE;
    });
    objects.forEach(bean => {
        bean.color = RED;
    });
})