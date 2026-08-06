import { burp } from "../audio/burp";
import { FrameBuffer } from "../gfx/FrameBuffer";
import { updateViewport } from "../gfx/viewport";
import { clamp } from "../math/clamp";
import { _k } from "../shared";
import { toFixed } from "../utils/numbers";

export function initAppEvents() {
    _k.appScope.onTabHide(() => {
        if (!_k.globalOpt.backgroundAudio) {
            _k.audio.ctx.suspend();
        }
    });

    _k.appScope.onTabShow(() => {
        if (!_k.globalOpt.backgroundAudio && !_k.debug.paused) {
            _k.audio.ctx.resume();
        }
    });

    _k.app.onResize(() => {
        const fixedSize = _k.globalOpt.width && _k.globalOpt.height;
        if (fixedSize && !_k.globalOpt.letterbox) {
            return;
        }

        _k.canvas.width = _k.canvas.offsetWidth * _k.gfx.pixelDensity;
        _k.canvas.height = _k.canvas.offsetHeight * _k.gfx.pixelDensity;
        _k.app.updateCanvasScale();

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

    if (_k.globalOpt.debug !== false) {
        _k.appScope.onButtonPress("stepframe", () => _k.debug.stepFrame());
        _k.appScope.onButtonPress("clearlogs", () => _k.debug.clearLog());

        _k.appScope.onButtonPress(
            "inspect",
            () => _k.debug.inspect = !_k.debug.inspect,
        );

        _k.appScope.onButtonPress(
            "pause",
            () => _k.debug.paused = !_k.debug.paused,
        );

        _k.appScope.onButtonPress("slowdown", () => {
            _k.debug.timeScale = toFixed(
                clamp(_k.debug.timeScale - 0.2, 0, 2),
                1,
            );
        });
        _k.appScope.onButtonPress("speedup", () => {
            _k.debug.timeScale = toFixed(
                clamp(_k.debug.timeScale + 0.2, 0, 2),
                1,
            );
        });
    }

    // burp mode initialization
    if (_k.globalOpt.burp) {
        _k.appScope.onKeyPress("b", () => burp());
    }
}
