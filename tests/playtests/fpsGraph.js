kaplay();

const c = _k.app.state.fpsCounter;
c.resize(128);
onDraw(() => {
    const p = 3, h = 20;
    const t = formatText({
        text: c.calculate().toFixed(0),
        anchor: "right",
        pos: vec2(width() - 2 * p, p + h / 2),
        size: 16,
    });
    const w = c.maxSamples - 1 + 2 * p + t.width;
    drawRect({
        pos: vec2(width() - w - p, p),
        width: w,
        height: h,
        color: BLACK,
    });
    drawFormattedText(t);
    for (var i = 0; i < c.maxSamples; i++) {
        const f = 1 / c.ago(i);
        const x = width() - p * 3 - t.width - i;
        drawLine({
            p1: vec2(x, p + h),
            p2: vec2(x, p + h - map(f, 0, 120, 0, h)),
            color: f < 15 ? RED : f < 30 ? YELLOW : GREEN,
            width: 1,
        });
    }
});
