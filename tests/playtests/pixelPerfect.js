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

    const beanData = getSprite("bean").data;
    const beanFrame = beanData.frames[0];

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
                vec2(beanData.width, 0),
                vec2(beanData.width, beanData.height),
                vec2(0, beanData.height),
            ],
            pos: vec2(500, 50),
            scale: zoomVector,
            tex: beanFrame.tex,
            uv: [
                vec2(beanFrame.q.x, beanFrame.q.y),
                vec2(beanFrame.q.x + beanFrame.q.w, beanFrame.q.y),
                vec2(
                    beanFrame.q.x + beanFrame.q.w,
                    beanFrame.q.y + beanFrame.q.h,
                ),
                vec2(beanFrame.q.x, beanFrame.q.y + beanFrame.q.h),
            ],
        });

        drawRect({
            height: 2048,
            width: 2048,
            pos: vec2(0, center().y),
            scale: vec2(2),
        });

        drawUVQuad({
            tex: beanFrame.tex,
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

onKeyDown("left", () => {
    rotation -= dt() * 10;
});

onKeyDown("right", () => {
    rotation += dt() * 10;
});
