import { _k } from "../kaplay";

// update viewport based on user setting and fullscreen state
export function updateViewport() {
    // content size (scaled content size, with scale and letterbox)
    // view size (unscaled viewport size)
    // window size (will be the same as view size except letterbox mode)

    const pixelDensity = _k.gfx.pixelDensity;
    // This is the actual TRUE size of the <canvas> element
    const canvasWidth = _k.gfx.ggl.gl.drawingBufferWidth / pixelDensity;
    const canvasHeight = _k.gfx.ggl.gl.drawingBufferHeight / pixelDensity;
    const desiredWidth = _k.globalOpt.width;
    const desiredHeight = _k.globalOpt.height;

    if (_k.globalOpt.letterbox) {
        if (!desiredWidth || !desiredHeight) {
            throw new Error(
                "Letterboxing requires width and height defined.",
            );
        }

        const canvasAspectRatio = canvasWidth / canvasHeight;
        const disairedAspectRatio = desiredWidth / desiredHeight;

        if (canvasAspectRatio > disairedAspectRatio) {
            const scaledWidth = canvasHeight * disairedAspectRatio;
            const x = (canvasWidth - scaledWidth) / 2;
            const differenceFactor = desiredHeight / canvasHeight;

            _k.gfx.viewport = {
                x: x,
                y: 0,
                width: scaledWidth,
                height: canvasHeight,
                scaleFactor: differenceFactor,
            };
        }
        else {
            const scaledHeight = canvasWidth / disairedAspectRatio;
            const y = (canvasHeight - scaledHeight) / 2;
            const differenceFactor = desiredWidth / canvasWidth;

            _k.gfx.viewport = {
                x: 0,
                y: y,
                width: canvasWidth,
                height: scaledHeight,
                scaleFactor: differenceFactor,
            };
        }

        return;
    }

    _k.gfx.viewport = {
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
        scaleFactor: desiredWidth ? 1 : 1 / _k.gfx.gscale,
    };
}
