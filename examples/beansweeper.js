kaplay({
    broadPhaseCollisionAlgorithm: "grid",
});

loadBean("bean");
loadSprite("mark", "sprites/mark.png");

const w = 10;
const h = 10;
const map = new Array(w * h).fill(0);
const bombs = chooseMultiple(map.map((v, i) => i), 20);

bombs.forEach(i => map[i] = 9);

class GridGraph {
    constructor(map) {
        this.map = map;
    }

    getNeighbors(i) {
        const n = [];
        const x = i % w;
        const l = x > 0;
        const r = x < w - 1;
        let v = 0;
        if (i >= w) { // First row is 0 to w - 1
            if (l) n.push(i - w - 1);
            n.push(i - w);
            if (r) n.push(i - w + 1);
        }
        if (l) n.push(i - 1);
        if (r) n.push(i + 1);
        if (i < w * (h - 1)) { // Last row is w * (h - 1) to w * (h - 1) + (w - 1)
            if (l) n.push(i + w - 1);
            n.push(i + w);
            if (r) n.push(i + w + 1);
        }
        return n;
    }
}

const gridGraph = new GridGraph(map);

for (let i = 0; i < w * h; i++) {
    if (map[i] == 9) continue;
    map[i] = gridGraph.getNeighbors(i).reduce(
        (sum, index) => sum + (map[index] == 9 ? 1 : 0),
        0,
    );
}

add([rect(w * 60, h * 60), color(BLACK)]);

const objMap = new Array(w * h);

let i = 0;
for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
        const v = map[i];
        if (v == 9) {
            add([
                pos(x * 60 + 30, y * 60 + 30),
                sprite("bean"),
                anchor("center"),
            ]);
            objMap[i] = add([
                pos(x * 60 + 30, y * 60 + 30),
                rect(55, 55),
                color(WHITE),
                anchor("center"),
                area(),
                opacity(1),
                "bomb",
                { index: i },
            ]);
        }
        else if (v > 0) {
            add([pos(x * 60 + 30, y * 60 + 30), text(v), anchor("center")]);
            objMap[i] = add([
                pos(x * 60 + 30, y * 60 + 30),
                rect(55, 55),
                color(WHITE),
                anchor("center"),
                area(),
                opacity(1),
                "number",
                { index: i },
            ]);
        }
        else {
            objMap[i] = add([
                pos(x * 60 + 30, y * 60 + 30),
                rect(55, 55),
                color(WHITE),
                anchor("center"),
                area(),
                opacity(1),
                "empty",
                { index: i },
            ]);
        }
        i++;
    }
}

class MineGraph extends GridGraph {
    constructor(map) {
        super(map);
    }

    indexOf(obj) {
        return obj.index;
    }
    objAt(index) {
        return this.map[index];
    }

    floodFill(obj, predicate) {
        return floodFill(this, obj.index, index => predicate(this.objAt(index)))
            .map(index => this.objAt(index));
    }
}

const mineGraph = new MineGraph(objMap);

onClick("bomb", obj => {
    if (handleFlag(obj)) return;
    if (obj.children.length) return;
    get("bomb").forEach(o => o.fadeOut());
    debug.log("You lost");
});

onClick("number", obj => {
    if (handleFlag(obj)) return;
    if (obj.children.length) return;
    obj.fadeOut();
});

onClick("empty", obj => {
    if (handleFlag(obj)) return;
    if (obj.children.length) return;
    const indices = mineGraph.floodFill(obj, obj => !obj.is("bomb"));
    indices.forEach(o => o.fadeOut());
});

function handleFlag(obj) {
    if (isMouseDown("right") && obj.opacity == 1) {
        if (obj.children.length) {
            destroy(obj.children[0]);
        }
        else {
            obj.add([sprite("mark"), anchor("center")]);
        }
        return true;
    }
    return false;
}
