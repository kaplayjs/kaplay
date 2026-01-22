kaplay();
loadSprite("giga", "sprites/gigagantrum.png");

const bean = add([
    sprite("giga"), // add sprite
    pos(center()), // set position, center of the screen
    scale(2), // set scale
    anchor("center"), // set anchor, pivot
    rotate(0), // set rotation
    area(),
]);

onLoad(() => {
    bean.area.shape = getSpriteOutline("giga", 0, true, 1);
    bean.area.shape.pts = buildConvexHull(bean.area.shape.pts);
    bean.area.offset = vec2(-bean.width / 2, -bean.height / 2);
});

debug.inspect = true;
