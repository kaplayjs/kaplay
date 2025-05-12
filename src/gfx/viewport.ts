import { Vec2 } from "../math/Vec2";
import { _k } from "../shared";

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

export function updateViewport() {
    const pixelDensity = _k.gfx.pixelDensity;
    const desiredWidth = _k.globalOpt.width;
    const desiredHeight = _k.globalOpt.height;
    const drawingBufferWidth = _k.gfx.gl.drawingBufferWidth;
    const drawingBufferHeight = _k.gfx.gl.drawingBufferHeight;
    const canvasWidth = drawingBufferWidth / pixelDensity;
    const canvasHeight = drawingBufferHeight / pixelDensity;

    // console.log("[vwp] buffer size", drawingBufferWidth, drawingBufferHeight);
    // console.log("[vwp] desired size", desiredWidth, desiredHeight);
    // console.log("[vwp] canvas size", canvasWidth, canvasHeight);

    let x = 0;
    let y = 0;
    let viewportWidth = canvasWidth;
    let viewportHeight = canvasHeight;

    if (_k.globalOpt.letterbox) {
        if (!desiredWidth || !desiredHeight) {
            throw new Error(
                "Letterboxing requires width and height defined.",
            );
        }

        const canvasAspectRatio = canvasWidth / canvasHeight;
        const disairedAspectRatio = desiredWidth / desiredHeight;

        // In letterbox, we scale one width/height for keep aspect ratio,
        // depending of what side is larger
        if (canvasAspectRatio > disairedAspectRatio) {
            const scaledWidth = canvasHeight * disairedAspectRatio;

            x = (canvasWidth - scaledWidth) / 2;
            viewportWidth = scaledWidth;
        }
        else {
            const scaledHeight = canvasWidth / disairedAspectRatio;

            viewportHeight = scaledHeight;
            y = (canvasHeight - scaledHeight) / 2;
        }
    }

    _k.gfx.viewport = {
        x: x,
        y: y,
        width: viewportWidth,
        height: viewportHeight,
        scale: (_k.gfx.viewport.width + _k.gfx.viewport.height)
            / (_k.gfx.width + _k.gfx.height),
    };

    // console.log("[vwp] viewport is", _k.gfx.viewport);
}

export function viewportToCanvas(pt: Vec2) {
    return new Vec2(
        pt.x * _k.gfx.viewport.width / _k.gfx.width,
        pt.y * _k.gfx.viewport.height / _k.gfx.height,
    );
}

export function canvasToViewport(pt: Vec2) {
    return new Vec2(
        (pt.x - _k.gfx.viewport.x) * _k.gfx.width / _k.gfx.viewport.width,
        (pt.y - _k.gfx.viewport.y) * _k.gfx.height / _k.gfx.viewport.height,
    );
}
