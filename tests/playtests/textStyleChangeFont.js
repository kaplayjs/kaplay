/**
 * @file Style change font
 * @description Test how text handles changing font on styles.
 * @difficulty 3
 * @tags basics
 * @minver 3001.0
 */

kaplay({ background: "#000000", crisp: true });
loadFont("Romantique", "/fonts/Romantique.ttf", { filter: "nearest" });

const x = add([
    text(
        "everything here is arial except the e's are romantique and red and stretched"
            .replaceAll("e", "[e]e[/e]"),
        {
            transform: {
                font: "Arial",
                stretchInPlace: false,
            },
            styles: {
                e: (i, ch) => {
                    const w = wave(0.5, 2, time() * 3 + i);
                    return {
                        font: "Romantique",
                        color: RED,
                        scale: vec2(w, 1),
                        stretchInPlace: w > 1,
                    };
                },
            },
            width: width(),
            size: 75,
        },
    ),
]);

onUpdate(() => x.width = width());
