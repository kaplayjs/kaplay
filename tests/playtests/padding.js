/**
 * @file Test spritesheet padding
 * @description Checks that sprites are not too close to edge of spritesheet and cause wrapping
 */
kaplay({ background: "#f2ae99", spriteAtlasPadding: 8 });

// Sprite frames API changed in v4000.0.0-alpha.27
const versionChanged = 40000027;
const version = +VERSION.split(".").splice(0, 4).join("").replace(/\D/g, "");
const isNewVersion = version >= versionChanged;

loadBean();

onLoad(() => {
    const spriteData = getSprite("bean").data;
    const frame = spriteData.frames[0];
    const tex = isNewVersion ? frame.tex : spriteData.tex;
    const q = isNewVersion ? frame.q : frame;

    // offset to make uv go out of bounds
    // to test the edge clamp/wrap mode
    const o = 0.011;
    const u0 = -o + q.x;
    const v0 = -o + q.y;
    const u1 = -o + q.x + q.w;
    const v1 = -o + q.y + q.h * (spriteData.width / spriteData.height);

    onDraw(() => {
        // draw entire spritemap
        drawUVQuad({
            width: tex.width,
            height: tex.height,
            tex,
            quad: { x: 0, y: 0, w: 1, h: 1 },
        });

        // draw border
        drawRect({
            width: 232,
            height: 232,
            anchor: "center",
            pos: center(),
            color: rgb("#8db7ff"),
            outline: { width: 32, color: rgb("#a6555f"), join: "bevel" },
        });

        // draw sliced square of bean to test edge padding
        drawPolygon({
            pts: [
                center().sub(100),
                center().add(100, -100),
                center().add(100),
                center().sub(100, -100),
            ],
            tex,
            uv: [
                vec2(u0, v0),
                vec2(u1, v0),
                vec2(u1, v1),
                vec2(u0, v1),
            ],
        });
    });
});
