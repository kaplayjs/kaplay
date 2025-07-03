import { BG_GRID_SIZE } from "../constants/general.js";
import type { Game } from "../game/game.js";
import { drawTexture } from "../gfx/draw/drawTexture.js";
import { drawUnscaled } from "../gfx/draw/drawUnscaled.js";
import { drawUVQuad } from "../gfx/draw/drawUVQuad.js";
import type { AppGfxCtx } from "../gfx/gfxApp.js";
import { flush, height, width } from "../gfx/stack.js";
import { Quad } from "../math/math.js";
import { Vec2 } from "../math/Vec2.js";

export type FrameRenderer = ReturnType<typeof createFrameRenderer>;

export const createFrameRenderer = (
    gfx: AppGfxCtx,
    game: Game,
    pixelDensity: number,
) => {
    // start a rendering frame, reset some states
    function frameStart() {
        // clear backbuffer
        gfx.gl.clear(gfx.gl.COLOR_BUFFER_BIT);
        gfx.frameBuffer.bind();
        // clear framebuffer
        gfx.gl.clear(gfx.gl.COLOR_BUFFER_BIT);

        // Iconic background
        if (!gfx.bgColor) {
            drawUnscaled(() => {
                drawUVQuad({
                    width: width(),
                    height: height(),
                    quad: new Quad(
                        0,
                        0,
                        width() / BG_GRID_SIZE,
                        height() / BG_GRID_SIZE,
                    ),
                    tex: gfx.bgTex,
                    fixed: true,
                });
            });
        }

        gfx.renderer.numDraws = 0;
        gfx.fixed = false;
        gfx.transformStackIndex = -1;
        gfx.transform.setIdentity();
    }

    function frameEnd() {
        // TODO: don't render debug UI with framebuffer
        // TODO: polish framebuffer rendering / sizing issues
        flush();
        gfx.lastDrawCalls = gfx.renderer.numDraws;
        gfx.frameBuffer.unbind();
        gfx.gl.viewport(
            0,
            0,
            gfx.gl.drawingBufferWidth,
            gfx.gl.drawingBufferHeight,
        );

        const ow = gfx.width;
        const oh = gfx.height;
        gfx.width = gfx.gl.drawingBufferWidth / pixelDensity;
        gfx.height = gfx.gl.drawingBufferHeight / pixelDensity;

        drawTexture({
            flipY: true,
            tex: gfx.frameBuffer.tex,
            pos: new Vec2(gfx.viewport.x, gfx.viewport.y),
            width: gfx.viewport.width,
            height: gfx.viewport.height,
            shader: gfx.postShader,
            uniform: typeof gfx.postShaderUniform === "function"
                ? gfx.postShaderUniform()
                : gfx.postShaderUniform,
            fixed: true,
        });

        flush();
        gfx.width = ow;
        gfx.height = oh;
    }

    function fixedUpdateFrame() {
        // update every obj
        game.root.fixedUpdate();
    }

    function updateFrame() {
        game.root.update();
    }

    return { frameStart, frameEnd, fixedUpdateFrame, updateFrame };
};
