kaplay({
    broadPhaseCollisionAlgorithm: "grid",
    font: "happy",
});

loadBean("bean");
loadHappy();
loadSprite("mark", "sprites/mark.png");

const colors = [
    Color.fromHex("#6d80fa"),
    Color.fromHex("#cc425e"),
    Color.fromHex("#5ba675"),
    Color.fromHex("#8465ec"),
    Color.fromHex("#a32858"),
    Color.fromHex("#8db7ff"),
    Color.fromHex("#4a3052"),
    Color.fromHex("#7b5480"),
];

const w = 10;
const h = 10;

scene("first-click", () => {
    onDraw(() => {
        drawRect({ width: w * 60, height: h * 60, color: BLACK });
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                drawRect({
                    pos: vec2(x * 60 + 2.5, y * 60 + 2.5),
                    width: 55,
                    height: 55,
                    color: WHITE,
                });
            }
        }
    });
    onUpdate(() => {
        if (isMouseDown()) {
            go("game", mousePos());
        }
    });
});

scene("game", firstClick => {
    const x = Math.floor(firstClick.x / 60);
    const firstIndex = x + Math.floor(firstClick.y / 60) * w;

    const map = new Array(w * h).fill(0);
    const forbidden = new Set([firstIndex]);
    const l = x > 0;
    const r = x < w - 1;
    if (firstIndex >= w) {
        if (l) forbidden.add(firstIndex - w - 1);
        forbidden.add(firstIndex - w);
        if (r) forbidden.add(firstIndex - w + 1);
    }
    if (l) forbidden.add(firstIndex - 1);
    if (r) forbidden.add(firstIndex + 1);
    if (firstIndex < w * (h - 1)) {
        if (l) forbidden.add(firstIndex + w - 1);
        forbidden.add(firstIndex + w);
        if (r) forbidden.add(firstIndex + w + 1);
    }
    const indices = map.map((v, i) => i).filter(v => !forbidden.has(v));
    const bombs = chooseMultiple(indices, 20);

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
                    timer(),
                    "bomb",
                    { index: i },
                ]);
            }
            else if (v > 0) {
                add([
                    pos(x * 60 + 30, y * 60 + 30),
                    text(v),
                    anchor("center"),
                    color(colors[v - 1]),
                ]);

                objMap[i] = add([
                    pos(x * 60 + 30, y * 60 + 30),
                    rect(55, 55),
                    color(WHITE),
                    anchor("center"),
                    area(),
                    opacity(1),
                    timer(),
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
                    timer(),
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
            return floodFill(
                this,
                obj.index,
                (index, from) => predicate(this.objAt(index), this.objAt(from)),
            )
                .map(index => this.objAt(index));
        }
    }

    const mineGraph = new MineGraph(objMap);

    onClick("bomb", obj => {
        if (handleFlag(obj)) return;
        if (obj.children.length) return;

        shake(10);

        // Shuffles it so the explosions are random rather than in order
        // Makes the clicked bomb the first
        const bombs = shuffle(get("bomb"));
        const index = bombs.indexOf(obj);
        const [clickedBomb] = bombs.splice(index, 1);
        bombs.unshift(clickedBomb);

        bombs.forEach((o, i) => {
            wait(0.1 * i, () => {
                shake(0.5);
                o.fadeOut();
                addKaboom(o.pos, { scale: 0.5 });
            });
        });
    });

    onClick("number", obj => {
        if (handleFlag(obj)) return;
        if (obj.children.length) return;
        obj.fadeOut(0.1);
    });

    onClick("empty", obj => {
        if (handleFlag(obj)) return;
        if (obj.children.length) return;
        const indices = mineGraph.floodFill(
            obj,
            (obj, fromObj) => !obj.is("bomb") && fromObj.is("empty"),
        );
        indices.forEach((o, i) => {
            o.fadeOut(0.025 * i);
        });
    });

    function handleFlag(obj) {
        if (isMouseDown("right") && obj.opacity == 1) {
            if (obj.children.length) {
                destroy(obj.children[0]);
            }
            else {
                const flag = obj.add([
                    sprite("mark"),
                    anchor("bot"),
                    scale(),
                    opacity(),
                    pos(0, 27),
                ]);

                tween(
                    vec2(1, 1.25),
                    vec2(1, 1),
                    0.35,
                    (p) => flag.scale = p,
                    easings.easeOutElastic,
                );
            }
            return true;
        }
        return false;
    }

    mineGraph.objAt(firstIndex).trigger("click");

    // Hints
    onKeyPress("h", () => {
        for (let i = 0; i < w * h; i++) {
            const obj = mineGraph.objAt(i);
            // If uncovered number
            if (obj.opacity == 0 && obj.is("number")) {
                const neighbors = mineGraph.getNeighbors(obj.index);
                const unknowns = neighbors.reduce(
                    (s, i) => s + (mineGraph.objAt(i).opacity == 1 ? 1 : 0),
                    0,
                );
                const marked = neighbors.reduce(
                    (s, i) =>
                        s + (mineGraph.objAt(i).children.length > 0 ? 1 : 0),
                    0,
                );
                // If there are an equal amount of bombs as unknowns, it is safe to mark all remaining unknowns as bomb
                if (map[i] >= unknowns && marked < unknowns) {
                    const x = i % w;
                    const y = Math.floor(i / w);
                    debug.log(
                        `All remaining covered spaces around ${x}, ${y} are bombs.`,
                    );
                    neighbors.map(i => mineGraph.objAt(i)).filter(o =>
                        o.opacity == 1 && o.children.length == 0
                    ).forEach(
                        o => o.tween(RED, WHITE, 0.25, v => o.color = v),
                    );
                    return;
                }
                // If enough bombs are marked, the remaining unknowns are safe
                /* TODO: we might need to check if the marks make sense, by getting the neighbors and check if at least
                         one neighbor reports enough information for it to be marked as being a bomb */
                else if (map[i] <= marked && marked < unknowns) {
                    const x = i % w;
                    const y = Math.floor(i / w);
                    debug.log(
                        `All remaining covered spaces around ${x}, ${y} are safe.`,
                    );
                    neighbors.map(i => mineGraph.objAt(i)).filter(o =>
                        o.opacity == 1 && o.children.length == 0
                    ).forEach(
                        o => o.tween(GREEN, WHITE, 0.25, v => o.color = v),
                    );
                    return;
                }
            }
        }
        // TODO: Add deductive and inductive reasoning
        debug.log(`Not enough information.`);
    });
});

go("first-click");
