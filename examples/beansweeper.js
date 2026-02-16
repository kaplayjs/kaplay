kaplay({
    broadPhaseCollisionAlgorithm: "grid",
    font: "happy",
});

loadBean("bean");
loadHappy();
loadSprite("mark", "sprites/mark.png");

const COLORS = [
    Color.fromHex("#6d80fa"),
    Color.fromHex("#cc425e"),
    Color.fromHex("#5ba675"),
    Color.fromHex("#8465ec"),
    Color.fromHex("#a32858"),
    Color.fromHex("#8db7ff"),
    Color.fromHex("#4a3052"),
    Color.fromHex("#7b5480"),
];

const INITIAL_X = 0;
const INITIAL_Y = 0;

let canClick = true;
let w = 10;
let h = 10;
let bombAmount = 20;
let flagsLeft = bombAmount;

const getCursorPos = () => {
    const p = toWorld(mousePos());
    return vec2(
        60 * Math.floor(p.x / 60),
        60 * Math.floor(p.y / 60),
    );
};

scene("first-click", () => {
    setCamPos(w * 60 / 2, h * 60 / 2);
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

        drawRect({
            width: 60,
            height: 60,
            pos: getCursorPos(),
            color: WHITE,
            opacity: wave(0.05, 0.1, time() * 2),
        });
    });
    onUpdate(() => {
        if (isMouseDown()) {
            go("game", toWorld(mousePos()));
        }
    });
});

