import { _k } from "../kaplay";

/*
The viewport is where the game is rendered. There's various concepts for
rendering the viewport

- Canvas size: The CSS size of the canvas element

- Buffer size: The quantity of pixels that are rendered by WebGL. It varies
depending of the

- Desired Size: The desired size is the size the user defines for keeping an
aspect ratio

- Viewport size: The final rendered size
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
    let scale = 0;

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
            const offsetRatio = desiredHeight / canvasHeight;

            x = (canvasWidth - scaledWidth) / 2;
            viewportWidth = scaledWidth;
            scale = offsetRatio;
        }
        else {
            const scaledHeight = canvasWidth / disairedAspectRatio;
            const offsetRatio = desiredWidth / canvasWidth;

            viewportHeight = scaledHeight;
            y = (canvasHeight - scaledHeight) / 2;
            scale = offsetRatio;
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
