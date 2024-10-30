import { makeShader, type Uniform } from "../assets/shader";
import {
    DEF_FRAG,
    DEF_VERT,
    MAX_BATCHED_INDICES,
    MAX_BATCHED_VERTS,
    VERTEX_FORMAT,
} from "../constants";
import { BatchRenderer, FrameBuffer, type GfxCtx, Texture } from "../gfx";
import { type Color, rgb } from "../math/color";
import { Mat23, Mat4 } from "../math/math";
import type { KAPLAYOpt } from "../types";

export type AppGfxCtx = ReturnType<typeof initAppGfx>;

export const initAppGfx = (gopt: KAPLAYOpt, ggl: GfxCtx) => {
    const defShader = makeShader(ggl, DEF_VERT, DEF_FRAG);
    const pixelDensity = gopt.pixelDensity ?? 1;
    const gscale = gopt.scale ?? 1;
    const { gl } = ggl;

    // a 1x1 white texture to draw raw shapes like rectangles and polygons
    // we use a texture for those so we can use only 1 pipeline for drawing sprites + shapes
    const emptyTex = Texture.fromImage(
        ggl,
        new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1),
    );

    const frameBuffer = (gopt.width && gopt.height)
        ? new FrameBuffer(
            ggl,
            gopt.width * pixelDensity * gscale,
            gopt.height * pixelDensity * gscale,
        )
        : new FrameBuffer(
            ggl,
            gl.drawingBufferWidth,
            gl.drawingBufferHeight,
        );

    let bgColor: null | Color = null;
    let bgAlpha = 1;

    if (gopt.background) {
        if (typeof gopt.background === "string") {
            bgColor = rgb(gopt.background);
        }
        else {
            bgColor = rgb(...gopt.background);
            bgAlpha = gopt.background[3] ?? 1;
        }

        gl.clearColor(
            bgColor.r / 255,
            bgColor.g / 255,
            bgColor.b / 255,
            bgAlpha ?? 1,
        );
    }

    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
        gl.SRC_ALPHA,
        gl.ONE_MINUS_SRC_ALPHA,
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA,
    );

    const renderer = new BatchRenderer(
        ggl,
        VERTEX_FORMAT,
        MAX_BATCHED_VERTS,
        MAX_BATCHED_INDICES,
    );

    // a checkerboard texture used for the default background
    const bgTex = Texture.fromImage(
        ggl,
        new ImageData(
            new Uint8ClampedArray([
                128,
                128,
                128,
                255,
                190,
                190,
                190,
                255,
                190,
                190,
                190,
                255,
                128,
                128,
                128,
                255,
            ]),
            2,
            2,
        ),
        {
            wrap: "repeat",
            filter: "nearest",
        },
    );

    const transformStack = new Array(32).fill(0).map(_ => new Mat23());

    return {
        // how many draw calls we're doing last frame, this is the number we give to users
        lastDrawCalls: 0,
        ggl,

        // gfx states
        defShader: defShader,
        defTex: emptyTex,
        frameBuffer: frameBuffer,
        postShader: null as string | null,
        postShaderUniform: null as Uniform | (() => Uniform) | null,
        renderer: renderer,

        transform: new Mat23(),
        transformStack: transformStack,
        transformStackIndex: -1,

        bgTex: bgTex,
        bgColor: bgColor,
        bgAlpha: bgAlpha,

        width: gopt.width
            ?? gl.drawingBufferWidth / pixelDensity / gscale,
        height: gopt.height
            ?? gl.drawingBufferHeight / pixelDensity / gscale,

        viewport: {
            x: 0,
            y: 0,
            width: gl.drawingBufferWidth,
            height: gl.drawingBufferHeight,
        },

        fixed: false,
    };
};
