/**
 * @file Blend modes
 * @description How to use blend mode with blend() comp
 * @difficulty 1
 * @tags draw, visual, effects
 * @minver 4000.0
 * @category concepts
 * @test
 */

// Adding game objects to screen

// Start a KAPLAY game
kaplay();

// Load a sprite asset from "sprites/bean.png", with the name "bean"
loadSprite("bean", "/sprites/bean.png");
loadSprite("ghosty", "/sprites/ghosty.png");

onDraw(() => {
    drawSprite({
        sprite: "bean",
        pos: vec2(100, 200),
        blend: BlendMode.Normal,
    });
    drawSprite({
        sprite: "bean",
        pos: vec2(150, 200),
        blend: BlendMode.Add,
    });
    drawSprite({
        sprite: "bean",
        pos: vec2(200, 200),
        blend: BlendMode.Multiply,
    });
    drawSprite({
        sprite: "bean",
        pos: vec2(250, 200),
        blend: BlendMode.Screen,
    });
    drawSprite({
        sprite: "bean",
        pos: vec2(300, 200),
        blend: BlendMode.Overlay,
    });

    drawCircle({
        radius: 25,
        pos: vec2(125, 300),
        color: rgb(128, 128, 128),
        blend: BlendMode.Normal,
    });
    drawCircle({
        radius: 25,
        pos: vec2(175, 300),
        color: rgb(128, 128, 128),
        blend: BlendMode.Add,
    });
    drawCircle({
        radius: 25,
        pos: vec2(225, 300),
        color: rgb(128, 128, 128),
        blend: BlendMode.Multiply,
    });
    drawCircle({
        radius: 25,
        pos: vec2(275, 300),
        color: rgb(128, 128, 128),
        blend: BlendMode.Screen,
    });
    drawCircle({
        radius: 25,
        pos: vec2(325, 300),
        color: rgb(128, 128, 128),
        blend: BlendMode.Overlay,
    });
});

add([
    sprite("bean"),
    pos(100, 400),
    blend(BlendMode.Normal),
]);
add([
    sprite("bean"),
    pos(150, 400),
    blend(BlendMode.Add),
]);
add([
    sprite("bean"),
    pos(200, 400),
    blend(BlendMode.Multiply),
]);
add([
    sprite("bean"),
    pos(250, 400),
    blend(BlendMode.Screen),
]);
add([
    sprite("bean"),
    pos(300, 400),
    blend(BlendMode.Overlay),
]);
