kaplay();

loadBean();

const quadtree = makeQuadtree(vec2(0, 0), width(), height(), 8, 4, true);

function drawNode(node) {
    drawRect({
        pos: node.bounds.pos,
        width: node.bounds.width,
        height: node.bounds.height,
        fill: false,
        outline: {
            color: RED,
            width: 4,
        },
    });
    for (const n of node.nodes) {
        drawNode(n);
    }
}

onDraw(() => {
    drawNode(quadtree);
});

function addBean(x, y) {
    const obj = add([
        pos(x, y),
        sprite("bean"),
        anchor("center"),
        area(),
        color(WHITE),
        {
            draw() {
                const r = this.worldArea().bbox();
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
                    },
                });
                popTransform();
            },
        },
    ]);
    return obj;
}

onLoad(() => {
    for (let i = 0; i < 64; i++) {
        const obj = addBean(rand(64, width() - 64), rand(64, height() - 64));
        quadtree.add(obj);
    }
});

const selection = [];
let lastSelected = null;

onMousePress(button => {
    if (button == "left") {
        const pos = toWorld(mousePos());
        const rect = new Rect(pos.sub(4, 4), 8, 8);
        const objects = [];
        selection.length = 0;
        quadtree.retrieve(rect, obj => {
            objects.push(obj);
        });
        if (objects.length > 0) {
            get("*").forEach(bean => {
                bean.color = WHITE;
            });
            objects.forEach(obj => {
                if (obj.worldArea().contains(pos)) {
                    selection.push(obj);
                    obj.color = GREEN;
                }
            });
        }
        lastSelected = selection.length ? selection[0] : null;
    }
    else if (button == "right") {
        const pos = toWorld(mousePos());
        const obj = addBean(pos.x, pos.y);
        quadtree.add(obj);
    }
});

onMouseMove((pos, dpos) => {
    if (selection.length) {
        getCamTransform().inverse.transformVectorV(dpos, dpos);
        selection.forEach(obj => {
            obj.pos = obj.pos.add(dpos);
        });
        quadtree.update();
    }
    else {
        const pos = toWorld(mousePos());
        const rect = new Rect(pos.sub(4, 4), 8, 8);
        const objects = [];
        quadtree.retrieve(rect, obj => {
            objects.push(obj);
        });
        get("*").forEach(bean => {
            bean.color = WHITE;
        });
        objects.forEach(bean => {
            bean.color = RED;
        });
    }
});

onMouseRelease(() => {
    selection.length = 0;
});

onScroll(delta => {
    setCamScale(getCamScale().scale(delta.y < 0 ? 0.5 : 2.0));
});

onKeyPress("c", () => {
    quadtree.iterPairs(
        (a, b) => {
            if (lastSelected === a || lastSelected === b) {
                a.color = MAGENTA;
                b.color = MAGENTA;
            }
        },
    );
});

onKeyRelease("c", () => {
    get("*").forEach(bean => {
        bean.color = WHITE;
    });
});
