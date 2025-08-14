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

const selection = [];

onMouseDown(() => {
    const pos = mousePos();
    const rect = new Rect(pos.sub(4, 4), 8, 8);
    const objects = [];
    selection.length = 0;
    quadtree.retrieve(rect, objects);
    if (objects.length > 0) {
        get("*").forEach(bean => {
            bean.color = WHITE;
        });
        objects.forEach(obj => {
            if (obj.screenArea().contains(pos)) {
                selection.push(obj);
                obj.color = GREEN;
            }
        });
    }
})

onMouseMove((pos, dpos) => {
    if (selection.length) {
        selection.forEach(obj => {
            obj.pos = obj.pos.add(dpos)
        });
        quadtree.update();
    }
    else {
        const pos = mousePos();
        const rect = new Rect(pos.sub(4, 4), 8, 8);
        const objects = [];
        quadtree.retrieve(rect, objects);
        get("*").forEach(bean => {
            bean.color = WHITE;
        });
        objects.forEach(bean => {
            bean.color = RED;
        });
    }
})

onMouseRelease(() => {
    selection.length = 0;
});