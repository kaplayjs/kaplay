import { _k } from "../kaplay";

// update viewport based on user setting and fullscreen state
export function updateViewport() {
    // content size (scaled content size, with scale, stretch and letterbox)
    // view size (unscaled viewport size)
    // window size (will be the same as view size except letterbox mode)

    // canvas size
    const pd = _k.pixelDensity;
    const canvasWidth = _k.gfx.ggl.gl.drawingBufferWidth / pd;
    const canvasHeight = _k.gfx.ggl.gl.drawingBufferHeight / pd;

    if (_k.globalOpt.letterbox) {
        if (!_k.globalOpt.width || !_k.globalOpt.height) {
            throw new Error(
                "Letterboxing requires width and height defined.",
            );
        }

        const rc = canvasWidth / canvasHeight;
        const rg = _k.globalOpt.width / _k.globalOpt.height;

        if (rc > rg) {
            const sw = canvasHeight * rg;
            const x = (canvasWidth - sw) / 2;
            _k.gfx.viewport = {
                x: x,
                y: 0,
                width: sw,
                height: canvasHeight,
            };
        }
        else {
            const sh = canvasWidth / rg;
            const y = (canvasHeight - sh) / 2;
            _k.gfx.viewport = {
                x: 0,
                y: y,
                width: canvasWidth,
                height: sh,
            };
        }

        return;
    }

    if (_k.globalOpt.stretch) {
        if (!_k.globalOpt.width || !_k.globalOpt.height) {
            throw new Error(
                "Stretching requires width and height defined.",
            );
        }
    }

    _k.gfx.viewport = {
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
    };
}
