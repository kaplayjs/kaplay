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

const cog1 = createCogPolygon(50, 35, 32);
const cog2 = createCogPolygon(35, 20, 24, 90);

const blueCog = add([
    pos(300, 100),
    polygon(cog1),
    color(BLUE),
    rotate(0),
    area(),
    "cog",
]);

add([
    pos(375, 100),
    polygon(cog2),
    color(RED),
    rotate(0),
    constraint.rotation(blueCog, { strength: 1, scale: -32 / 24 }),
    area(),
    "cog",
]);

let obj;

onClick("cog", (o) => {
    obj = o;
});

onMouseMove((newPos, delta) => {
    if (obj && obj.has("rotate")) {
        const oldPos = newPos.sub(delta);
        const oldAngle = oldPos.sub(obj.pos).angle();
        const newAngle = newPos.sub(obj.pos).angle();
        const deltaAngle = newAngle - oldAngle;
        obj.angle += deltaAngle;
    }
});

onMouseRelease(() => {
    obj = null;
});
