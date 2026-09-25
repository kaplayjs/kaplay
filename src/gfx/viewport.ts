import { Vec2 } from "../math/Vec2";
import { _k } from "../shared";

/*
The viewport is where the game is rendered. There's various concepts for
rendering the viewport

- Canvas size: The CSS size of the canvas element

- Buffer size: The quantity of pixels that are rendered by WebGL. It varies
depending on the canvas size and pixel density

- Desired size: The size the user defines to keep an aspect ratio

- Viewport (screen): The final displayed size, sub-rect of the Canvas CSS size
- Viewport (buffer): The final rendered size, sub-rect of the Canvas buffer
size/density

Screen viewport and buffer viewport match if letterbox enabled with no resolution
lock or no desired (fixed) size set.

We update the canvas before we run this, you should check appEvents.ts
onResize method.
*/

export function updateViewport() {
    const pixelDensity = _k.gfx.pixelDensity;
    const desiredWidth = _k.globalOpt.width;
    const desiredHeight = _k.globalOpt.height;
    const canvasWidth = _k.canvas.offsetWidth;
    const canvasHeight = _k.canvas.offsetHeight;
    const letterbox = _k.globalOpt.letterbox;
    const lockResolution = _k.globalOpt.lockResolution;
    const fixedSize = desiredWidth && desiredHeight;

    // console.log("[vwp] buffer size", _k.gfx.gl.drawingBufferWidth, _k.gfx.gl.drawingBufferHeight);
    // console.log("[vwp] desired size", desiredWidth, desiredHeight);
    // console.log("[vwp] canvas size", canvasWidth, canvasHeight);

    let x = 0;
    let y = 0;
    let width = canvasWidth;
    let height = canvasHeight;

    if (!fixedSize) {
        if (letterbox || lockResolution) {
            throw new Error(
                `${
                    letterbox
                        ? "Letterboxing"
                        : "Resolution locking"
                } requires width and height defined.`,
            );
        }
    }
    else {
        const canvasAspectRatio = canvasWidth / canvasHeight;
        const desiredAspectRatio = desiredWidth / desiredHeight;

        // We scale either width or height to keep aspect ratio, depending
        // on what side is larger, creating a letterbox
        if (canvasAspectRatio > desiredAspectRatio) {
            width = canvasHeight * desiredAspectRatio;
            x = (canvasWidth - width) / 2;
        }
        else {
            height = canvasWidth / desiredAspectRatio;
            y = (canvasHeight - height) / 2;
        }
    }

    // Screen viewport
    _k.gfx.screenViewport = {
        x,
        y,
        width,
        height,
        scale: (width + height)
            / (_k.gfx.width + _k.gfx.height),
    };

    // Buffer viewport
    if (!fixedSize || (letterbox && !lockResolution)) {
        _k.gfx.viewport = _k.gfx.screenViewport;
    }
    else {
        _k.gfx.viewport.width = _k.gfx.gl.drawingBufferWidth / pixelDensity;
        _k.gfx.viewport.height = _k.gfx.gl.drawingBufferHeight / pixelDensity;
        _k.gfx.viewport.scale = (_k.gfx.viewport.width + _k.gfx.viewport.height)
            / (_k.gfx.width + _k.gfx.height);
    }

    // console.log("[vwp] buffer viewport is", _k.gfx.viewport);
    // console.log("[vwp] screen viewport is", _k.gfx.screenViewport);
}

export function viewportToCanvas(x: number, y: number) {
    return new Vec2(
        x * _k.gfx.screenViewport.width / _k.gfx.width
            + _k.gfx.screenViewport.x,
        y * _k.gfx.screenViewport.height / _k.gfx.height
            + _k.gfx.screenViewport.y,
    );
}

export function viewportToCanvasLocal(x: number, y: number) {
    return new Vec2(
        x * _k.gfx.viewport.width / _k.gfx.width,
        y * _k.gfx.viewport.height / _k.gfx.height,
    );
}

export function canvasToViewport(x: number, y: number) {
    return new Vec2(
        (x - _k.gfx.screenViewport.x) * _k.gfx.width
            / _k.gfx.screenViewport.width,
        (y - _k.gfx.screenViewport.y) * _k.gfx.height
            / _k.gfx.screenViewport.height,
    );
}
