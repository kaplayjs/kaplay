kaplay();

const hex = createRegularPolygon(50, 6);

add([
    pos(100, 100),
    polygon(hex),
]);

const star = createStarPolygon(50, 20, 16);

add([
    pos(200, 100),
    polygon(star),
    color(YELLOW),
]);
