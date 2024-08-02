import { gfx, globalOpt, pixelDensity } from "../kaplay";

// update viewport based on user setting and fullscreen state
export function updateViewport() {
    // content size (scaled content size, with scale, stretch and letterbox)
    // view size (unscaled viewport size)
    // window size (will be the same as view size except letterbox mode)

    // canvas size
    const pd = pixelDensity;
    const canvasWidth = gfx.ggl.gl.drawingBufferWidth / pd;
    const canvasHeight = gfx.ggl.gl.drawingBufferHeight / pd;

    if (globalOpt.letterbox) {
        if (!globalOpt.width || !globalOpt.height) {
            throw new Error(
                "Letterboxing requires width and height defined.",
            );
        }

        const rc = canvasWidth / canvasHeight;
        const rg = globalOpt.width / globalOpt.height;

        if (rc > rg) {
            const sw = canvasHeight * rg;
            const x = (canvasWidth - sw) / 2;
            gfx.viewport = {
                x: x,
                y: 0,
                width: sw,
                height: canvasHeight,
            };
        }
        else {
            const sh = canvasWidth / rg;
            const y = (canvasHeight - sh) / 2;
            gfx.viewport = {
                x: 0,
                y: y,
                width: canvasWidth,
                height: sh,
            };
        }

        return;
    }

    if (globalOpt.stretch) {
        if (!globalOpt.width || !globalOpt.height) {
            throw new Error(
                "Stretching requires width and height defined.",
            );
        }
    }

    gfx.viewport = {
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
    };
}
