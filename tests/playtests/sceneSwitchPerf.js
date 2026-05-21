kaplay({
    background: "#4a3052",
    font: "happy-o",
    logMax: 1,
    broadPhaseCollisionAlgorithm: "sap",
    narrowPhaseCollisionAlgorithm: "gjk",
});

loadBitmapFont("happy-o", "/crew/happy-o.png", 36, 45);
loadBean();

// Try to find the highest number of colliding objects your PC can handles at
// your stable monitor refresh rate for the best FPS drop observation
const OBJ_COUNT = 320;

const cols = Math.ceil(Math.sqrt(OBJ_COUNT));
const rows = Math.ceil(OBJ_COUNT / cols);

let switchCount = 0;

scene("game", async () => {
    const { width: w, height: h } = getSprite("bean").data;

    let i = 0;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (i++ >= OBJ_COUNT) break;

            add([
                sprite("bean"),
                pos(
                    center()
                        .sub((cols * w) / 2, (rows * h) / 2)
                        .add(x * w, y * h),
                ),
                area({ isSensor: true }),
            ]);
        }
    }

    debug.log(
        "\n" + [
            `Objects: ${get("*").length}`,
            `Scene: ${++switchCount}`,
            "Switch in..",
        ].join("\n"),
    );

    let countDown = 7;

    loop(1, () => {
        if (!--countDown) go("game");
        if (countDown < 4) debug.log(countDown);
    }, countDown);

    add([{
        draw() {
            drawText({
                text: debug.fps().toFixed(),
                size: 120,
                pos: center(),
                anchor: "center",
            });
        },
    }]);
});

onLoad(() => go("game"));
