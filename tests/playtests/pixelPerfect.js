// Starts a new game
kaplay({
    scale: 1,
    width: 1920,
    height: 1080,
    crisp: true,
    spriteAtlasPadding: 2,
});

// Load a bean
loadBean();

let zoom = 1;
let rotation = 0;
let zoomVector = vec2(zoom);

onLoad(() => {
    add([
        sprite("bean"),
        pos(25, 50),
        {
            update() {
                this.scale = zoomVector;
                this.angle = rotation;
            },
        },
    ]);

    const data = getSprite("bean").data;

    onDraw(() => {
        drawSprite({
            pos: vec2(300, 50),
            sprite: "bean",
            scale: zoomVector,
            angle: rotation,
        });
        drawPolygon({
            angle: rotation,
            pts: [
                vec2(0, 0),
                vec2(data.width, 0),
                vec2(data.width, data.height),
                vec2(0, data.height),
            ],
            pos: vec2(500, 50),
            scale: zoomVector,
            tex: data.tex,
            uv: [
                vec2(data.frames[0].x, data.frames[0].y),
                vec2(data.frames[0].x + data.frames[0].w, data.frames[0].y),
                vec2(
                    data.frames[0].x + data.frames[0].w,
                    data.frames[0].y + data.frames[0].h,
                ),
                vec2(data.frames[0].x, data.frames[0].y + data.frames[0].h),
            ],
        });

        drawRect({
            height: 2048,
            width: 2048,
            pos: vec2(0, center().y),
            scale: vec2(2),
        });

        drawUVQuad({
            tex: data.tex,
            height: 2048,
            width: 2048,
            pos: vec2(0, center().y),
        });
    });
});

onScroll((d) => {
    zoom += dt() * d.y / 10;
    zoomVector.set(zoom, zoom);
});

onKeyPress("left", () => {
    rotation -= dt() * 10;
});

onKeyPress("right", () => {
    rotation += dt() * 10;
});
