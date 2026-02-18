import { makeShader, type Shader, type Uniform } from "../assets/shader";
import {
    DEF_FRAG,
    DEF_VERT,
    MAX_BATCHED_INDICES,
    MAX_BATCHED_VERTS,
    VERTEX_FORMAT,
} from "../constants/general";
import { type Color, rgb } from "../math/color";
import { Mat23 } from "../math/math";
import { Vec2 } from "../math/Vec2";
import type { MustKAPLAYOpt } from "../types";
import type { FontAtlas } from "./formatText";
import { FrameBuffer } from "./FrameBuffer";
import { BatchRenderer, type GfxCtx, Texture } from "./gfx";
import type { Frame } from "./TexPacker";

export type AppGfxCtx = {
    /** How many draw calls we're doing last frame */
    lastDrawCalls: number;
    /** Font atlases */
    fontAtlases: Record<string, FontAtlas>;
    /** The graphics context */
    ggl: GfxCtx;
    /** Default shader */
    defShader: Shader;
    whitePixel: Frame;
    /** FrameBuffer */
    frameBuffer: FrameBuffer;
    /** Post Shader, used in postEffect() */
    postShader: string | null;
    postShaderUniform: Uniform | (() => Uniform) | null;
    renderer: BatchRenderer;
    pixelDensity: number;
    transform: Mat23;
    transformStack: Mat23[];
    transformStackIndex: number;
    /** The background texture */
    bgTex: Texture;
    bgColor: Color | null;
    bgAlpha: number;
    /**
     * The
     */
    width: number;
    height: number;
    /**
     * Where the game is rendered.
     */
    viewport: Viewport;
    fixed: boolean;
    gl: WebGLRenderingContext;
    /**
     * Scratch vec2
     */
    scratchPt: Vec2;
};

/**
 * @group Rendering
 * @subgroup Canvas
 */
export type Viewport = {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
};

export const initAppGfx = (gfx: GfxCtx, gopt: MustKAPLAYOpt): AppGfxCtx => {
    const defShader = makeShader(gfx, DEF_VERT, DEF_FRAG);
    const pixelDensity = gopt.pixelDensity ?? 1;
    const { gl } = gfx;

    const frameBuffer = (gopt.width && gopt.height)
        ? new FrameBuffer(
            gfx,
            gopt.width * pixelDensity * gopt.scale,
            gopt.height * pixelDensity * gopt.scale,
        )
        : new FrameBuffer(
            gfx,
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
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA,
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA,
    );

    const renderer = new BatchRenderer(
        gfx,
        VERTEX_FORMAT,
        MAX_BATCHED_VERTS,
        MAX_BATCHED_INDICES,
    );

    // a checkerboard texture used for the default background
    const bgTex = Texture.fromImage(
        gfx,
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
        fontAtlases: {} as Record<string, FontAtlas>,

        ggl: gfx,

        // gfx states
        defShader: defShader,
        whitePixel: null as any,
        frameBuffer: frameBuffer,
        postShader: null as string | null,
        postShaderUniform: null as Uniform | (() => Uniform) | null,
        renderer: renderer,
        pixelDensity: pixelDensity,

        transform: new Mat23(),
        transformStack: transformStack,
        transformStackIndex: -1,

        bgTex: bgTex,
        bgColor: bgColor,
        bgAlpha: bgAlpha,

        width: gopt.width
            ?? gl.drawingBufferWidth / pixelDensity / gopt.scale,
        height: gopt.height
            ?? gl.drawingBufferHeight / pixelDensity / gopt.scale,

        viewport: {
            x: 0,
            y: 0,
            width: gl.drawingBufferWidth,
            height: gl.drawingBufferHeight,
            scale: 1,
        },

        fixed: false,
        gl,

        scratchPt: new Vec2(0, 0),
    };
};