scene("game", firstClick => {
    setCamPos(w * 60 / 2, h * 60 / 2);
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
    const bombs = chooseMultiple(indices, bombAmount);

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
                const bomb = add([
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
                    {
                        index: i,
                        bomb,
                        get isMarked() {
                            return this.children.length > 0;
                        },
                        get isCovered() {
                            return this.exists();
                        },
                    },
                ]);
            }
            else if (v > 0) {
                const number = add([
                    pos(x * 60 + 30, y * 60 + 30),
                    text(v),
                    scale(),
                    anchor("center"),
                    color(COLORS[v - 1]),
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
                    {
                        index: i,
                        number,
                        get isMarked() {
                            return this.children.length > 0;
                        },
                        get isCovered() {
                            return this.exists();
                        },
                    },
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
                    {
                        index: i,
                        get isMarked() {
                            return this.children.length > 0;
                        },
                        get isCovered() {
                            return this.exists();
                        },
                    },
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
        if (!canClick) return;
        if (handleFlag(obj)) return;
        if (obj.children.length) return;

        shake(10);

        // Shuffles it so the explosions are random rather than in order
        // Makes the clicked bomb the first
        // Gets all the bombs that weren't flagged
        const bombsToExplode = shuffle(
            get("bomb").filter((bomb) => !bomb.isMarked),
        );
        const index = bombsToExplode.indexOf(obj);
        const [clickedBomb] = bombsToExplode.splice(index, 1);
        bombsToExplode.unshift(clickedBomb);

        // uncover the first one and when the next one is uncovered explode the previous one
        bombsToExplode.forEach((o, i) => {
            wait(0.1 * i, () => {
                o.destroy();
                wait(0.1 * i, () => {
                    o.bomb.destroy();
                    const boom = addKaboom(o.pos, { scale: 0.5 });
                    wait(0.3, () => boom.paused = true);
                    shake(0.5);
                });
            });
        });

        // wrong spaces where you marked but there was no bomb
        const wrongMarks = objMap.filter((obj) =>
            obj.isMarked && !obj.is("bomb")
        );
        wrongMarks.forEach((wrong, i) => {
            wrong.children[0].color = RED;
        });
    });

    onClick("number", obj => {
        if (!canClick) return;
        if (handleFlag(obj)) return;
        if (obj.children.length) return;

        obj.destroy();
        tween(
            vec2(1.25),
            vec2(1),
            0.15,
            (p) => obj.number.scale = p,
            easings.easeOutQuad,
        );
    });

    onClick("empty", obj => {
        if (!canClick) return;
        if (handleFlag(obj)) return;
        if (obj.children.length) return;
        const indices = mineGraph.floodFill(
            obj,
            (obj, fromObj) => !obj.is("bomb") && fromObj.is("empty"),
        );
        indices.forEach((o, i) => {
            wait(0.0125 * i, () => {
                o.destroy();
            });
            if (o.number) {
                wait(0.0125 * i, () => {
                    tween(
                        rand(vec2(1.5), vec2(1.8)),
                        vec2(1),
                        0.15,
                        (p) => o.number.scale = p,
                        easings.easeOutQuad,
                    );
                });
            }
        });
    });

    function handleFlag(obj) {
        if (isMouseDown("right") && obj.opacity == 1) {
            if (obj.isMarked) {
                destroy(obj.children[0]);
                flagsLeft++;
            }
            else {
                if (flagsLeft == 0) {
                    debug.log("NO flags left");
                    return true;
                }
                flagsLeft--;

                const flag = obj.add([
                    sprite("mark"),
                    anchor("bot"),
                    scale(),
                    opacity(),
                    pos(0, 27),
                    z(2),
                ]);

                tween(
                    vec2(1, 1.25),
                    vec2(1, 1),
                    0.35,
                    (p) => flag.scale = p,
                    easings.easeOutElastic,
                );

                // if all bombs now flagged
                if (get("bomb").every((bomb) => bomb.isMarked)) {
                    debug.log("YOU WON!!");
                    canClick = false;
                }
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
            if (!obj.isCovered && obj.is("number")) {
                const neighbors = mineGraph.getNeighbors(obj.index);
                const unknowns = neighbors.reduce(
                    (s, i) => s + (mineGraph.objAt(i).isCovered ? 1 : 0),
                    0,
                );
                const marked = neighbors.reduce(
                    (s, i) => s + (mineGraph.objAt(i).isMarked ? 1 : 0),
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
                        o.isCovered && !o.isMarked
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
                        `All remaining covered spaces around ${x}, ${y} are safe, provided the flags are correct.`,
                    );
                    neighbors.map(i => mineGraph.objAt(i)).filter(o =>
                        o.isCovered && !o.isMarked
                    ).forEach(
                        o => o.tween(GREEN, WHITE, 0.25, v => o.color = v),
                    );
                    return;
                }
                else {
                    const unknownIndices = neighbors.filter(i =>
                        mineGraph.objAt(i).isCovered
                    );
                    // For all numbered uncovered neighbors
                    for (n of neighbors) {
                        o = mineGraph.objAt(n);
                        if (o.is("number") && !o.isCovered) {
                            const neighborUnknownIndices = mineGraph
                                .getNeighbors(n).filter(i =>
                                    mineGraph.objAt(i).isCovered
                                );
                            const diff = new Set(unknownIndices).difference(
                                new Set(neighborUnknownIndices),
                            );
                            const c = diff.size;
                            // If there are more bombs than places
                            if (c > 0 && c < map[i]) {
                                // If there can't be more bombs outside the intersection
                                if ((map[i] - c) == map[n]) {
                                    const bombs = [...diff].map(i =>
                                        mineGraph.objAt(i)
                                    ).filter(o => o.isCovered && !o.isMarked);
                                    if (bombs.length > 0) {
                                        const x = i % w;
                                        const y = Math.floor(i / w);
                                        const xx = n % w;
                                        const yy = Math.floor(n / w);
                                        debug.log(
                                            `All remaining covered spaces around ${x}, ${y} are bombs due to ${xx}, ${yy} having at most ${
                                                map[n]
                                            } bombs.`,
                                        );
                                        debug.log(
                                            unknownIndices,
                                            neighborUnknownIndices,
                                            c,
                                            [...diff],
                                        );
                                        // All remaining in c are bombs
                                        bombs.forEach(
                                            o => o.tween(
                                                RED,
                                                WHITE,
                                                0.25,
                                                v => o.color = v,
                                            ),
                                        );
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        // TODO: Add deductive and inductive reasoning
        debug.log(`Not enough information.`);
    });

    // todo: make it so it only appears on hovereable spaces (may need initial pos)
    add([z(1)]).onDraw(() => {
        // if empty hovering and covered draw
        drawRect({
            width: 60,
            height: 60,
            pos: getCursorPos(),
            color: WHITE,
            opacity: wave(0.05, 0.1, time() * 2),
        });
    });
});

go("first-click");
