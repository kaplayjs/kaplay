/**
 * @file CSS Colors
 * @description Use CSS-defined colors colors in KAPLAY.
 * @difficulty 3
 * @tags basics
 * @minver 3001.0
 */

kaplay();
loadHappy();

add([
    rect(512, 512, {
        radius: [0, 96, 96, 96],
    }),
    color("rebeccapurple"),
    pos(40, 40),
]);

add([
    text("css", { size: 192, font: "happy" }),
    pos(90, 310),
]);
