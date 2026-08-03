/**
 * @file Text & Scale
 * @description Test object dimensions that uses text & scale comps
 * @minver 3001.0
 */

kaplay({ background: [0, 0, 0], font: "happy", logMax: 1 });

loadHappy();

debug.inspect = true;

let w = 0;
let h = 0;

onLoad(async () => {
    const txt = add([
        text(
            `
Object width/height should stay
the same & area should
get bigger when
scaled up!`.trim(),
            {
                align: "center",
                size: 18,
                lineSpacing: 6,
            },
        ),
        pos(center()),
        anchor("center"),
        scale(1),
        area(),
    ]);

    w = txt.width;
    h = txt.height;

    wait(1, () => txt.scale = vec2(2));

    onUpdate(() =>
        debug.log(`
Before: ${w}x${h} | After: ${txt.width}x${txt.height} | Scale: ${txt.scale.x}
└─ Before & After should stay the same ─┘`)
    );
});
