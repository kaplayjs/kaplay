import { burp } from "../audio/burp";
import { FrameBuffer } from "../gfx/FrameBuffer";
import { updateViewport } from "../gfx/viewport";
import { _k } from "../shared";

// Events used at the start of a game

export function initAppEvents() {
    _k.app.onHide(() => {
        if (!_k.globalOpt.backgroundAudio) {
            _k.audio.ctx.suspend();
        }
    });

    _k.app.onShow(() => {
        if (!_k.globalOpt.backgroundAudio && !_k.debug.paused) {
            _k.audio.ctx.resume();
        }
    });

    _k.app.onResize(() => {
        if (_k.app.isFullscreen()) return;
        const fixedSize = _k.globalOpt.width && _k.globalOpt.height;
        if (fixedSize && !_k.globalOpt.letterbox) {
            return;
        }

        _k.canvas.width = _k.canvas.offsetWidth * _k.gfx.pixelDensity;
        _k.canvas.height = _k.canvas.offsetHeight * _k.gfx.pixelDensity;

        updateViewport();

        if (!fixedSize) {
            _k.gfx.frameBuffer.free();
            _k.gfx.frameBuffer = new FrameBuffer(
                _k.gfx.ggl,
                _k.gfx.ggl.gl.drawingBufferWidth,
                _k.gfx.ggl.gl.drawingBufferHeight,
            );
            _k.gfx.width = _k.gfx.ggl.gl.drawingBufferWidth
                / _k.gfx.pixelDensity
                / _k.globalOpt.scale;
            _k.gfx.height = _k.gfx.ggl.gl.drawingBufferHeight
                / _k.gfx.pixelDensity
                / _k.globalOpt.scale;
        }
    });

    // burp mode initialization
    if (_k.globalOpt.burp) {
        _k.app.onKeyPress("b", () => burp());
    }
}
