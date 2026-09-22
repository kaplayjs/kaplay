/**
 * @file Crisp smooth scaling
 * @description Test the `crisp: "smooth"` upscaling on a fractional scale,
 * cycled with the space bar (?crisp=true|false|smooth).
 * @difficulty 2
 * @tags rendering
 * @minver 4000.0
 */

// Cycle order: smooth -> true -> false -> smooth
const ORDER = ["smooth", "true", "false"];
const param = new URLSearchParams(location.search).get("crisp");
const crispMode = ORDER.includes(param) ? param : "smooth";

const crisp = crispMode === "true"
    ? true
    : crispMode === "false"
    ? false
    : "smooth";

window.addEventListener("keydown", (e) => {
    if (e.key !== " ") return;
    e.preventDefault();
    const next = ORDER[(ORDER.indexOf(crispMode) + 1) % ORDER.length];
    const url = new URL(location.href);
    url.searchParams.set("crisp", next);
    location.href = url.toString();
});

kaplay({
    width: 960,
    height: 540,
    letterbox: true,
    crisp,
    background: "#444444",
});

loadBean();

onLoad(() => {
    add([sprite("bean"), pos(100, 60), anchor("center"), scale(1)]);
    add([sprite("bean"), pos(100, 150), anchor("center"), scale(2)]);
    add([sprite("bean"), pos(100, 300), anchor("center"), scale(3)]);

    add([
        text(`crisp: ${crispMode}`, { size: 20 }),
        pos(20, 440),
        color(255, 255, 255),
    ]);

    add([
        text("Press space: smooth -> true -> false (page reloads)", {
            size: 12,
        }),
        pos(20, 470),
        color(180, 180, 200),
    ]);
});

onDraw(() => {
    // 1px vertical lines: nearest makes their widths alternate, smooth doesn't
    for (let i = 0; i < 40; i++) {
        drawRect({
            pos: vec2(300 + i * 6, 40),
            width: 1,
            height: 120,
            color: rgb(255, 255, 255),
        });
    }

    // Diagonals: stair-steps show aliasing vs soft edges
    for (let i = 0; i < 12; i++) {
        drawLine({
            p1: vec2(300, 210 + i * 9),
            p2: vec2(540, 200 + i * 9),
            width: 1,
            color: rgb(255, 220, 100),
        });
    }

    // Circle outlines: jaggies vs anti-aliased edges
    for (let i = 0; i < 6; i++) {
        drawCircle({
            pos: vec2(650 + (i % 3) * 110, 110 + Math.floor(i / 3) * 110),
            radius: 32 + i * 4,
            outline: { width: 1, color: rgb(255, 0, 255) },
        });
    }
});
