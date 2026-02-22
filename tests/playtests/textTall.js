/**
 * @file Tall fonts test
 * @description Test the rendering of tall fonts to ensure they're not cropped.
 * @difficulty 99
 * @tags basics
 * @minver 4000.0
 */

kaplay({ background: "#000000", crisp: true });
const nabla = loadFont(
    "Nabla",
    "/fonts/Nabla-Regular-VariableFont_EDPT,EHLT.ttf",
);
const anton = loadFont("Anton", "/fonts/Anton-Regular.ttf");

const obj = add([
    pos(10, 10),
    text(
        "This is a tall font\nThat shouldn't \nget cropped by KAPLAY",
        {
            font: "Nabla",
            width: width(),
            size: 48,
            color: rgb(255, 255, 255),
        },
    ),
]);

add([
    pos(10, 250),
    text(
        "This is another tall font\nThat also \nshouldn't get cropped",
        {
            font: "Anton",
            width: width(),
            size: 32,
            color: rgb(255, 255, 0),
        },
    ),
]);
