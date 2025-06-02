kaplay({
    letterbox: true,
    width: 640,
    height: 360,
});

// load assets
loadSprite("bean", "/sprites/bean.png");

onDraw(() => {
    drawSprite({
        pos: vec2(40, 10),
        color: RED,
        sprite: "bean",
        scale: vec2(1),
    });
});

add([pos(vec2(10, 10)), sprite("bean")]);
