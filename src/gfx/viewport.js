"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateViewport = updateViewport;
exports.viewportToCanvas = viewportToCanvas;
exports.canvasToViewport = canvasToViewport;
var Vec2_1 = require("../math/Vec2");
var shared_1 = require("../shared");
/*
The viewport is where the game is rendered. There's various concepts for
rendering the viewport

- Canvas size: The CSS size of the canvas element

- Buffer size: The quantity of pixels that are rendered by WebGL. It varies
depending of the

- Desired Size: The desired size is the size the user defines for keeping an
aspect ratio

- Viewport size: The final rendered size

We update the canvas before run this, you should check initEvents.ts
in onResize method.
*/
function updateViewport() {
    var pixelDensity = shared_1._k.gfx.pixelDensity;
    var desiredWidth = shared_1._k.globalOpt.width;
    var desiredHeight = shared_1._k.globalOpt.height;
    var drawingBufferWidth = shared_1._k.gfx.gl.drawingBufferWidth;
    var drawingBufferHeight = shared_1._k.gfx.gl.drawingBufferHeight;
    var canvasWidth = drawingBufferWidth / pixelDensity;
    var canvasHeight = drawingBufferHeight / pixelDensity;
    // console.log("[vwp] buffer size", drawingBufferWidth, drawingBufferHeight);
    // console.log("[vwp] desired size", desiredWidth, desiredHeight);
    // console.log("[vwp] canvas size", canvasWidth, canvasHeight);
    var x = 0;
    var y = 0;
    var viewportWidth = canvasWidth;
    var viewportHeight = canvasHeight;
    if (shared_1._k.globalOpt.letterbox) {
        if (!desiredWidth || !desiredHeight) {
            throw new Error("Letterboxing requires width and height defined.");
        }
        var canvasAspectRatio = canvasWidth / canvasHeight;
        var disairedAspectRatio = desiredWidth / desiredHeight;
        // In letterbox, we scale one width/height for keep aspect ratio,
        // depending of what side is larger
        if (canvasAspectRatio > disairedAspectRatio) {
            var scaledWidth = canvasHeight * disairedAspectRatio;
            x = (canvasWidth - scaledWidth) / 2;
            viewportWidth = scaledWidth;
        }
        else {
            var scaledHeight = canvasWidth / disairedAspectRatio;
            viewportHeight = scaledHeight;
            y = (canvasHeight - scaledHeight) / 2;
        }
    }
    shared_1._k.gfx.viewport = {
        x: x,
        y: y,
        width: viewportWidth,
        height: viewportHeight,
        scale: (shared_1._k.gfx.viewport.width + shared_1._k.gfx.viewport.height)
            / (shared_1._k.gfx.width + shared_1._k.gfx.height),
    };
    // console.log("[vwp] viewport is", _k.gfx.viewport);
}
function viewportToCanvas(pt) {
    return new Vec2_1.Vec2(pt.x * shared_1._k.gfx.viewport.width / shared_1._k.gfx.width, pt.y * shared_1._k.gfx.viewport.height / shared_1._k.gfx.height);
}
function canvasToViewport(pt) {
    return new Vec2_1.Vec2((pt.x - shared_1._k.gfx.viewport.x) * shared_1._k.gfx.width / shared_1._k.gfx.viewport.width, (pt.y - shared_1._k.gfx.viewport.y) * shared_1._k.gfx.height / shared_1._k.gfx.viewport.height);
}
