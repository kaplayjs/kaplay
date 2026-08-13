// To test touch, enable touch simulation in dev tools responsive design mode
// then press and hold mouse down and move around
// ensure that red dot follows correctly in fullscreen (F)

kaplay({
    width: 800,
    height: 600,
    logMax: 1,
    logTime: Infinity,
});

const redDot = add([
    anchor("center"),
    circle(3),
    color(RED),
    pos(),
    area(),
]);

onMouseMove(pos => {
    redDot.pos = toWorld(pos);
});

onKeyPress("f", () => {
    setFullscreen(!isFullscreen());
});

onDraw(() => {
    drawRect({
        width: width(),
        height: height(),
        fill: false,
        outline: {
            width: 4,
        },
    });
});

const logInfo = () =>
    debug.log([
        ``,
        `Setup:    ${_k.globalOpt.width ?? "100%"}x${
            _k.globalOpt.height ?? "100%"
        } @${_k.globalOpt.pixelDensity ?? 1} x${_k.globalOpt.scale ?? 1}`,
        `Canvas:   ${_k.canvas.offsetWidth}x${_k.canvas.offsetHeight}`,
        `Buffer:   ${
            `${_k.gfx.gl.drawingBufferWidth}x${_k.gfx.gl.drawingBufferHeight}`
                .padEnd(9, " ")
        } (Size@Density${
            _k.globalOpt.lockResolution
                || (_k.globalOpt.width && !_k.globalOpt.letterbox)
                ? "*Scale"
                : ""
        })`,
        `Gfx:      ${
            `${Math.round(_k.gfx.width)}x${Math.round(_k.gfx.height)}`
                .padEnd(9, " ")
        } (Buffer/Density/Scale)`,
        `Viewport: ${Math.round(_k.gfx.screenViewport.width)}x${
            Math.round(_k.gfx.screenViewport.height)
        } gfx@${Math.round(_k.gfx.screenViewport.scale * 100) / 100} ${
            Math.round(_k.gfx.screenViewport.x)
        }x ${Math.round(_k.gfx.screenViewport.y)}y`,
    ].join("\n"));

logInfo();
onResize(logInfo);
