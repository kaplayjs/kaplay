// Starts a new game
kaplay();

// Load a bean
loadBean();

const pwb = piecewiseBezier([
    vec2(50, 100),
    vec2(100, 50),
    vec2(150, 150),
    vec2(200, 100),
    vec2(250, 50),
    vec2(300, 150),
    vec2(350, 100),
]);

const pwc = piecewiseCatmullRom([
    vec2(50, 100),
    vec2(100, 50),
    vec2(150, 150),
    vec2(200, 100),
    vec2(250, 50),
    vec2(300, 150),
    vec2(350, 100),
]);

onDraw(() => {
    drawCurve(pwb, { join: "miter", width: 2, segments: 40 });
    drawCurve(pwc, {
        join: "miter",
        width: 2,
        segments: 40,
        pos: vec2(0, 150),
    });
});
