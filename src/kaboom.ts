const VERSION = "3001.0.0";

import initApp from "./app";
import initGfx, { BatchRenderer, FrameBuffer, Shader, Texture } from "./gfx";

import {
    Asset,
    AssetBucket,
    fetchArrayBuffer,
    fetchJSON,
    fetchText,
    loadImg,
} from "./assets";

import {
    ASCII_CHARS,
    BG_GRID_SIZE,
    COMP_DESC,
    COMP_EVENTS,
    DBG_FONT,
    DEF_ANCHOR,
    DEF_FONT,
    DEF_FONT_FILTER,
    DEF_FRAG,
    DEF_HASH_GRID_SIZE,
    DEF_TEXT_CACHE_SIZE,
    DEF_VERT,
    FONT_ATLAS_HEIGHT,
    FONT_ATLAS_WIDTH,
    FRAG_TEMPLATE,
    LOG_MAX,
    LOG_TIME,
    MAX_BATCHED_INDICES,
    MAX_BATCHED_VERTS,
    MAX_TEXT_CACHE_SIZE,
    SPRITE_ATLAS_HEIGHT,
    SPRITE_ATLAS_WIDTH,
    TEXT_STYLE_RE,
    UV_PAD,
    VERT_TEMPLATE,
    VERTEX_FORMAT,
} from "./constants";

import {
    chance,
    choose,
    chooseMultiple,
    Circle,
    clamp,
    Color,
    curveLengthApproximation,
    deg2rad,
    easingCubicBezier,
    easingLinear,
    easingSteps,
    Ellipse,
    evaluateBezier,
    evaluateBezierFirstDerivative,
    evaluateBezierSecondDerivative,
    evaluateCatmullRom,
    evaluateCatmullRomFirstDerivative,
    evaluateQuadratic,
    evaluateQuadraticFirstDerivative,
    evaluateQuadraticSecondDerivative,
    hsl2rgb,
    isConvex,
    lerp,
    Line,
    map,
    mapc,
    Mat4,
    normalizedCurve,
    Point,
    Polygon,
    Quad,
    quad,
    rad2deg,
    rand,
    randi,
    randSeed,
    raycastGrid,
    type RaycastHit as BaseRaycastHit,
    Rect,
    rgb,
    RNG,
    sat,
    shuffle,
    testCirclePolygon,
    testLineCircle,
    testLineLine,
    testLinePoint,
    testRectLine,
    testRectPoint,
    testRectRect,
    triangulate,
    Vec2,
    vec2,
    type Vec2Args,
    wave,
} from "./math";

import { NavMesh } from "./math/navigationmesh";

import easings from "./easings";
import TexPacker from "./texPacker";

import {
    BinaryHeap,
    dataURLToArrayBuffer,
    download,
    downloadBlob,
    downloadJSON,
    downloadText,
    getErrorMessage,
    getFileName,
    isClass,
    isDataURL,
    KEvent,
    KEventController,
    KEventHandler,
    overload2,
    Registry,
    runes,
    uid,
} from "./utils";

import { FontData } from "./fonts";

import type {
    Anchor,
    AreaComp,
    AsepriteData,
    AudioPlay,
    AudioPlayOpt,
    BitmapFontData,
    BoomOpt,
    ButtonsDef,
    CharTransform,
    Comp,
    CompList,
    Debug,
    DrawBezierOpt,
    DrawCircleOpt,
    DrawCurveOpt,
    DrawEllipseOpt,
    DrawLineOpt,
    DrawLinesOpt,
    DrawPolygonOpt,
    DrawRectOpt,
    DrawSpriteOpt,
    DrawTextOpt,
    DrawTextureOpt,
    DrawTriangleOpt,
    DrawUVQuadOpt,
    FixedComp,
    FormattedChar,
    FormattedText,
    GameObj,
    GetOpt,
    GfxFont,
    ImageSource,
    InternalCtx,
    KaboomCtx,
    KaboomOpt,
    KaboomPlugin,
    Key,
    LevelComp,
    LevelOpt,
    LoadBitmapFontOpt,
    LoadFontOpt,
    LoadSpriteOpt,
    LoadSpriteSrc,
    MaskComp,
    MergePlugins,
    MouseButton,
    MusicData,
    NineSlice,
    Outline,
    PathFindOpt,
    PeditFile,
    PluginList,
    PosComp,
    QueryOpt,
    Recording,
    RenderProps,
    RotateComp,
    ScaleComp,
    SceneDef,
    SceneName,
    ShaderData,
    SpriteAnims,
    SpriteAtlasData,
    Tag,
    TexFilter,
    TextAlign,
    Uniform,
    Vertex,
} from "./types";

import {
    agent,
    anchor,
    area,
    body,
    circle,
    color,
    doubleJump,
    drawon,
    fadeIn,
    fixed,
    follow,
    health,
    layer,
    lifespan,
    mask,
    move,
    named,
    navigation,
    offscreen,
    opacity,
    outline,
    particles,
    patrol,
    polygon,
    pos,
    raycast,
    rect,
    rotate,
    scale,
    sentry,
    shader,
    sprite,
    state,
    stay,
    text,
    tile,
    timer,
    uvquad,
    z,
} from "./components";

import beanSpriteSrc from "./assets/bean.png";
import boomSpriteSrc from "./assets/boom.png";
import burpSoundSrc from "./assets/burp.mp3";
import kaSpriteSrc from "./assets/ka.png";

// for import types from package
export type * from "./types";

// convert anchor string to a vec2 offset
export function anchorPt(orig: Anchor | Vec2): Vec2 {
    switch (orig) {
        case "topleft":
            return new Vec2(-1, -1);
        case "top":
            return new Vec2(0, -1);
        case "topright":
            return new Vec2(1, -1);
        case "left":
            return new Vec2(-1, 0);
        case "center":
            return new Vec2(0, 0);
        case "right":
            return new Vec2(1, 0);
        case "botleft":
            return new Vec2(-1, 1);
        case "bot":
            return new Vec2(0, 1);
        case "botright":
            return new Vec2(1, 1);
        default:
            return orig;
    }
}

function alignPt(align: TextAlign): number {
    switch (align) {
        case "left":
            return 0;
        case "center":
            return 0.5;
        case "right":
            return 1;
        default:
            return 0;
    }
}

function createEmptyAudioBuffer(ctx: AudioContext) {
    return ctx.createBuffer(1, 1, 44100);
}

let ctx: KaboomCtx;

// TODO: A better way to detect KaboomCtx
export const isKaboomCtx = (obj: any): obj is KaboomCtx => {
    return obj && obj["loadAseprite"];
};

export const getKaboomContext = (fallBack?: any): KaboomCtx => {
    if (!ctx) {
        throw new Error(
            "You are trying to access to Kaboom Context before their initialization.",
        );
    }

    if (isKaboomCtx(fallBack)) {
        return fallBack;
    }

    return ctx;
};

/**
 * Initialize KAPLAY context. The starting point of all KAPLAY games.
 *
 * @example
 * ```js
 * // Start KAPLAY with default options (will create a fullscreen canvas under <body>)
 * kaplay()
 *
 * // Init with some options
 * kaplay({
 *     width: 320,
 *     height: 240,
 *     font: "sans-serif",
 *     canvas: document.querySelector("#mycanvas"),
 *     background: [ 0, 0, 255, ],
 * })
 *
 * // All KAPLAY functions are imported to global after calling kaplay()
 * add()
 * onUpdate()
 * onKeyPress()
 * vec2()
 *
 * // If you want to prevent KAPLAY from importing all functions to global and use a context handle for all KAPLAY functions
 * const k = kaplay({ global: false })
 *
 * k.add(...)
 * k.onUpdate(...)
 * k.onKeyPress(...)
 * k.vec2(...)
 * ```
 *
 * @group Start
 */
const kaplay = <
    TPlugins extends PluginList<unknown> = [undefined],
    TButtons extends ButtonsDef = {},
    TButtonsName extends string = keyof TButtons & string,
>(
    gopt: KaboomOpt<TPlugins, TButtons> = {},
): TPlugins extends [undefined] ? KaboomCtx<TButtons, TButtonsName>
    : KaboomCtx<TButtons, TButtonsName> & MergePlugins<TPlugins> =>
{
    const root = gopt.root ?? document.body;

    // if root is not defined (which falls back to <body>) we assume user is using kaboom on a clean page, and modify <body> to better fit a full screen canvas
    if (root === document.body) {
        document.body.style["width"] = "100%";
        document.body.style["height"] = "100%";
        document.body.style["margin"] = "0px";
        document.documentElement.style["width"] = "100%";
        document.documentElement.style["height"] = "100%";
    }

    // create a <canvas> if user didn't provide one
    const canvas = gopt.canvas
        ?? root.appendChild(document.createElement("canvas"));

    // global pixel scale
    const gscale = gopt.scale ?? 1;
    const fixedSize = gopt.width && gopt.height && !gopt.stretch
        && !gopt.letterbox;

    // adjust canvas size according to user size / viewport settings
    if (fixedSize) {
        canvas.width = gopt.width * gscale;
        canvas.height = gopt.height * gscale;
    } else {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }

    // canvas css styles
    const styles = [
        "outline: none",
        "cursor: default",
    ];

    if (fixedSize) {
        const cw = canvas.width;
        const ch = canvas.height;
        styles.push(`width: ${cw}px`);
        styles.push(`height: ${ch}px`);
    } else {
        styles.push("width: 100%");
        styles.push("height: 100%");
    }

    if (gopt.crisp) {
        // chrome only supports pixelated and firefox only supports crisp-edges
        styles.push("image-rendering: pixelated");
        styles.push("image-rendering: crisp-edges");
    }

    canvas.style.cssText = styles.join(";");

    const pixelDensity = gopt.pixelDensity || window.devicePixelRatio;

    canvas.width *= pixelDensity;
    canvas.height *= pixelDensity;
    // make canvas focusable
    canvas.tabIndex = 0;

    const fontCacheCanvas = document.createElement("canvas");
    fontCacheCanvas.width = MAX_TEXT_CACHE_SIZE;
    fontCacheCanvas.height = MAX_TEXT_CACHE_SIZE;
    const fontCacheC2d = fontCacheCanvas.getContext("2d", {
        willReadFrequently: true,
    });

    const app = initApp({
        canvas: canvas,
        touchToMouse: gopt.touchToMouse,
        gamepads: gopt.gamepads,
        pixelDensity: gopt.pixelDensity,
        maxFPS: gopt.maxFPS,
        buttons: gopt.buttons,
    });

    const gc: Array<() => void> = [];

    const gl = app.canvas
        .getContext("webgl", {
            antialias: true,
            depth: true,
            stencil: true,
            alpha: true,
            preserveDrawingBuffer: true,
        });

    const ggl = initGfx(gl, {
        texFilter: gopt.texFilter,
    });

    const gfx = (() => {
        const defShader = makeShader(DEF_VERT, DEF_FRAG);

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
            bgColor = rgb(gopt.background);
            bgAlpha = Array.isArray(gopt.background)
                ? gopt.background[3]
                : 1;
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

        return {
            // how many draw calls we're doing last frame, this is the number we give to users
            lastDrawCalls: 0,

            // gfx states
            defShader: defShader,
            defTex: emptyTex,
            frameBuffer: frameBuffer,
            postShader: null,
            postShaderUniform: null,
            renderer: renderer,

            transform: new Mat4(),
            transformStack: [],

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
    })();

    class SpriteData {
        tex: Texture;
        frames: Quad[] = [new Quad(0, 0, 1, 1)];
        anims: SpriteAnims = {};
        slice9: NineSlice | null = null;

        constructor(
            tex: Texture,
            frames?: Quad[],
            anims: SpriteAnims = {},
            slice9: NineSlice = null,
        ) {
            this.tex = tex;
            if (frames) this.frames = frames;
            this.anims = anims;
            this.slice9 = slice9;
        }

        get width() {
            return this.tex.width * this.frames[0].w;
        }

        get height() {
            return this.tex.height * this.frames[0].h;
        }

        static from(
            src: LoadSpriteSrc,
            opt: LoadSpriteOpt = {},
        ): Promise<SpriteData> {
            return typeof src === "string"
                ? SpriteData.fromURL(src, opt)
                : Promise.resolve(SpriteData.fromImage(src, opt));
        }

        static fromImage(
            data: ImageSource,
            opt: LoadSpriteOpt = {},
        ): SpriteData {
            const [tex, quad] = assets.packer.add(data);
            const frames = opt.frames
                ? opt.frames.map((f) =>
                    new Quad(
                        quad.x + f.x * quad.w,
                        quad.y + f.y * quad.h,
                        f.w * quad.w,
                        f.h * quad.h,
                    )
                )
                : slice(
                    opt.sliceX || 1,
                    opt.sliceY || 1,
                    quad.x,
                    quad.y,
                    quad.w,
                    quad.h,
                );
            return new SpriteData(tex, frames, opt.anims, opt.slice9);
        }

        static fromURL(
            url: string,
            opt: LoadSpriteOpt = {},
        ): Promise<SpriteData> {
            return loadImg(url).then((img) => SpriteData.fromImage(img, opt));
        }
    }

    class SoundData {
        buf: AudioBuffer;

        constructor(buf: AudioBuffer) {
            this.buf = buf;
        }

        static fromArrayBuffer(buf: ArrayBuffer): Promise<SoundData> {
            return new Promise((resolve, reject) =>
                audio.ctx.decodeAudioData(buf, resolve, reject)
            ).then((buf: AudioBuffer) => new SoundData(buf));
        }

        static fromURL(url: string): Promise<SoundData> {
            if (isDataURL(url)) {
                return SoundData.fromArrayBuffer(dataURLToArrayBuffer(url));
            } else {
                return fetchArrayBuffer(url).then((buf) =>
                    SoundData.fromArrayBuffer(buf)
                );
            }
        }
    }

    const audio = (() => {
        const ctx = new (
            window.AudioContext || (window as any).webkitAudioContext
        )() as AudioContext;

        const masterNode = ctx.createGain();
        masterNode.connect(ctx.destination);

        // by default browsers can only load audio async, we don't deal with that and just start with an empty audio buffer
        const burpSnd = new SoundData(createEmptyAudioBuffer(ctx));

        // load that burp sound
        ctx.decodeAudioData(burpSoundSrc.buffer.slice(0)).then((buf) => {
            burpSnd.buf = buf;
        }).catch((err) => {
            console.error("Failed to load burp: ", err);
        });

        return {
            ctx,
            masterNode,
            burpSnd,
        };
    })();

    const assets = {
        urlPrefix: "",
        // asset holders
        sprites: new AssetBucket<SpriteData>(),
        fonts: new AssetBucket<FontData>(),
        bitmapFonts: new AssetBucket<BitmapFontData>(),
        sounds: new AssetBucket<SoundData>(),
        shaders: new AssetBucket<ShaderData>(),
        custom: new AssetBucket<any>(),
        music: {},
        packer: new TexPacker(ggl, SPRITE_ATLAS_WIDTH, SPRITE_ATLAS_HEIGHT),
        // if we finished initially loading all assets
        loaded: false,
    };

    function fixURL<D>(url: D): D {
        if (typeof url !== "string" || isDataURL(url)) return url;
        return assets.urlPrefix + url as D;
    }

    const game = {
        // general events
        events: new KEventHandler<{
            mouseMove: [];
            mouseDown: [MouseButton];
            mousePress: [MouseButton];
            mouseRelease: [MouseButton];
            charInput: [string];
            keyPress: [Key];
            keyDown: [Key];
            keyPressRepeat: [Key];
            keyRelease: [Key];
            touchStart: [Vec2, Touch];
            touchMove: [Vec2, Touch];
            touchEnd: [Vec2, Touch];
            gamepadButtonDown: [string];
            gamepadButtonPress: [string];
            gamepadButtonRelease: [string];
            gamepadStick: [string, Vec2];
            gamepadConnect: [Gamepad];
            gamepadDisconnect: [Gamepad];
            scroll: [Vec2];
            add: [GameObj];
            destroy: [GameObj];
            load: [];
            loading: [number];
            error: [Error];
            input: [];
            frameEnd: [];
            resize: [];
            sceneLeave: [string];
        }>(),

        // object events
        objEvents: new KEventHandler(),

        // root game object
        root: make([]),

        // misc
        gravity: null,
        scenes: {},
        currentScene: null,
        layers: null,
        defaultLayerIndex: 0,

        // on screen log
        logs: [],

        // camera
        cam: {
            pos: null,
            scale: new Vec2(1),
            angle: 0,
            shake: 0,
            transform: new Mat4(),
        },
    };

    game.root.use(timer());

    // wrap individual loaders with global loader counter, for stuff like progress bar
    function load<T>(prom: Promise<T>): Asset<T> {
        return assets.custom.add(null, prom);
    }

    // get current load progress
    function loadProgress(): number {
        const buckets = [
            assets.sprites,
            assets.sounds,
            assets.shaders,
            assets.fonts,
            assets.bitmapFonts,
            assets.custom,
        ];
        return buckets.reduce((n, bucket) => n + bucket.progress(), 0)
            / buckets.length;
    }

    // global load path prefix
    function loadRoot(path?: string): string {
        if (path !== undefined) {
            assets.urlPrefix = path;
        }
        return assets.urlPrefix;
    }

    function loadJSON(name, url) {
        return assets.custom.add(name, fetchJSON(url));
    }

    // TODO: pass in null src to store opt for default fonts like "monospace"
    function loadFont(
        name: string,
        src: string | BinaryData,
        opt: LoadFontOpt = {},
    ): Asset<FontData> {
        const font = new FontFace(
            name,
            typeof src === "string" ? `url(${src})` : src,
        );
        document.fonts.add(font);
        return assets.fonts.add(
            name,
            font.load().catch((err) => {
                throw new Error(`Failed to load font from "${src}": ${err}`);
            }).then((face) => new FontData(face, opt)),
        );
    }

    // TODO: support outline
    // TODO: support LoadSpriteSrc
    function loadBitmapFont(
        name: string | null,
        src: string,
        gw: number,
        gh: number,
        opt: LoadBitmapFontOpt = {},
    ): Asset<BitmapFontData> {
        return assets.bitmapFonts.add(
            name,
            loadImg(src)
                .then((img) => {
                    return makeFont(
                        Texture.fromImage(ggl, img, opt),
                        gw,
                        gh,
                        opt.chars ?? ASCII_CHARS,
                    );
                }),
        );
    }

    // get an array of frames based on configuration on how to slice the image
    function slice(x = 1, y = 1, dx = 0, dy = 0, w = 1, h = 1): Quad[] {
        const frames = [];
        const qw = w / x;
        const qh = h / y;
        for (let j = 0; j < y; j++) {
            for (let i = 0; i < x; i++) {
                frames.push(
                    new Quad(
                        dx + i * qw,
                        dy + j * qh,
                        qw,
                        qh,
                    ),
                );
            }
        }
        return frames;
    }

    // TODO: load synchronously if passed ImageSource
    function loadSpriteAtlas(
        src: LoadSpriteSrc,
        data: SpriteAtlasData | string,
    ): Asset<Record<string, SpriteData>> {
        src = fixURL(src);
        if (typeof data === "string") {
            return load(
                new Promise((res, rej) => {
                    fetchJSON(data).then((json) => {
                        loadSpriteAtlas(src, json).then(res).catch(rej);
                    });
                }),
            );
        }
        return load(
            SpriteData.from(src).then((atlas) => {
                const map = {};
                for (const name in data) {
                    const info = data[name];
                    const quad = atlas.frames[0];
                    const w = SPRITE_ATLAS_WIDTH * quad.w;
                    const h = SPRITE_ATLAS_HEIGHT * quad.h;
                    const frames = info.frames
                        ? info.frames.map((f) =>
                            new Quad(
                                quad.x + (info.x + f.x) / w * quad.w,
                                quad.y + (info.y + f.y) / h * quad.h,
                                f.w / w * quad.w,
                                f.h / h * quad.h,
                            )
                        )
                        : slice(
                            info.sliceX || 1,
                            info.sliceY || 1,
                            quad.x + info.x / w * quad.w,
                            quad.y + info.y / h * quad.h,
                            info.width / w * quad.w,
                            info.height / h * quad.h,
                        );
                    const spr = new SpriteData(atlas.tex, frames, info.anims);
                    assets.sprites.addLoaded(name, spr);
                    map[name] = spr;
                }
                return map;
            }),
        );
    }

    function createSpriteSheet(
        images: ImageSource[],
        opt: LoadSpriteOpt = {},
    ): SpriteData {
        const canvas = document.createElement("canvas");
        const width = images[0].width;
        const height = images[0].height;
        canvas.width = width * images.length;
        canvas.height = height;
        const c2d = canvas.getContext("2d");
        images.forEach((img, i) => {
            if (img instanceof ImageData) {
                c2d.putImageData(img, i * width, 0);
            } else {
                c2d.drawImage(img, i * width, 0);
            }
        });
        const merged = c2d.getImageData(0, 0, images.length * width, height);
        return SpriteData.fromImage(merged, {
            ...opt,
            sliceX: images.length,
            sliceY: 1,
        });
    }

    // load a sprite to asset manager
    function loadSprite(
        name: string | null,
        src: LoadSpriteSrc | LoadSpriteSrc[],
        opt: LoadSpriteOpt = {
            sliceX: 1,
            sliceY: 1,
            anims: {},
        },
    ): Asset<SpriteData> {
        src = fixURL(src);
        if (Array.isArray(src)) {
            if (src.some((s) => typeof s === "string")) {
                return assets.sprites.add(
                    name,
                    Promise.all(src.map((s) => {
                        return typeof s === "string"
                            ? loadImg(s)
                            : Promise.resolve(s);
                    })).then((images) => createSpriteSheet(images, opt)),
                );
            } else {
                return assets.sprites.addLoaded(
                    name,
                    createSpriteSheet(src as ImageSource[], opt),
                );
            }
        } else {
            if (typeof src === "string") {
                return assets.sprites.add(name, SpriteData.from(src, opt));
            } else {
                return assets.sprites.addLoaded(
                    name,
                    SpriteData.fromImage(src, opt),
                );
            }
        }
    }

    function loadPedit(
        name: string | null,
        src: string | PeditFile,
    ): Asset<SpriteData> {
        src = fixURL(src);

        return assets.sprites.add(
            name,
            new Promise(async (resolve) => {
                const data = typeof src === "string"
                    ? await fetchJSON(src)
                    : src;
                const images = await Promise.all(data.frames.map(loadImg));
                const canvas = document.createElement("canvas");
                canvas.width = data.width;
                canvas.height = data.height * data.frames.length;

                const c2d = canvas.getContext("2d");

                images.forEach((img: HTMLImageElement, i) => {
                    c2d.drawImage(img, 0, i * data.height);
                });

                const spr = await loadSprite(null, canvas, {
                    sliceY: data.frames.length,
                    anims: data.anims,
                });

                resolve(spr);
            }),
        );
    }

    function loadAseprite(
        name: string | null,
        imgSrc: LoadSpriteSrc,
        jsonSrc: string | AsepriteData,
    ): Asset<SpriteData> {
        imgSrc = fixURL(imgSrc);
        jsonSrc = fixURL(jsonSrc);

        if (typeof imgSrc === "string" && !jsonSrc) {
            jsonSrc = getFileName(imgSrc) + ".json";
        }

        const resolveJSON = typeof jsonSrc === "string"
            ? fetchJSON(jsonSrc)
            : Promise.resolve(jsonSrc);

        return assets.sprites.add(
            name,
            resolveJSON.then((data: AsepriteData) => {
                const size = data.meta.size;
                const frames = data.frames.map((f: any) => {
                    return new Quad(
                        f.frame.x / size.w,
                        f.frame.y / size.h,
                        f.frame.w / size.w,
                        f.frame.h / size.h,
                    );
                });
                const anims = {};
                for (const anim of data.meta.frameTags) {
                    if (anim.from === anim.to) {
                        anims[anim.name] = anim.from;
                    } else {
                        anims[anim.name] = {
                            from: anim.from,
                            to: anim.to,
                            speed: 10,
                            loop: true,
                            pingpong: anim.direction === "pingpong",
                        };
                    }
                }
                return SpriteData.from(imgSrc, {
                    frames: frames,
                    anims: anims,
                });
            }),
        );
    }

    function loadShader(
        name: string | null,
        vert?: string,
        frag?: string,
    ) {
        return assets.shaders.addLoaded(name, makeShader(vert, frag));
    }

    function loadShaderURL(
        name: string | null,
        vert?: string,
        frag?: string,
    ): Asset<ShaderData> {
        vert = fixURL(vert);
        frag = fixURL(frag);
        const resolveUrl = (url?: string) =>
            url
                ? fetchText(url)
                : Promise.resolve(null);
        const load = Promise.all([resolveUrl(vert), resolveUrl(frag)])
            .then(([vcode, fcode]: [string | null, string | null]) => {
                return makeShader(vcode, fcode);
            });
        return assets.shaders.add(name, load);
    }

    // load a sound to asset manager
    function loadSound(
        name: string | null,
        src: string | ArrayBuffer,
    ): Asset<SoundData> {
        src = fixURL(src);
        return assets.sounds.add(
            name,
            typeof src === "string"
                ? SoundData.fromURL(src)
                : SoundData.fromArrayBuffer(src),
        );
    }

    function loadMusic(
        name: string | null,
        url: string,
    ) {
        const a = new Audio(url);
        a.preload = "auto";
        return assets.music[name] = fixURL(url);
    }

    function loadBean(name: string = "bean"): Asset<SpriteData> {
        return loadSprite(name, beanSpriteSrc);
    }

    function getSprite(name: string): Asset<SpriteData> | null {
        return assets.sprites.get(name);
    }

    function getSound(name: string): Asset<SoundData> | null {
        return assets.sounds.get(name);
    }

    function getFont(name: string): Asset<FontData> | null {
        return assets.fonts.get(name);
    }

    function getBitmapFont(name: string): Asset<BitmapFontData> | null {
        return assets.bitmapFonts.get(name);
    }

    function getShader(name: string): Asset<ShaderData> | null {
        return assets.shaders.get(name);
    }

    function getAsset(name: string): Asset<any> | null {
        return assets.custom.get(name);
    }

    function resolveSprite(
        src: DrawSpriteOpt["sprite"],
    ): Asset<SpriteData> | null {
        if (typeof src === "string") {
            const spr = getSprite(src);
            if (spr) {
                // if it's already loaded or being loading, return it
                return spr;
            } else if (loadProgress() < 1) {
                // if there's any other ongoing loading task we return empty and don't error yet
                return null;
            } else {
                // if all other assets are loaded and we still haven't found this sprite, throw
                throw new Error(`Sprite not found: ${src}`);
            }
        } else if (src instanceof SpriteData) {
            return Asset.loaded(src);
        } else if (src instanceof Asset) {
            return src;
        } else {
            throw new Error(`Invalid sprite: ${src}`);
        }
    }

    function resolveSound(
        src: string | SoundData | Asset<SoundData>,
    ): Asset<SoundData> | null {
        if (typeof src === "string") {
            const snd = getSound(src);
            if (snd) {
                return snd;
            } else if (loadProgress() < 1) {
                return null;
            } else {
                throw new Error(`Sound not found: ${src}`);
            }
        } else if (src instanceof SoundData) {
            return Asset.loaded(src);
        } else if (src instanceof Asset) {
            return src;
        } else {
            throw new Error(`Invalid sound: ${src}`);
        }
    }

    function resolveShader(
        src: RenderProps["shader"],
    ): ShaderData | Asset<ShaderData> | null {
        if (!src) {
            return gfx.defShader;
        }
        if (typeof src === "string") {
            const shader = getShader(src);
            if (shader) {
                return shader.data ?? shader;
            } else if (loadProgress() < 1) {
                return null;
            } else {
                throw new Error(`Shader not found: ${src}`);
            }
        } else if (src instanceof Asset) {
            return src.data ? src.data : src;
        }

        return src;
    }

    function resolveFont(
        src: DrawTextOpt["font"],
    ):
        | FontData
        | Asset<FontData>
        | BitmapFontData
        | Asset<BitmapFontData>
        | string
        | void
    {
        if (!src) {
            return resolveFont(gopt.font ?? DEF_FONT);
        }
        if (typeof src === "string") {
            const bfont = getBitmapFont(src);
            const font = getFont(src);
            if (bfont) {
                return bfont.data ?? bfont;
            } else if (font) {
                return font.data ?? font;
            } else if (
                document.fonts.check(`${DEF_TEXT_CACHE_SIZE}px ${src}`)
            ) {
                return src;
            } else if (loadProgress() < 1) {
                return null;
            } else {
                throw new Error(`Font not found: ${src}`);
            }
        } else if (src instanceof Asset) {
            return src.data ? src.data : src;
        }

        return src;
    }

    // get / set master volume
    function volume(v?: number): number {
        if (v !== undefined) {
            audio.masterNode.gain.value = v;
        }
        return audio.masterNode.gain.value;
    }

    function playMusic(url: string, opt: AudioPlayOpt = {}): AudioPlay {
        const onEndEvents = new KEvent();
        const el = new Audio(url);
        const src = audio.ctx.createMediaElementSource(el);

        src.connect(audio.masterNode);

        function resumeAudioCtx() {
            if (debug.paused) return;
            if (app.isHidden() && !gopt.backgroundAudio) return;
            audio.ctx.resume();
        }

        function play() {
            resumeAudioCtx();
            el.play();
        }

        if (!opt.paused) {
            play();
        }

        el.onended = () => onEndEvents.trigger();

        return {
            play() {
                play();
            },

            seek(time: number) {
                el.currentTime = time;
            },

            stop() {
                el.pause();
                this.seek(0);
            },

            set loop(l: boolean) {
                el.loop = l;
            },

            get loop() {
                return el.loop;
            },

            set paused(p: boolean) {
                if (p) {
                    el.pause();
                } else {
                    play();
                }
            },

            get paused() {
                return el.paused;
            },

            time() {
                return el.currentTime;
            },

            duration() {
                return el.duration;
            },

            set volume(val: number) {
                el.volume = clamp(val, 0, 1);
            },

            get volume() {
                return el.volume;
            },

            set speed(s) {
                el.playbackRate = Math.max(s, 0);
            },

            get speed() {
                return el.playbackRate;
            },

            set detune(d) {
                // TODO
            },

            get detune() {
                // TODO
                return 0;
            },

            onEnd(action: () => void) {
                return onEndEvents.add(action);
            },

            then(action: () => void) {
                return this.onEnd(action);
            },
        };
    }

    function play(
        src:
            | string
            | SoundData
            | Asset<SoundData>
            | MusicData
            | Asset<MusicData>,
        opt: AudioPlayOpt = {},
    ): AudioPlay {
        if (typeof src === "string" && assets.music[src]) {
            return playMusic(assets.music[src], opt);
        }

        const ctx = audio.ctx;
        let paused = opt.paused ?? false;
        let srcNode = ctx.createBufferSource();
        const onEndEvents = new KEvent();
        const gainNode = ctx.createGain();
        const pos = opt.seek ?? 0;
        let startTime = 0;
        let stopTime = 0;
        let started = false;

        srcNode.loop = Boolean(opt.loop);
        srcNode.detune.value = opt.detune ?? 0;
        srcNode.playbackRate.value = opt.speed ?? 1;
        srcNode.connect(gainNode);
        srcNode.onended = () => {
            if (
                getTime()
                    >= (srcNode.buffer?.duration ?? Number.POSITIVE_INFINITY)
            ) {
                onEndEvents.trigger();
            }
        };
        gainNode.connect(audio.masterNode);
        gainNode.gain.value = opt.volume ?? 1;

        const start = (data: SoundData) => {
            srcNode.buffer = data.buf;
            if (!paused) {
                startTime = ctx.currentTime;
                srcNode.start(0, pos);
                started = true;
            }
        };

        // @ts-ignore
        const snd = resolveSound(src);

        if (snd instanceof Asset) {
            snd.onLoad(start);
        }

        const getTime = () => {
            if (!srcNode.buffer) return 0;
            const t = paused
                ? stopTime - startTime
                : ctx.currentTime - startTime;
            const d = srcNode.buffer.duration;
            return srcNode.loop ? t % d : Math.min(t, d);
        };

        const cloneNode = (oldNode: AudioBufferSourceNode) => {
            const newNode = ctx.createBufferSource();
            newNode.buffer = oldNode.buffer;
            newNode.loop = oldNode.loop;
            newNode.playbackRate.value = oldNode.playbackRate.value;
            newNode.detune.value = oldNode.detune.value;
            newNode.onended = oldNode.onended;
            newNode.connect(gainNode);
            return newNode;
        };

        return {
            stop() {
                this.paused = true;
                this.seek(0);
            },

            set paused(p: boolean) {
                if (paused === p) return;
                paused = p;
                if (p) {
                    if (started) {
                        srcNode.stop();
                        started = false;
                    }
                    stopTime = ctx.currentTime;
                } else {
                    srcNode = cloneNode(srcNode);
                    const pos = stopTime - startTime;
                    srcNode.start(0, pos);
                    started = true;
                    startTime = ctx.currentTime - pos;
                    stopTime = 0;
                }
            },

            get paused() {
                return paused;
            },

            play(time: number = 0) {
                this.seek(time);
                this.paused = false;
            },

            seek(time: number) {
                if (!srcNode.buffer?.duration) return;
                if (time > srcNode.buffer.duration) return;
                if (paused) {
                    srcNode = cloneNode(srcNode);
                    startTime = stopTime - time;
                } else {
                    srcNode.stop();
                    srcNode = cloneNode(srcNode);
                    startTime = ctx.currentTime - time;
                    srcNode.start(0, time);
                    started = true;
                    stopTime = 0;
                }
            },

            // TODO: affect time()
            set speed(val: number) {
                srcNode.playbackRate.value = val;
            },

            get speed() {
                return srcNode.playbackRate.value;
            },

            set detune(val: number) {
                srcNode.detune.value = val;
            },

            get detune() {
                return srcNode.detune.value;
            },

            set volume(val: number) {
                gainNode.gain.value = Math.max(val, 0);
            },

            get volume() {
                return gainNode.gain.value;
            },

            set loop(l: boolean) {
                srcNode.loop = l;
            },

            get loop() {
                return srcNode.loop;
            },

            duration(): number {
                return srcNode.buffer?.duration ?? 0;
            },

            time(): number {
                return getTime() % this.duration();
            },

            onEnd(action: () => void) {
                return onEndEvents.add(action);
            },

            then(action: () => void) {
                return this.onEnd(action);
            },
        };
    }

    // core kaboom logic
    function burp(opt?: AudioPlayOpt): AudioPlay {
        return play(audio.burpSnd, opt);
    }

    function makeCanvas(w: number, h: number) {
        const fb = new FrameBuffer(ggl, w, h);
        return {
            clear: () => fb.clear(),
            free: () => fb.free(),
            toDataURL: () => fb.toDataURL(),
            toImageData: () => fb.toImageData(),
            width: fb.width,
            height: fb.height,
            draw: (action) => {
                flush();
                fb.bind();
                action();
                flush();
                fb.unbind();
            },
        };
    }

    function makeShader(
        vertSrc: string | null = DEF_VERT,
        fragSrc: string | null = DEF_FRAG,
    ): Shader {
        const vcode = VERT_TEMPLATE.replace("{{user}}", vertSrc ?? DEF_VERT);
        const fcode = FRAG_TEMPLATE.replace("{{user}}", fragSrc ?? DEF_FRAG);
        try {
            return new Shader(
                ggl,
                vcode,
                fcode,
                VERTEX_FORMAT.map((vert) => vert.name),
            );
        } catch (e) {
            const lineOffset = 14;
            const fmt =
                /(?<type>^\w+) SHADER ERROR: 0:(?<line>\d+): (?<msg>.+)/;
            const match = getErrorMessage(e).match(fmt);
            const line = Number(match.groups.line) - lineOffset;
            const msg = match.groups.msg.trim();
            const ty = match.groups.type.toLowerCase();
            throw new Error(`${ty} shader line ${line}: ${msg}`);
        }
    }

    function makeFont(
        tex: Texture,
        gw: number,
        gh: number,
        chars: string,
    ): GfxFont {
        const cols = tex.width / gw;
        const map: Record<string, Quad> = {};
        const charMap = chars.split("").entries();

        for (const [i, ch] of charMap) {
            map[ch] = new Quad(
                (i % cols) * gw,
                Math.floor(i / cols) * gh,
                gw,
                gh,
            );
        }

        return {
            tex: tex,
            map: map,
            size: gh,
        };
    }

    // TODO: expose
    function drawRaw(
        verts: Vertex[],
        indices: number[],
        fixed: boolean,
        tex: Texture = gfx.defTex,
        shaderSrc: RenderProps["shader"] = gfx.defShader,
        uniform: Uniform = {},
    ) {
        const shader = resolveShader(shaderSrc);

        if (!shader || shader instanceof Asset) {
            return;
        }

        const transform = (gfx.fixed || fixed)
            ? gfx.transform
            : game.cam.transform.mult(gfx.transform);

        const vv = [];

        for (const v of verts) {
            // normalized world space coordinate [-1.0 ~ 1.0]
            const pt = screen2ndc(transform.multVec2(v.pos));
            vv.push(
                pt.x,
                pt.y,
                v.uv.x,
                v.uv.y,
                v.color.r / 255,
                v.color.g / 255,
                v.color.b / 255,
                v.opacity,
            );
        }

        gfx.renderer.push(gl.TRIANGLES, vv, indices, shader, tex, uniform);
    }

    // draw all batched shapes
    function flush() {
        gfx.renderer.flush();
    }

    // start a rendering frame, reset some states
    function frameStart() {
        // clear backbuffer
        gl.clear(gl.COLOR_BUFFER_BIT);
        gfx.frameBuffer.bind();
        // clear framebuffer
        gl.clear(gl.COLOR_BUFFER_BIT);

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
        gfx.transformStack.length = 0;
        gfx.transform = new Mat4();
    }

    function usePostEffect(name: string, uniform?: Uniform | (() => Uniform)) {
        gfx.postShader = name;
        gfx.postShaderUniform = uniform ?? null;
    }

    function frameEnd() {
        // TODO: don't render debug UI with framebuffer
        // TODO: polish framebuffer rendering / sizing issues
        flush();
        gfx.lastDrawCalls = gfx.renderer.numDraws;
        gfx.frameBuffer.unbind();
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        const ow = gfx.width;
        const oh = gfx.height;
        gfx.width = gl.drawingBufferWidth / pixelDensity;
        gfx.height = gl.drawingBufferHeight / pixelDensity;

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

    // convert a screen space coordinate to webgl normalized device coordinate
    function screen2ndc(pt: Vec2): Vec2 {
        return new Vec2(
            pt.x / width() * 2 - 1,
            -pt.y / height() * 2 + 1,
        );
    }

    function pushMatrix(m: Mat4) {
        gfx.transform = m.clone();
    }

    function pushTranslate(...args: Vec2Args) {
        if (args[0] === undefined) return;
        const p = vec2(...args);
        if (p.x === 0 && p.y === 0) return;
        gfx.transform.translate(p);
    }

    function pushScale(...args: Vec2Args) {
        if (args[0] === undefined) return;
        const p = vec2(...args);
        if (p.x === 1 && p.y === 1) return;
        gfx.transform.scale(p);
    }

    function pushRotate(a: number) {
        if (!a) return;
        gfx.transform.rotate(a);
    }

    function pushTransform() {
        gfx.transformStack.push(gfx.transform.clone());
    }

    function popTransform() {
        if (gfx.transformStack.length > 0) {
            gfx.transform = gfx.transformStack.pop();
        }
    }

    // draw a uv textured quad
    function drawUVQuad(opt: DrawUVQuadOpt) {
        if (opt.width === undefined || opt.height === undefined) {
            throw new Error(
                "drawUVQuad() requires property \"width\" and \"height\".",
            );
        }

        if (opt.width <= 0 || opt.height <= 0) {
            return;
        }

        const w = opt.width;
        const h = opt.height;
        const anchor = anchorPt(opt.anchor || DEF_ANCHOR);
        const offset = anchor.scale(new Vec2(w, h).scale(-0.5));
        const q = opt.quad || new Quad(0, 0, 1, 1);
        const color = opt.color || rgb(255, 255, 255);
        const opacity = opt.opacity ?? 1;

        // apply uv padding to avoid artifacts
        const uvPadX = opt.tex ? UV_PAD / opt.tex.width : 0;
        const uvPadY = opt.tex ? UV_PAD / opt.tex.height : 0;
        const qx = q.x + uvPadX;
        const qy = q.y + uvPadY;
        const qw = q.w - uvPadX * 2;
        const qh = q.h - uvPadY * 2;

        pushTransform();
        pushTranslate(opt.pos);
        pushRotate(opt.angle);
        pushScale(opt.scale);
        pushTranslate(offset);

        drawRaw(
            [
                {
                    pos: new Vec2(-w / 2, h / 2),
                    uv: new Vec2(
                        opt.flipX ? qx + qw : qx,
                        opt.flipY ? qy : qy + qh,
                    ),
                    color: color,
                    opacity: opacity,
                },
                {
                    pos: new Vec2(-w / 2, -h / 2),
                    uv: new Vec2(
                        opt.flipX ? qx + qw : qx,
                        opt.flipY ? qy + qh : qy,
                    ),
                    color: color,
                    opacity: opacity,
                },
                {
                    pos: new Vec2(w / 2, -h / 2),
                    uv: new Vec2(
                        opt.flipX ? qx : qx + qw,
                        opt.flipY ? qy + qh : qy,
                    ),
                    color: color,
                    opacity: opacity,
                },
                {
                    pos: new Vec2(w / 2, h / 2),
                    uv: new Vec2(
                        opt.flipX ? qx : qx + qw,
                        opt.flipY ? qy : qy + qh,
                    ),
                    color: color,
                    opacity: opacity,
                },
            ],
            [0, 1, 3, 1, 2, 3],
            opt.fixed,
            opt.tex,
            opt.shader,
            opt.uniform,
        );

        popTransform();
    }

    // TODO: clean
    function drawTexture(opt: DrawTextureOpt) {
        if (!opt.tex) {
            throw new Error("drawTexture() requires property \"tex\".");
        }

        const q = opt.quad ?? new Quad(0, 0, 1, 1);
        const w = opt.tex.width * q.w;
        const h = opt.tex.height * q.h;
        const scale = new Vec2(1);

        if (opt.tiled) {
            // TODO: draw fract
            const repX = Math.ceil((opt.width || w) / w);
            const repY = Math.ceil((opt.height || h) / h);
            const anchor = anchorPt(opt.anchor || DEF_ANCHOR).add(
                new Vec2(1, 1),
            ).scale(0.5);
            const offset = anchor.scale(repX * w, repY * h);

            // TODO: rotation
            for (let i = 0; i < repX; i++) {
                for (let j = 0; j < repY; j++) {
                    drawUVQuad(Object.assign({}, opt, {
                        pos: (opt.pos || new Vec2(0)).add(
                            new Vec2(w * i, h * j),
                        ).sub(offset),
                        scale: scale.scale(opt.scale || new Vec2(1)),
                        tex: opt.tex,
                        quad: q,
                        width: w,
                        height: h,
                        anchor: "topleft",
                    }));
                }
            }
        } else {
            // TODO: should this ignore scale?
            if (opt.width && opt.height) {
                scale.x = opt.width / w;
                scale.y = opt.height / h;
            } else if (opt.width) {
                scale.x = opt.width / w;
                scale.y = scale.x;
            } else if (opt.height) {
                scale.y = opt.height / h;
                scale.x = scale.y;
            }

            drawUVQuad(Object.assign({}, opt, {
                scale: scale.scale(opt.scale || new Vec2(1)),
                tex: opt.tex,
                quad: q,
                width: w,
                height: h,
            }));
        }
    }

    function drawSprite(opt: DrawSpriteOpt) {
        if (!opt.sprite) {
            throw new Error("drawSprite() requires property \"sprite\"");
        }

        // TODO: slow
        const spr = resolveSprite(opt.sprite);

        if (!spr || !spr.data) {
            return;
        }

        const q = spr.data.frames[opt.frame ?? 0];

        if (!q) {
            throw new Error(`Frame not found: ${opt.frame ?? 0}`);
        }

        drawTexture(Object.assign({}, opt, {
            tex: spr.data.tex,
            quad: q.scale(opt.quad ?? new Quad(0, 0, 1, 1)),
        }));
    }

    // generate vertices to form an arc
    function getArcPts(
        pos: Vec2,
        radiusX: number,
        radiusY: number,
        start: number,
        end: number,
        res: number = 1,
    ): Vec2[] {
        // normalize and turn start and end angles to radians
        start = deg2rad(start % 360);
        end = deg2rad(end % 360);
        if (end <= start) end += Math.PI * 2;

        const pts = [];
        const nverts = Math.ceil((end - start) / deg2rad(8) * res);
        const step = (end - start) / nverts;

        // Rotate vector v by r nverts+1 times
        let v = vec2(Math.cos(start), Math.sin(start));
        const r = vec2(Math.cos(step), Math.sin(step));
        for (let i = 0; i <= nverts; i++) {
            pts.push(pos.add(radiusX * v.x, radiusY * v.y));
            // cos(a + b) = cos(a)cos(b) - sin(a)sin(b)
            // sin(a + b) = cos(a)sin(b) + sin(a)cos(b)
            v = vec2(v.x * r.x - v.y * r.y, v.x * r.y + v.y * r.x);
        }

        return pts;
    }

    function drawRect(opt: DrawRectOpt) {
        if (opt.width === undefined || opt.height === undefined) {
            throw new Error(
                "drawRect() requires property \"width\" and \"height\".",
            );
        }

        if (opt.width <= 0 || opt.height <= 0) {
            return;
        }

        const w = opt.width;
        const h = opt.height;
        const anchor = anchorPt(opt.anchor || DEF_ANCHOR).add(1, 1);
        const offset = anchor.scale(new Vec2(w, h).scale(-0.5));

        let pts = [
            new Vec2(0, 0),
            new Vec2(w, 0),
            new Vec2(w, h),
            new Vec2(0, h),
        ];

        // TODO: gradient for rounded rect
        // TODO: drawPolygon should handle generic rounded corners
        if (opt.radius) {
            // maximum radius is half the shortest side
            const maxRadius = Math.min(w, h) / 2;
            const r = Array.isArray(opt.radius)
                ? opt.radius.map(r => Math.min(maxRadius, r))
                : new Array(4).fill(Math.min(maxRadius, opt.radius));

            pts = [
                new Vec2(r[0], 0),
                ...(r[1]
                    ? getArcPts(new Vec2(w - r[1], r[1]), r[1], r[1], 270, 360)
                    : [vec2(w, 0)]),
                ...(r[2]
                    ? getArcPts(new Vec2(w - r[2], h - r[2]), r[2], r[2], 0, 90)
                    : [vec2(w, h)]),
                ...(r[3]
                    ? getArcPts(new Vec2(r[3], h - r[3]), r[3], r[3], 90, 180)
                    : [vec2(0, h)]),
                ...(r[0]
                    ? getArcPts(new Vec2(r[0], r[0]), r[0], r[0], 180, 270)
                    : []),
            ];
        }

        drawPolygon(Object.assign({}, opt, {
            offset,
            pts,
            ...(opt.gradient
                ? {
                    colors: opt.horizontal
                        ? [
                            opt.gradient[0],
                            opt.gradient[1],
                            opt.gradient[1],
                            opt.gradient[0],
                        ]
                        : [
                            opt.gradient[0],
                            opt.gradient[0],
                            opt.gradient[1],
                            opt.gradient[1],
                        ],
                }
                : {}),
        }));
    }

    function drawLine(opt: DrawLineOpt) {
        const { p1, p2 } = opt;

        if (!p1 || !p2) {
            throw new Error(
                "drawLine() requires properties \"p1\" and \"p2\".",
            );
        }

        const w = opt.width || 1;

        // the displacement from the line end point to the corner point
        const dis = p2.sub(p1).unit().normal().scale(w * 0.5);

        // calculate the 4 corner points of the line polygon
        const verts = [
            p1.sub(dis),
            p1.add(dis),
            p2.add(dis),
            p2.sub(dis),
        ].map((p) => ({
            pos: new Vec2(p.x, p.y),
            uv: new Vec2(0),
            color: opt.color ?? Color.WHITE,
            opacity: opt.opacity ?? 1,
        }));

        drawRaw(
            verts,
            [0, 1, 3, 1, 2, 3],
            opt.fixed,
            gfx.defTex,
            opt.shader,
            opt.uniform,
        );
    }

    function _drawLinesBevel(opt: DrawLinesOpt) {
        const pts = opt.pts;
        const vertices = [];
        const halfWidth = (opt.width || 1) * 0.5;
        const isLoop = pts[0] === pts[pts.length - 1]
            || pts[0].eq(pts[pts.length - 1]);
        const offset = opt.pos || vec2(0, 0);
        let segment;

        if (isLoop) {
            segment = pts[0].sub(pts[pts.length - 2]);
        } else {
            segment = pts[1].sub(pts[0]);
        }

        let length = segment.len();
        let normal = segment.normal().scale(-halfWidth / length);

        let pt1;
        let pt2 = pts[0];

        if (!isLoop) {
            switch (opt.cap) {
                case "square": {
                    const dir = segment.scale(-halfWidth / length);
                    vertices.push(pt2.add(dir).add(normal));
                    vertices.push(pt2.add(dir).sub(normal));
                    break;
                }
                case "round": {
                    const n = Math.max(halfWidth, 10);
                    const angle = Math.PI / n;
                    let vector = normal.scale(-1);
                    const cs = Math.cos(angle);
                    const sn = Math.sin(angle);
                    for (let j = 0; j < n; j++) {
                        vertices.push(pt2);
                        vertices.push(pt2.sub(vector));
                        vector = vec2(
                            vector.x * cs - vector.y * sn,
                            vector.x * sn + vector.y * cs,
                        );
                    }
                }
            }
        }

        for (let i = 1; i < pts.length; i++) {
            if (pt2 === pts[i] || pt2.eq(pts[i])) continue;
            pt1 = pt2;
            pt2 = pts[i];

            const nextSegment = pt2.sub(pt1);
            const nextLength = nextSegment.len();
            const nextNormal = nextSegment.normal().scale(
                -halfWidth / nextLength,
            );

            const det = segment.cross(nextSegment);

            if (Math.abs(det) / (length * nextLength) < 0.05) {
                // Parallel
                vertices.push(pt1.add(normal));
                vertices.push(pt1.sub(normal));

                if (segment.dot(nextSegment) < 0) {
                    vertices.push(pt1.sub(normal));
                    vertices.push(pt1.add(normal));
                }

                segment = nextSegment;
                length = nextLength;
                normal = nextNormal;
                continue;
            }

            const lambda = (nextNormal.sub(normal)).cross(nextSegment) / det;
            const d = normal.add(segment.scale(lambda));

            if (det > 0) {
                vertices.push(pt1.add(d));
                vertices.push(pt1.sub(normal));
                vertices.push(pt1.add(d));
                vertices.push(pt1.sub(nextNormal));
            } else {
                vertices.push(pt1.add(normal));
                vertices.push(pt1.sub(d));
                vertices.push(pt1.add(nextNormal));
                vertices.push(pt1.sub(d));
            }

            segment = nextSegment;
            length = nextLength;
            normal = nextNormal;
        }

        if (!isLoop) {
            vertices.push(pt2.add(normal));
            vertices.push(pt2.sub(normal));
            switch (opt.cap) {
                case "square": {
                    const dir = segment.scale(halfWidth / length);
                    vertices.push(pt2.add(dir).add(normal));
                    vertices.push(pt2.add(dir).sub(normal));
                    break;
                }
                case "round": {
                    const n = Math.max(halfWidth, 10);
                    const angle = Math.PI / n;
                    let vector = normal.scale(1);
                    const cs = Math.cos(angle);
                    const sn = Math.sin(angle);
                    for (let j = 0; j < n; j++) {
                        vector = vec2(
                            vector.x * cs - vector.y * sn,
                            vector.x * sn + vector.y * cs,
                        );
                        vertices.push(pt2);
                        vertices.push(pt2.sub(vector));
                    }
                }
            }
        }

        if (vertices.length < 4) return;

        const verts = vertices.map(v => ({
            pos: offset.add(v),
            uv: vec2(),
            color: opt.color || Color.WHITE,
            opacity: opt.opacity ?? 1,
        }));

        const indices = [];
        let index = 0;
        for (let i = 0; i < vertices.length - 2; i += 2) {
            indices[index++] = i + 1;
            indices[index++] = i;
            indices[index++] = i + 2;
            indices[index++] = i + 2;
            indices[index++] = i + 3;
            indices[index++] = i + 1;
        }

        if (isLoop) {
            indices[index++] = vertices.length - 1;
            indices[index++] = vertices.length - 2;
            indices[index++] = 0;
            indices[index++] = 0;
            indices[index++] = 1;
            indices[index++] = vertices.length - 1;
        }

        drawRaw(
            verts,
            indices,
            opt.fixed,
            gfx.defTex,
            opt.shader,
            opt.uniform,
        );
    }

    function _drawLinesRound(opt: DrawLinesOpt) {
        const pts = opt.pts;
        const vertices = [];
        const halfWidth = (opt.width || 1) * 0.5;
        const isLoop = pts[0] === pts[pts.length - 1]
            || pts[0].eq(pts[pts.length - 1]);
        const offset = opt.pos || vec2(0, 0);
        let segment;

        if (isLoop) {
            segment = pts[0].sub(pts[pts.length - 2]);
        } else {
            segment = pts[1].sub(pts[0]);
        }

        let length = segment.len();
        let normal = segment.normal().scale(-halfWidth / length);

        let pt1;
        let pt2 = pts[0];

        if (!isLoop) {
            switch (opt.cap) {
                case "square": {
                    const dir = segment.scale(-halfWidth / length);
                    vertices.push(pt2.add(dir).add(normal));
                    vertices.push(pt2.add(dir).sub(normal));
                    break;
                }
                case "round": {
                    const n = Math.max(halfWidth, 10);
                    const angle = Math.PI / n;
                    let vector = normal.scale(-1);
                    const cs = Math.cos(angle);
                    const sn = Math.sin(angle);
                    for (let j = 0; j < n; j++) {
                        vertices.push(pt2);
                        vertices.push(pt2.sub(vector));
                        vector = vec2(
                            vector.x * cs - vector.y * sn,
                            vector.x * sn + vector.y * cs,
                        );
                    }
                }
            }
        }

        for (let i = 1; i < pts.length; i++) {
            if (pt2 === pts[i] || pt2.eq(pts[i])) continue;
            pt1 = pt2;
            pt2 = pts[i];

            const nextSegment = pt2.sub(pt1);
            const nextLength = nextSegment.len();
            const nextNormal = nextSegment.normal().scale(
                -halfWidth / nextLength,
            );

            const det = segment.cross(nextSegment);

            if (Math.abs(det) / (length * nextLength) < 0.05) {
                // Parallel
                vertices.push(pt1.add(normal));
                vertices.push(pt1.sub(normal));

                if (segment.dot(nextSegment) < 0) {
                    vertices.push(pt1.sub(normal));
                    vertices.push(pt1.add(normal));
                }

                segment = nextSegment;
                length = nextLength;
                normal = nextNormal;
                continue;
            }

            const lambda = (nextNormal.sub(normal)).cross(nextSegment) / det;
            const d = normal.add(segment.scale(lambda));

            if (det > 0) {
                const fixedPoint = pt1.add(d);
                const n = Math.max(halfWidth, 10);
                const angle = deg2rad(normal.angleBetween(nextNormal) / n);
                let vector = normal;
                const cs = Math.cos(angle);
                const sn = Math.sin(angle);
                for (let j = 0; j < n; j++) {
                    vertices.push(fixedPoint);
                    vertices.push(pt1.sub(vector));
                    vector = vec2(
                        vector.x * cs - vector.y * sn,
                        vector.x * sn + vector.y * cs,
                    );
                }
            } else {
                const fixedPoint = pt1.sub(d);
                const n = Math.max(halfWidth, 10);
                const angle = deg2rad(normal.angleBetween(nextNormal) / n);
                let vector = normal;
                const cs = Math.cos(angle);
                const sn = Math.sin(angle);
                for (let j = 0; j < n; j++) {
                    vertices.push(pt1.add(vector));
                    vertices.push(fixedPoint);
                    vector = vec2(
                        vector.x * cs - vector.y * sn,
                        vector.x * sn + vector.y * cs,
                    );
                }
            }

            segment = nextSegment;
            length = nextLength;
            normal = nextNormal;
        }

        if (!isLoop) {
            vertices.push(pt2.add(normal));
            vertices.push(pt2.sub(normal));
            switch (opt.cap) {
                case "square": {
                    const dir = segment.scale(halfWidth / length);
                    vertices.push(pt2.add(dir).add(normal));
                    vertices.push(pt2.add(dir).sub(normal));
                    break;
                }
                case "round": {
                    const n = Math.max(halfWidth, 10);
                    const angle = Math.PI / n;
                    let vector = normal.scale(1);
                    const cs = Math.cos(angle);
                    const sn = Math.sin(angle);
                    for (let j = 0; j < n; j++) {
                        vector = vec2(
                            vector.x * cs - vector.y * sn,
                            vector.x * sn + vector.y * cs,
                        );
                        vertices.push(pt2);
                        vertices.push(pt2.sub(vector));
                    }
                }
            }
        }

        if (vertices.length < 4) return;

        const verts = vertices.map(v => ({
            pos: offset.add(v),
            uv: vec2(),
            color: opt.color || Color.WHITE,
            opacity: opt.opacity ?? 1,
        }));

        const indices = [];
        let index = 0;
        for (let i = 0; i < vertices.length - 2; i += 2) {
            indices[index++] = i + 1;
            indices[index++] = i;
            indices[index++] = i + 2;
            indices[index++] = i + 2;
            indices[index++] = i + 3;
            indices[index++] = i + 1;
        }

        if (isLoop) {
            indices[index++] = vertices.length - 1;
            indices[index++] = vertices.length - 2;
            indices[index++] = 0;
            indices[index++] = 0;
            indices[index++] = 1;
            indices[index++] = vertices.length - 1;
        }

        drawRaw(
            verts,
            indices,
            opt.fixed,
            gfx.defTex,
            opt.shader,
            opt.uniform,
        );
    }

    function _drawLinesMiter(opt: DrawLinesOpt) {
        const pts = opt.pts;
        const vertices = [];
        const halfWidth = (opt.width || 1) * 0.5;
        const isLoop = pts[0] === pts[pts.length - 1]
            || pts[0].eq(pts[pts.length - 1]);
        const offset = opt.pos || vec2(0, 0);
        let segment;

        if (isLoop) {
            segment = pts[0].sub(pts[pts.length - 2]);
        } else {
            segment = pts[1].sub(pts[0]);
        }

        let length = segment.len();
        let normal = segment.normal().scale(-halfWidth / length);

        let pt1;
        let pt2 = pts[0];

        if (!isLoop) {
            switch (opt.cap) {
                case "square": {
                    const dir = segment.scale(-halfWidth / length);
                    vertices.push(pt2.add(dir).add(normal));
                    vertices.push(pt2.add(dir).sub(normal));
                    break;
                }
                case "round": {
                    const n = Math.max(halfWidth, 10);
                    const angle = Math.PI / n;
                    let vector = normal.scale(-1);
                    const cs = Math.cos(angle);
                    const sn = Math.sin(angle);
                    for (let j = 0; j < n; j++) {
                        vertices.push(pt2);
                        vertices.push(pt2.sub(vector));
                        vector = vec2(
                            vector.x * cs - vector.y * sn,
                            vector.x * sn + vector.y * cs,
                        );
                    }
                }
            }
        }

        for (let i = 1; i < pts.length; i++) {
            if (pt2 === pts[i] || pt2.eq(pts[i])) continue;
            pt1 = pt2;
            pt2 = pts[i];

            const nextSegment = pt2.sub(pt1);
            const nextLength = nextSegment.len();
            const nextNormal = nextSegment.normal().scale(
                -halfWidth / nextLength,
            );

            const det = segment.cross(nextSegment);

            if (Math.abs(det) / (length * nextLength) < 0.05) {
                // Parallel
                vertices.push(pt1.add(normal));
                vertices.push(pt1.sub(normal));

                if (segment.dot(nextSegment) < 0) {
                    vertices.push(pt1.sub(normal));
                    vertices.push(pt1.add(normal));
                }

                segment = nextSegment;
                length = nextLength;
                normal = nextNormal;
                continue;
            }

            const lambda = (nextNormal.sub(normal)).cross(nextSegment) / det;
            const d = normal.add(segment.scale(lambda));

            vertices.push(pt1.add(d));
            vertices.push(pt1.sub(d));

            segment = nextSegment;
            length = nextLength;
            normal = nextNormal;
        }

        if (!isLoop) {
            vertices.push(pt2.add(normal));
            vertices.push(pt2.sub(normal));
            switch (opt.cap) {
                case "square": {
                    const dir = segment.scale(halfWidth / length);
                    vertices.push(pt2.add(dir).add(normal));
                    vertices.push(pt2.add(dir).sub(normal));
                    break;
                }
                case "round": {
                    const n = Math.max(halfWidth, 10);
                    const angle = Math.PI / n;
                    let vector = normal.scale(1);
                    const cs = Math.cos(angle);
                    const sn = Math.sin(angle);
                    for (let j = 0; j < n; j++) {
                        vector = vec2(
                            vector.x * cs - vector.y * sn,
                            vector.x * sn + vector.y * cs,
                        );
                        vertices.push(pt2);
                        vertices.push(pt2.sub(vector));
                    }
                }
            }
        }

        if (vertices.length < 4) return;

        const verts = vertices.map(v => ({
            pos: offset.add(v),
            uv: vec2(),
            color: opt.color || Color.WHITE,
            opacity: opt.opacity ?? 1,
        }));

        const indices = [];
        let index = 0;
        for (let i = 0; i < vertices.length - 2; i += 2) {
            indices[index++] = i + 1;
            indices[index++] = i;
            indices[index++] = i + 2;
            indices[index++] = i + 2;
            indices[index++] = i + 3;
            indices[index++] = i + 1;
        }

        if (isLoop) {
            indices[index++] = vertices.length - 1;
            indices[index++] = vertices.length - 2;
            indices[index++] = 0;
            indices[index++] = 0;
            indices[index++] = 1;
            indices[index++] = vertices.length - 1;
        }

        drawRaw(
            verts,
            indices,
            opt.fixed,
            gfx.defTex,
            opt.shader,
            opt.uniform,
        );
    }

    function drawLines(opt: DrawLinesOpt) {
        const pts = opt.pts;

        if (!pts) {
            throw new Error("drawLines() requires property \"pts\".");
        }

        if (pts.length < 2) {
            return;
        }

        if (pts.length > 2) {
            switch (opt.join) {
                case "bevel":
                    return _drawLinesBevel(opt);
                case "round":
                    return _drawLinesRound(opt);
                case "miter":
                    return _drawLinesMiter(opt);
            }
        }

        if (opt.radius && pts.length >= 3) {
            // TODO: line joines
            // TODO: rounded vertices for arbitrary polygonic shape
            drawLine(Object.assign({}, opt, { p1: pts[0], p2: pts[1] }));

            for (let i = 1; i < pts.length - 2; i++) {
                const p1 = pts[i];
                const p2 = pts[i + 1];
                drawLine(Object.assign({}, opt, {
                    p1: p1,
                    p2: p2,
                }));
            }

            drawLine(Object.assign({}, opt, {
                p1: pts[pts.length - 2],
                p2: pts[pts.length - 1],
            }));
        } else {
            for (let i = 0; i < pts.length - 1; i++) {
                drawLine(Object.assign({}, opt, {
                    p1: pts[i],
                    p2: pts[i + 1],
                }));
                // TODO: other line join types
                if (opt.join !== "none") {
                    drawCircle(Object.assign({}, opt, {
                        pos: pts[i],
                        radius: opt.width / 2,
                    }));
                }
            }
        }
    }

    function drawCurve(curve: (t: number) => Vec2, opt: DrawCurveOpt) {
        const segments = opt.segments ?? 16;
        const p: Vec2[] = [];
        for (let i = 0; i <= segments; i++) {
            p.push(curve(i / segments));
        }
        drawLines({
            pts: p,
            width: opt.width || 1,
            pos: opt.pos,
            color: opt.color,
            opacity: opt.opacity,
        });
    }

    function drawBezier(opt: DrawBezierOpt) {
        drawCurve(
            t => evaluateBezier(opt.pt1, opt.pt2, opt.pt3, opt.pt4, t),
            opt,
        );
    }

    function drawTriangle(opt: DrawTriangleOpt) {
        if (!opt.p1 || !opt.p2 || !opt.p3) {
            throw new Error(
                "drawTriangle() requires properties \"p1\", \"p2\" and \"p3\".",
            );
        }
        return drawPolygon(Object.assign({}, opt, {
            pts: [opt.p1, opt.p2, opt.p3],
        }));
    }

    function drawCircle(opt: DrawCircleOpt) {
        if (typeof opt.radius !== "number") {
            throw new Error("drawCircle() requires property \"radius\".");
        }

        if (opt.radius === 0) {
            return;
        }

        drawEllipse(Object.assign({}, opt, {
            radiusX: opt.radius,
            radiusY: opt.radius,
            angle: 0,
        }));
    }

    function drawEllipse(opt: DrawEllipseOpt) {
        if (opt.radiusX === undefined || opt.radiusY === undefined) {
            throw new Error(
                "drawEllipse() requires properties \"radiusX\" and \"radiusY\".",
            );
        }

        if (opt.radiusX === 0 || opt.radiusY === 0) {
            return;
        }

        const start = opt.start ?? 0;
        const end = opt.end ?? 360;
        const offset = anchorPt(opt.anchor ?? "center").scale(
            new Vec2(-opt.radiusX, -opt.radiusY),
        );

        const pts = getArcPts(
            offset,
            opt.radiusX,
            opt.radiusY,
            start,
            end,
            opt.resolution,
        );

        // center
        pts.unshift(offset);

        const polyOpt = Object.assign({}, opt, {
            pts,
            radius: 0,
            ...(opt.gradient
                ? {
                    colors: [
                        opt.gradient[0],
                        ...Array(pts.length - 1).fill(opt.gradient[1]),
                    ],
                }
                : {}),
        });

        // full circle with outline shouldn't have the center point
        if (end - start >= 360 && opt.outline) {
            if (opt.fill !== false) {
                drawPolygon(Object.assign({}, polyOpt, {
                    outline: null,
                }));
            }
            drawPolygon(Object.assign({}, polyOpt, {
                pts: pts.slice(1),
                fill: false,
            }));
            return;
        }

        drawPolygon(polyOpt);
    }

    function drawPolygon(opt: DrawPolygonOpt) {
        if (!opt.pts) {
            throw new Error("drawPolygon() requires property \"pts\".");
        }

        const npts = opt.pts.length;

        if (npts < 3) {
            return;
        }

        pushTransform();
        pushTranslate(opt.pos);
        pushScale(opt.scale);
        pushRotate(opt.angle);
        pushTranslate(opt.offset);

        if (opt.fill !== false) {
            const color = opt.color ?? Color.WHITE;

            const verts = opt.pts.map((pt, i) => ({
                pos: new Vec2(pt.x, pt.y),
                uv: opt.uv
                    ? opt.uv[i]
                    : new Vec2(0, 0),
                color: opt.colors
                    ? (opt.colors[i] ? opt.colors[i].mult(color) : color)
                    : color,
                opacity: opt.opacity ?? 1,
            }));

            let indices;

            if (opt.triangulate /* && !isConvex(opt.pts)*/) {
                const triangles = triangulate(opt.pts);
                // TODO rewrite triangulate to just return new indices
                indices = triangles.map(t => t.map(p => opt.pts.indexOf(p)))
                    .flat();
            } else {
                indices = [...Array(npts - 2).keys()]
                    .map((n) => [0, n + 1, n + 2])
                    .flat();
            }

            drawRaw(
                verts,
                opt.indices ?? indices,
                opt.fixed,
                opt.uv ? opt.tex : gfx.defTex,
                opt.shader,
                opt.uniform,
            );
        }

        if (opt.outline) {
            drawLines({
                pts: [...opt.pts, opt.pts[0]],
                radius: opt.radius,
                width: opt.outline.width,
                color: opt.outline.color,
                join: opt.outline.join,
                uniform: opt.uniform,
                fixed: opt.fixed,
                opacity: opt.opacity ?? opt.outline.opacity,
            });
        }

        popTransform();
    }

    function drawStenciled(
        content: () => void,
        mask: () => void,
        test: number,
    ) {
        flush();
        gl.clear(gl.STENCIL_BUFFER_BIT);
        gl.enable(gl.STENCIL_TEST);

        // don't perform test, pure write
        gl.stencilFunc(
            gl.NEVER,
            1,
            0xFF,
        );

        // always replace since we're writing to the buffer
        gl.stencilOp(
            gl.REPLACE,
            gl.REPLACE,
            gl.REPLACE,
        );

        mask();
        flush();

        // perform test
        gl.stencilFunc(
            test,
            1,
            0xFF,
        );

        // don't write since we're only testing
        gl.stencilOp(
            gl.KEEP,
            gl.KEEP,
            gl.KEEP,
        );

        content();
        flush();
        gl.disable(gl.STENCIL_TEST);
    }

    function drawMasked(content: () => void, mask: () => void) {
        drawStenciled(content, mask, gl.EQUAL);
    }

    function drawSubtracted(content: () => void, mask: () => void) {
        drawStenciled(content, mask, gl.NOTEQUAL);
    }

    function getViewportScale() {
        return (gfx.viewport.width + gfx.viewport.height)
            / (gfx.width + gfx.height);
    }

    function drawUnscaled(content: () => void) {
        flush();
        const ow = gfx.width;
        const oh = gfx.height;
        gfx.width = gfx.viewport.width;
        gfx.height = gfx.viewport.height;
        content();
        flush();
        gfx.width = ow;
        gfx.height = oh;
    }

    function applyCharTransform(fchar: FormattedChar, tr: CharTransform) {
        if (tr.pos) fchar.pos = fchar.pos.add(tr.pos);
        if (tr.scale) fchar.scale = fchar.scale.scale(vec2(tr.scale));
        if (tr.angle) fchar.angle += tr.angle;
        if (tr.color && fchar.ch.length === 1) {
            fchar.color = fchar.color.mult(tr.color);
        }
        if (tr.opacity) fchar.opacity *= tr.opacity;
    }

    // TODO: handle nested
    function compileStyledText(text: string): {
        charStyleMap: Record<number, string[]>;
        text: string;
    } {
        const charStyleMap = {};
        // get the text without the styling syntax
        const renderText = text.replace(TEXT_STYLE_RE, "$2");
        let idxOffset = 0;

        // put each styled char index into a map for easy access when iterating each char
        for (const match of text.matchAll(TEXT_STYLE_RE)) {
            const origIdx = match.index - idxOffset;
            for (let i = 0; i < match.groups.text.length; i++) {
                charStyleMap[i + origIdx] = [match.groups.style];
            }
            // omit the style syntax in format string when calculating index
            idxOffset += match[0].length - match.groups.text.length;
        }

        return {
            charStyleMap: charStyleMap,
            text: renderText,
        };
    }

    type FontAtlas = {
        font: BitmapFontData;
        cursor: Vec2;
        outline: Outline | null;
    };

    const fontAtlases: Record<string, FontAtlas> = {};

    // TODO: cache formatted text
    // format text and return a list of chars with their calculated position
    function formatText(opt: DrawTextOpt): FormattedText {
        if (opt.text === undefined) {
            throw new Error("formatText() requires property \"text\".");
        }

        let font = resolveFont(opt.font);

        // if it's still loading
        if (opt.text === "" || font instanceof Asset || !font) {
            return {
                width: 0,
                height: 0,
                chars: [],
                opt: opt,
            };
        }

        const { charStyleMap, text } = compileStyledText(opt.text + "");
        const chars = runes(text);

        // if it's not bitmap font, we draw it with 2d canvas or use cached image
        if (font instanceof FontData || typeof font === "string") {
            const fontName = font instanceof FontData
                ? font.fontface.family
                : font;
            const opts: {
                outline: Outline | null;
                filter: TexFilter;
            } = font instanceof FontData
                ? {
                    outline: font.outline,
                    filter: font.filter,
                }
                : {
                    outline: null,
                    filter: DEF_FONT_FILTER,
                };

            // TODO: customizable font tex filter
            const atlas: FontAtlas = fontAtlases[fontName] ?? {
                font: {
                    tex: new Texture(ggl, FONT_ATLAS_WIDTH, FONT_ATLAS_HEIGHT, {
                        filter: opts.filter,
                    }),
                    map: {},
                    size: DEF_TEXT_CACHE_SIZE,
                },
                cursor: new Vec2(0),
                outline: opts.outline,
            };

            if (!fontAtlases[fontName]) {
                fontAtlases[fontName] = atlas;
            }

            font = atlas.font;

            for (const ch of chars) {
                if (!atlas.font.map[ch]) {
                    // TODO: use assets.packer to pack font texture
                    const c2d = fontCacheC2d;
                    c2d.clearRect(
                        0,
                        0,
                        fontCacheCanvas.width,
                        fontCacheCanvas.height,
                    );
                    c2d.font = `${font.size}px ${fontName}`;
                    c2d.textBaseline = "top";
                    c2d.textAlign = "left";
                    c2d.fillStyle = "#ffffff";
                    const m = c2d.measureText(ch);
                    let w = Math.ceil(m.width);
                    if (!w) continue;
                    let h = font.size;
                    if (atlas.outline) {
                        c2d.lineJoin = "round";
                        c2d.lineWidth = atlas.outline.width * 2;
                        c2d.strokeStyle = atlas.outline.color.toHex();
                        c2d.strokeText(
                            ch,
                            atlas.outline.width,
                            atlas.outline.width,
                        );
                        w += atlas.outline.width * 2;
                        h += atlas.outline.width * 3;
                    }
                    c2d.fillText(
                        ch,
                        atlas.outline?.width ?? 0,
                        atlas.outline?.width ?? 0,
                    );

                    const img = c2d.getImageData(0, 0, w, h);

                    // if we are about to exceed the X axis of the texture, go to another line
                    if (atlas.cursor.x + w > FONT_ATLAS_WIDTH) {
                        atlas.cursor.x = 0;
                        atlas.cursor.y += h;
                        if (atlas.cursor.y > FONT_ATLAS_HEIGHT) {
                            // TODO: create another atlas
                            throw new Error(
                                "Font atlas exceeds character limit",
                            );
                        }
                    }

                    font.tex.update(img, atlas.cursor.x, atlas.cursor.y);
                    font.map[ch] = new Quad(
                        atlas.cursor.x,
                        atlas.cursor.y,
                        w,
                        h,
                    );
                    atlas.cursor.x += w;
                }
            }
        }

        const size = opt.size || font.size;
        const scale = vec2(opt.scale ?? 1).scale(size / font.size);
        const lineSpacing = opt.lineSpacing ?? 0;
        const letterSpacing = opt.letterSpacing ?? 0;
        let curX = 0;
        let tw = 0;
        let th = 0;
        const lines: Array<{
            width: number;
            chars: FormattedChar[];
        }> = [];
        let curLine: FormattedChar[] = [];
        let cursor = 0;
        let lastSpace = null;
        let lastSpaceWidth = null;

        // TODO: word break
        while (cursor < chars.length) {
            let ch = chars[cursor];

            // always new line on '\n'
            if (ch === "\n") {
                th += size + lineSpacing;

                lines.push({
                    width: curX - letterSpacing,
                    chars: curLine,
                });

                lastSpace = null;
                lastSpaceWidth = null;
                curX = 0;
                curLine = [];
            } else {
                let q = font.map[ch];

                // TODO: leave space if character not found?
                if (q) {
                    let gw = q.w * scale.x;

                    if (opt.width && curX + gw > opt.width) {
                        // new line on last word if width exceeds
                        th += size + lineSpacing;
                        if (lastSpace != null) {
                            cursor -= curLine.length - lastSpace;
                            ch = chars[cursor];
                            q = font.map[ch];
                            gw = q.w * scale.x;
                            // omit trailing space
                            curLine = curLine.slice(0, lastSpace - 1);
                            curX = lastSpaceWidth;
                        }
                        lastSpace = null;
                        lastSpaceWidth = null;
                        lines.push({
                            width: curX - letterSpacing,
                            chars: curLine,
                        });
                        curX = 0;
                        curLine = [];
                    }

                    // push char
                    curLine.push({
                        tex: font.tex,
                        width: q.w,
                        height: q.h,
                        // without some padding there'll be visual artifacts on edges
                        quad: new Quad(
                            q.x / font.tex.width,
                            q.y / font.tex.height,
                            q.w / font.tex.width,
                            q.h / font.tex.height,
                        ),
                        ch: ch,
                        pos: new Vec2(curX, th),
                        opacity: opt.opacity ?? 1,
                        color: opt.color ?? Color.WHITE,
                        scale: vec2(scale),
                        angle: 0,
                    });

                    if (ch === " ") {
                        lastSpace = curLine.length;
                        lastSpaceWidth = curX;
                    }

                    curX += gw;
                    tw = Math.max(tw, curX);
                    curX += letterSpacing;
                }
            }

            cursor++;
        }

        lines.push({
            width: curX - letterSpacing,
            chars: curLine,
        });

        th += size;

        if (opt.width) {
            tw = opt.width;
        }

        const fchars: FormattedChar[] = [];

        for (let i = 0; i < lines.length; i++) {
            const ox = (tw - lines[i].width) * alignPt(opt.align ?? "left");

            for (const fchar of lines[i].chars) {
                const q = font.map[fchar.ch];
                const idx = fchars.length + i;

                fchar.pos = fchar.pos.add(ox, 0).add(
                    q.w * scale.x * 0.5,
                    q.h * scale.y * 0.5,
                );

                if (opt.transform) {
                    const tr = typeof opt.transform === "function"
                        ? opt.transform(idx, fchar.ch)
                        : opt.transform;
                    if (tr) {
                        applyCharTransform(fchar, tr);
                    }
                }

                if (charStyleMap[idx]) {
                    const styles = charStyleMap[idx];
                    for (const name of styles) {
                        const style = opt.styles[name];
                        const tr = typeof style === "function"
                            ? style(idx, fchar.ch)
                            : style;
                        if (tr) {
                            applyCharTransform(fchar, tr);
                        }
                    }
                }

                fchars.push(fchar);
            }
        }

        return {
            width: tw,
            height: th,
            chars: fchars,
            opt: opt,
        };
    }

    function drawText(opt: DrawTextOpt) {
        drawFormattedText(formatText(opt));
    }

    function drawFormattedText(ftext: FormattedText) {
        pushTransform();
        pushTranslate(ftext.opt.pos);
        pushRotate(ftext.opt.angle);
        pushTranslate(
            anchorPt(ftext.opt.anchor ?? "topleft").add(1, 1).scale(
                ftext.width,
                ftext.height,
            ).scale(-0.5),
        );
        ftext.chars.forEach((ch) => {
            drawUVQuad({
                tex: ch.tex,
                width: ch.width,
                height: ch.height,
                pos: ch.pos,
                scale: ch.scale,
                angle: ch.angle,
                color: ch.color,
                opacity: ch.opacity,
                quad: ch.quad,
                anchor: "center",
                uniform: ftext.opt.uniform,
                shader: ftext.opt.shader,
                fixed: ftext.opt.fixed,
            });
        });
        popTransform();
    }

    // get game width
    function width(): number {
        return gfx.width;
    }

    // get game height
    function height(): number {
        return gfx.height;
    }

    // get game root
    function getTreeRoot(): GameObj {
        return game.root;
    }

    // transform a point from window space to content space
    function windowToContent(pt: Vec2) {
        return new Vec2(
            (pt.x - gfx.viewport.x) * width() / gfx.viewport.width,
            (pt.y - gfx.viewport.y) * height() / gfx.viewport.height,
        );
    }

    // transform a point from content space to view space
    function contentToView(pt: Vec2) {
        return new Vec2(
            pt.x * gfx.viewport.width / gfx.width,
            pt.y * gfx.viewport.height / gfx.height,
        );
    }

    function mousePos() {
        return windowToContent(app.mousePos());
    }

    let debugPaused = false;

    const debug: Debug = {
        inspect: false,
        timeScale: 1,
        showLog: true,
        fps: () => app.fps(),
        numFrames: () => app.numFrames(),
        stepFrame: updateFrame,
        drawCalls: () => gfx.lastDrawCalls,
        clearLog: () => game.logs = [],
        log: (msg) => {
            const max = gopt.logMax ?? LOG_MAX;
            game.logs.unshift({
                msg: msg,
                time: app.time(),
            });
            if (game.logs.length > max) {
                game.logs = game.logs.slice(0, max);
            }
        },
        error: (msg) =>
            debug.log(new Error(msg.toString ? msg.toString() : msg as string)),
        curRecording: null,
        numObjects: () => get("*", { recursive: true }).length,
        get paused() {
            return debugPaused;
        },
        set paused(v) {
            debugPaused = v;
            if (v) {
                audio.ctx.suspend();
            } else {
                audio.ctx.resume();
            }
        },
    };

    function dt() {
        return app.dt() * debug.timeScale;
    }

    function camPos(...pos: Vec2Args): Vec2 {
        if (pos.length > 0) {
            game.cam.pos = vec2(...pos);
        }
        return game.cam.pos ? game.cam.pos.clone() : center();
    }

    function camScale(...scale: Vec2Args): Vec2 {
        if (scale.length > 0) {
            game.cam.scale = vec2(...scale);
        }
        return game.cam.scale.clone();
    }

    function camRot(angle: number): number {
        if (angle !== undefined) {
            game.cam.angle = angle;
        }
        return game.cam.angle;
    }

    function camFlash(
        flashColor: Color = rgb(255, 255, 255),
        fadeOutTime: number = 1,
    ) {
        let flash = add([
            rect(width(), height()),
            color(flashColor),
            opacity(1),
            fixed(),
        ]);
        let fade = flash.fadeOut(fadeOutTime);
        fade.onEnd(() => destroy(flash));
        return fade;
    }

    function camTransform(): Mat4 {
        return game.cam.transform.clone();
    }

    function shake(intensity: number = 12) {
        game.cam.shake += intensity;
    }

    function toScreen(p: Vec2): Vec2 {
        return game.cam.transform.multVec2(p);
    }

    function toWorld(p: Vec2): Vec2 {
        return game.cam.transform.invert().multVec2(p);
    }

    function calcTransform(obj: GameObj): Mat4 {
        const tr = new Mat4();
        if (obj.pos) tr.translate(obj.pos);
        if (obj.scale) tr.scale(obj.scale);
        if (obj.angle) tr.rotate(obj.angle);
        return obj.parent ? tr.mult(obj.parent.transform) : tr;
    }

    function make<T>(comps: CompList<T> = []): GameObj<T> {
        const compStates = new Map();
        const cleanups = {};
        const events = new KEventHandler();
        const inputEvents: KEventController[] = [];
        let onCurCompCleanup = null;
        let paused = false;

        // @ts-ignore
        const obj: GameObj = {
            id: uid(),
            // TODO: a nice way to hide / pause when add()-ing
            hidden: false,
            transform: new Mat4(),
            children: [],
            parent: null,

            set paused(p) {
                if (p === paused) return;
                paused = p;
                for (const e of inputEvents) {
                    e.paused = p;
                }
            },

            get paused() {
                return paused;
            },

            get tags() {
                const tags = [];
                for (const [key, value] of compStates.entries()) {
                    if (Object.keys(value).length == 1) {
                        tags.push(key);
                    }
                }
                return tags;
            },

            add<T2>(a: CompList<T2> | GameObj<T2> = []): GameObj<T2> {
                const obj = Array.isArray(a) ? make(a) : a;
                if (obj.parent) {
                    throw new Error(
                        "Cannot add a game obj that already has a parent.",
                    );
                }
                obj.parent = this;
                obj.transform = calcTransform(obj);
                this.children.push(obj);
                // TODO: trigger add for children
                obj.trigger("add", obj);
                game.events.trigger("add", obj);
                return obj;
            },

            readd(obj: GameObj): GameObj {
                const idx = this.children.indexOf(obj);
                if (idx !== -1) {
                    this.children.splice(idx, 1);
                    this.children.push(obj);
                }
                return obj;
            },

            remove(obj: GameObj): void {
                const idx = this.children.indexOf(obj);
                if (idx !== -1) {
                    obj.parent = null;
                    this.children.splice(idx, 1);
                    const trigger = (o) => {
                        o.trigger("destroy");
                        game.events.trigger("destroy", o);
                        o.children.forEach((child) => trigger(child));
                    };
                    trigger(obj);
                }
            },

            // TODO: recursive
            removeAll(tag?: Tag) {
                if (tag) {
                    this.get(tag).forEach((obj) => this.remove(obj));
                } else {
                    for (const child of [...this.children]) this.remove(child);
                }
            },

            update() {
                if (this.paused) return;
                this.children
                    /*.sort((o1, o2) => (o1.z ?? 0) - (o2.z ?? 0))*/
                    .forEach((child) => child.update());
                this.trigger("update");
            },

            draw(
                this: GameObj<
                    PosComp | ScaleComp | RotateComp | FixedComp | MaskComp
                >,
            ) {
                if (this.hidden) return;
                if (this.canvas) {
                    flush();
                    this.canvas.bind();
                }
                const f = gfx.fixed;
                if (this.fixed) gfx.fixed = true;
                pushTransform();
                pushTranslate(this.pos);
                pushScale(this.scale);
                pushRotate(this.angle);
                const children = this.children.sort((o1, o2) => {
                    const l1 = o1.layerIndex ?? game.defaultLayerIndex;
                    const l2 = o2.layerIndex ?? game.defaultLayerIndex;
                    return (l1 - l2) || (o1.z ?? 0) - (o2.z ?? 0);
                });
                // TODO: automatically don't draw if offscreen
                if (this.mask) {
                    const maskFunc = {
                        intersect: drawMasked,
                        subtract: drawSubtracted,
                    }[this.mask];
                    if (!maskFunc) {
                        throw new Error(`Invalid mask func: "${this.mask}"`);
                    }
                    maskFunc(() => {
                        children.forEach((child) => child.draw());
                    }, () => {
                        this.trigger("draw");
                    });
                } else {
                    this.trigger("draw");
                    children.forEach((child) => child.draw());
                }
                popTransform();
                gfx.fixed = f;
                if (this.canvas) {
                    flush();
                    this.canvas.unbind();
                }
            },

            drawInspect(this: GameObj<PosComp | ScaleComp | RotateComp>) {
                if (this.hidden) return;
                pushTransform();
                pushTranslate(this.pos);
                pushScale(this.scale);
                pushRotate(this.angle);
                this.children
                    /*.sort((o1, o2) => (o1.z ?? 0) - (o2.z ?? 0))*/
                    .forEach((child) => child.drawInspect());
                this.trigger("drawInspect");
                popTransform();
            },

            // use a comp, or tag
            use(comp: Comp | Tag) {
                if (!comp) {
                    return;
                }

                // class object
                if (isClass(comp)) comp = new (comp as any)(this);

                // function object
                if (typeof comp === "function") {
                    return this.use(
                        (comp as (v: any) => any)(this),
                    );
                }

                // tag
                if (typeof comp === "string") {
                    return this.use({
                        id: comp,
                    });
                }

                let gc = [];

                // clear if overwrite
                if (comp.id) {
                    this.unuse(comp.id);
                    cleanups[comp.id] = [];
                    gc = cleanups[comp.id];
                    compStates.set(comp.id, comp);
                }

                for (const k in comp) {
                    if (COMP_DESC.has(k)) {
                        continue;
                    }

                    const prop = Object.getOwnPropertyDescriptor(comp, k);

                    if (typeof prop.value === "function") {
                        comp[k] = comp[k].bind(this);
                    }

                    if (prop.set) {
                        Object.defineProperty(comp, k, {
                            set: prop.set.bind(this),
                        });
                    }

                    if (prop.get) {
                        Object.defineProperty(comp, k, {
                            get: prop.get.bind(this),
                        });
                    }

                    if (COMP_EVENTS.has(k)) {
                        // automatically clean up events created by components in add() stage
                        const func = k === "add"
                            ? () => {
                                onCurCompCleanup = (c) => gc.push(c);
                                comp[k]();
                                onCurCompCleanup = null;
                            }
                            : comp[k];
                        gc.push(this.on(k, func).cancel);
                    } else {
                        if (this[k] === undefined) {
                            // assign comp fields to game obj
                            Object.defineProperty(this, k, {
                                get: () => comp[k],
                                set: (val) => comp[k] = val,
                                configurable: true,
                                enumerable: true,
                            });
                            gc.push(() => delete this[k]);
                        } else {
                            throw new Error(
                                `Duplicate component property: "${k}"`,
                            );
                        }
                    }
                }

                // check for component dependencies
                const checkDeps = () => {
                    if (!comp.require) return;
                    for (const dep of comp.require) {
                        if (!this.c(dep)) {
                            throw new Error(
                                `Component "${comp.id}" requires component "${dep}"`,
                            );
                        }
                    }
                };

                if (comp.destroy) {
                    gc.push(comp.destroy.bind(this));
                }

                // manually trigger add event if object already exist
                if (this.exists()) {
                    checkDeps();
                    if (comp.add) {
                        onCurCompCleanup = (c) => gc.push(c);
                        comp.add.call(this);
                        onCurCompCleanup = null;
                    }
                } else {
                    if (comp.require) {
                        gc.push(this.on("add", checkDeps).cancel);
                    }
                }
            },

            unuse(id: Tag) {
                if (cleanups[id]) {
                    cleanups[id].forEach((e) => e());
                    delete cleanups[id];
                }
                if (compStates.has(id)) {
                    compStates.delete(id);
                }
            },

            c(id: Tag): Comp {
                return compStates.get(id);
            },

            get(t: Tag | Tag[], opts: GetOpt = {}): GameObj[] {
                let list: GameObj[] = opts.recursive
                    ? this.children.flatMap(function recurse(child) {
                        return [child, ...child.children.flatMap(recurse)];
                    })
                    : this.children;
                list = list.filter((child) => t ? child.is(t) : true);
                if (opts.liveUpdate) {
                    const isChild = (obj) => {
                        return opts.recursive
                            ? this.isAncestorOf(obj)
                            : obj.parent === this;
                    };
                    const events = [];
                    // TODO: handle when object add / remove tags
                    // TODO: clean up when obj destroyed
                    events.push(onAdd((obj) => {
                        if (isChild(obj) && obj.is(t)) {
                            list.push(obj);
                        }
                    }));
                    events.push(onDestroy((obj) => {
                        if (isChild(obj) && obj.is(t)) {
                            const idx = list.findIndex((o) => o.id === obj.id);
                            if (idx !== -1) {
                                list.splice(idx, 1);
                            }
                        }
                    }));
                    this.onDestroy(() => {
                        for (const ev of events) {
                            ev.cancel();
                        }
                    });
                }
                return list;
            },

            query(opt: QueryOpt) {
                const hierarchy = opt.hierarchy || "children";
                let list = [];
                switch (hierarchy) {
                    case "children":
                        list = this.children;
                        break;
                    case "siblings":
                        list = this.parent
                            ? this.parent.children.filter((o: GameObj) =>
                                o !== this
                            )
                            : [];
                        break;
                    case "ancestors":
                        let parent = this.parent;
                        while (parent) {
                            list.push(parent);
                            parent = parent.parent;
                        }
                        break;
                    case "descendants":
                        list = this.children.flatMap(
                            function recurse(child: GameObj) {
                                return [
                                    child,
                                    ...child.children.flatMap(recurse),
                                ];
                            },
                        );
                        break;
                }
                if (opt.include) {
                    const includeOp = opt.includeOp || "and";
                    if (includeOp === "and" || !Array.isArray(opt.include)) {
                        // Accept if all match
                        list = list.filter(o => o.is(opt.include));
                    } else { // includeOp == "or"
                        // Accept if some match
                        list = list.filter(o =>
                            (opt.include as string[]).some(t => o.is(t))
                        );
                    }
                }
                if (opt.exclude) {
                    const excludeOp = opt.includeOp || "and";
                    if (excludeOp === "and" || !Array.isArray(opt.include)) {
                        // Reject if all match
                        list = list.filter(o => !o.is(opt.exclude));
                    } else { // includeOp == "or"
                        // Reject if some match
                        list = list.filter(o =>
                            !(opt.exclude as string[]).some(t => o.is(t))
                        );
                    }
                }
                if (opt.visible === true) {
                    list = list.filter(o => o.visible);
                }
                if (opt.distance) {
                    if (!this.pos) {
                        throw Error(
                            "Can't do a distance query from an object without pos",
                        );
                    }
                    const distanceOp = opt.distanceOp || "near";
                    const sdist = opt.distance * opt.distance;
                    if (distanceOp === "near") {
                        list = list.filter(o =>
                            o.pos && this.pos.sdist(o.pos) <= sdist
                        );
                    } else { // distanceOp === "far"
                        list = list.filter(o =>
                            o.pos && this.pos.sdist(o.pos) > sdist
                        );
                    }
                }
                if (opt.name) {
                    list = list.filter(o => o.name === opt.name);
                }
                return list;
            },

            isAncestorOf(obj: GameObj) {
                if (!obj.parent) {
                    return false;
                }
                return obj.parent === this || this.isAncestorOf(obj.parent);
            },

            exists(): boolean {
                return game.root.isAncestorOf(this);
            },

            is(tag: Tag | Tag[]): boolean {
                if (tag === "*") {
                    return true;
                }
                if (Array.isArray(tag)) {
                    for (const t of tag) {
                        if (!this.c(t)) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return this.c(tag) != null;
                }
            },

            on(name: string, action: (...args) => void): KEventController {
                const ctrl = events.on(name, action.bind(this));
                if (onCurCompCleanup) {
                    onCurCompCleanup(() => ctrl.cancel());
                }
                return ctrl;
            },

            trigger(name: string, ...args): void {
                events.trigger(name, ...args);
                game.objEvents.trigger(name, this, ...args);
            },

            destroy() {
                if (this.parent) {
                    this.parent.remove(this);
                }
            },

            inspect() {
                const info = {};
                for (const [tag, comp] of compStates) {
                    info[tag] = comp.inspect ? comp.inspect() : null;
                }
                return info;
            },

            onAdd(cb: () => void): KEventController {
                return this.on("add", cb);
            },

            onUpdate(cb: () => void): KEventController {
                return this.on("update", cb);
            },

            onDraw(cb: () => void): KEventController {
                return this.on("draw", cb);
            },

            onDestroy(action: () => void): KEventController {
                return this.on("destroy", action);
            },

            clearEvents() {
                events.clear();
            },
        };

        const evs = [
            "onKeyPress",
            "onKeyPressRepeat",
            "onKeyDown",
            "onKeyRelease",
            "onMousePress",
            "onMouseDown",
            "onMouseRelease",
            "onMouseMove",
            "onCharInput",
            "onMouseMove",
            "onTouchStart",
            "onTouchMove",
            "onTouchEnd",
            "onScroll",
            "onGamepadButtonPress",
            "onGamepadButtonDown",
            "onGamepadButtonRelease",
            "onGamepadStick",
            "onButtonPress",
            "onButtonDown",
            "onButtonRelease",
        ] as const;

        for (const e of evs) {
            obj[e] = (...args: unknown[]) => {
                const ev = app[e as any]?.(...args);
                inputEvents.push(ev);

                // TODO: what if the game object is destroy and re-added
                obj.onDestroy(() => ev.cancel());
                return ev;
            };
        }

        for (const comp of comps) {
            obj.use(comp);
        }

        return obj as unknown as GameObj<T>;
    }

    // add an event to a tag
    function on(
        event: string,
        tag: Tag,
        cb: (obj: GameObj, ...args) => void,
    ): KEventController {
        if (!game.objEvents[event]) {
            game.objEvents[event] = new Registry();
        }
        return game.objEvents.on(event, (obj, ...args) => {
            if (obj.is(tag)) {
                cb(obj, ...args);
            }
        });
    }

    const onUpdate = overload2((action: () => void): KEventController => {
        const obj = add([{ update: action }]);
        return {
            get paused() {
                return obj.paused;
            },
            set paused(p) {
                obj.paused = p;
            },
            cancel: () => obj.destroy(),
        };
    }, (tag: Tag, action: (obj: GameObj) => void) => {
        return on("update", tag, action);
    });

    const onDraw = overload2((action: () => void): KEventController => {
        const obj = add([{ draw: action }]);
        return {
            get paused() {
                return obj.hidden;
            },
            set paused(p) {
                obj.hidden = p;
            },
            cancel: () => obj.destroy(),
        };
    }, (tag: Tag, action: (obj: GameObj) => void) => {
        return on("draw", tag, action);
    });

    const onAdd = overload2((action: (obj: GameObj) => void) => {
        return game.events.on("add", action);
    }, (tag: Tag, action: (obj: GameObj) => void) => {
        return on("add", tag, action);
    });

    const onDestroy = overload2((action: (obj: GameObj) => void) => {
        return game.events.on("destroy", action);
    }, (tag: Tag, action: (obj: GameObj) => void) => {
        return on("destroy", tag, action);
    });

    // add an event that runs with objs with t1 collides with objs with t2
    function onCollide(
        t1: Tag,
        t2: Tag,
        f: (a: GameObj, b: GameObj, col?: Collision) => void,
    ): KEventController {
        return on("collide", t1, (a, b, col) => b.is(t2) && f(a, b, col));
    }

    function onCollideUpdate(
        t1: Tag,
        t2: Tag,
        f: (a: GameObj, b: GameObj, col?: Collision) => void,
    ): KEventController {
        return on("collideUpdate", t1, (a, b, col) => b.is(t2) && f(a, b, col));
    }

    function onCollideEnd(
        t1: Tag,
        t2: Tag,
        f: (a: GameObj, b: GameObj, col?: Collision) => void,
    ): KEventController {
        return on("collideEnd", t1, (a, b, col) => b.is(t2) && f(a, b, col));
    }

    function forAllCurrentAndFuture(t: Tag, action: (obj: GameObj) => void) {
        get(t, { recursive: true }).forEach(action);
        onAdd(t, action);
    }

    const onClick = overload2((action: () => void) => {
        return app.onMousePress(action);
    }, (tag: Tag, action: (obj: GameObj) => void) => {
        const events = [];
        forAllCurrentAndFuture(tag, (obj) => {
            if (!obj.area) {
                throw new Error(
                    "onClick() requires the object to have area() component",
                );
            }
            events.push(obj.onClick(() => action(obj)));
        });
        return KEventController.join(events);
    });

    // add an event that runs once when objs with tag t is hovered
    function onHover(t: Tag, action: (obj: GameObj) => void): KEventController {
        const events = [];
        forAllCurrentAndFuture(t, (obj) => {
            if (!obj.area) {
                throw new Error(
                    "onHover() requires the object to have area() component",
                );
            }
            events.push(obj.onHover(() => action(obj)));
        });
        return KEventController.join(events);
    }

    // add an event that runs once when objs with tag t is hovered
    function onHoverUpdate(
        t: Tag,
        action: (obj: GameObj) => void,
    ): KEventController {
        const events = [];
        forAllCurrentAndFuture(t, (obj) => {
            if (!obj.area) {
                throw new Error(
                    "onHoverUpdate() requires the object to have area() component",
                );
            }
            events.push(obj.onHoverUpdate(() => action(obj)));
        });
        return KEventController.join(events);
    }

    // add an event that runs once when objs with tag t is unhovered
    function onHoverEnd(
        t: Tag,
        action: (obj: GameObj) => void,
    ): KEventController {
        const events = [];
        forAllCurrentAndFuture(t, (obj) => {
            if (!obj.area) {
                throw new Error(
                    "onHoverEnd() requires the object to have area() component",
                );
            }
            events.push(obj.onHoverEnd(() => action(obj)));
        });
        return KEventController.join(events);
    }

    function setGravity(g: number) {
        // If g > 0 use either the current direction or use (0, 1)
        // Else null
        game.gravity = g ? (game.gravity || vec2(0, 1)).unit().scale(g) : null;
    }

    function getGravity() {
        // If gravity > 0 return magnitude
        // Else 0
        return game.gravity ? game.gravity.len() : 0;
    }

    function setGravityDirection(d: Vec2) {
        // If gravity > 0 keep magnitude, otherwise use 1
        game.gravity = d.unit().scale(game.gravity ? game.gravity.len() : 1);
    }

    function getGravityDirection() {
        // If gravity != null return unit vector, otherwise return (0, 1)
        return game.gravity ? game.gravity.unit() : vec2(0, 1);
    }

    function setBackground(...args) {
        if (args.length === 1 || args.length === 2) {
            gfx.bgColor = rgb(args[0]);
            if (args[1]) gfx.bgAlpha = args[1];
        } else if (args.length === 3 || args.length === 4) {
            gfx.bgColor = rgb(args[0], args[1], args[2]);
            if (args[3]) gfx.bgAlpha = args[3];
        }
        gl.clearColor(
            gfx.bgColor.r / 255,
            gfx.bgColor.g / 255,
            gfx.bgColor.b / 255,
            gfx.bgAlpha,
        );
    }

    function getBackground() {
        return gfx.bgColor.clone();
    }

    function toFixed(n: number, f: number) {
        return Number(n.toFixed(f));
    }

    function isFixed(obj: GameObj) {
        if (obj.fixed) return true;
        return obj.parent ? isFixed(obj.parent) : false;
    }

    function getRenderProps(obj: GameObj<any>) {
        return {
            color: obj.color,
            opacity: obj.opacity,
            anchor: obj.anchor,
            outline: obj.outline,
            shader: obj.shader,
            uniform: obj.uniform,
        };
    }

    function onLoad(cb: () => void): void {
        if (assets.loaded) {
            cb();
        } else {
            game.events.on("load", cb);
        }
    }

    function scene(id: SceneName, def: SceneDef) {
        game.scenes[id] = def;
    }

    function go(name: SceneName, ...args) {
        if (!game.scenes[name]) {
            throw new Error(`Scene not found: ${name}`);
        }

        game.events.onOnce("frameEnd", () => {
            game.events.trigger("sceneLeave", name);
            app.events.clear();
            game.events.clear();
            game.objEvents.clear();
            [...game.root.children].forEach((obj) => {
                if (
                    !obj.stay
                    || (obj.scenesToStay && !obj.scenesToStay.includes(name))
                ) {
                    game.root.remove(obj);
                }
            });

            game.root.clearEvents();
            initEvents();

            // cam
            game.cam = {
                pos: null,
                scale: vec2(1),
                angle: 0,
                shake: 0,
                transform: new Mat4(),
            };

            game.scenes[name](...args);
        });

        game.currentScene = name;
    }

    function onSceneLeave(
        action: (newScene?: string) => void,
    ): KEventController {
        return game.events.on("sceneLeave", action);
    }

    function getSceneName() {
        return game.currentScene;
    }

    function getData<T>(key: string, def?: T): T {
        try {
            return JSON.parse(window.localStorage[key]);
        } catch {
            if (def) {
                setData(key, def);
                return def;
            } else {
                return null;
            }
        }
    }

    function setData(key: string, data: any) {
        window.localStorage[key] = JSON.stringify(data);
    }

    function plug<T extends Record<string, any>>(
        plugin: KaboomPlugin<T>,
        ...args: any
    ): KaboomCtx & T {
        const funcs = plugin(ctx);
        let funcsObj: T;
        if (typeof funcs === "function") {
            const plugWithOptions = funcs(...args);
            funcsObj = plugWithOptions(ctx);
        } else {
            funcsObj = funcs;
        }
        for (const k in funcsObj) {
            // @ts-ignore
            ctx[k] = funcsObj[k];
            if (gopt.global !== false) {
                // @ts-ignore
                window[k] = funcsObj[k];
            }
        }
        return ctx as KaboomCtx & T;
    }

    function center(): Vec2 {
        return vec2(width() / 2, height() / 2);
    }

    enum EdgeMask {
        None = 0,
        Left = 1,
        Top = 2,
        LeftTop = 3,
        Right = 4,
        Horizontal = 5,
        RightTop = 6,
        HorizontalTop = 7,
        Bottom = 8,
        LeftBottom = 9,
        Vertical = 10,
        LeftVertical = 11,
        RightBottom = 12,
        HorizontalBottom = 13,
        RightVertical = 14,
        All = 15,
    }

    function addLevel(
        map: string[],
        opt: LevelOpt,
    ): GameObj<PosComp | LevelComp> {
        if (!opt.tileWidth || !opt.tileHeight) {
            throw new Error("Must provide tileWidth and tileHeight.");
        }

        // TODO: custom parent
        const level = add([
            pos(opt.pos ?? vec2(0)),
        ]) as GameObj<PosComp | LevelComp>;

        const numRows = map.length;
        let numColumns = 0;

        // The spatial map keeps track of the objects at each location
        let spatialMap: GameObj[][] | null = null;
        let costMap: number[] | null = null;
        let edgeMap: number[] | null = null;
        let connectivityMap: number[] | null = null;

        const tile2Hash = (tilePos: Vec2) => tilePos.x + tilePos.y * numColumns;
        const hash2Tile = (hash: number) =>
            vec2(
                Math.floor(hash % numColumns),
                Math.floor(hash / numColumns),
            );

        const createSpatialMap = () => {
            spatialMap = [];
            for (const child of level.children) {
                insertIntoSpatialMap(child);
            }
        };

        const insertIntoSpatialMap = (obj: GameObj) => {
            const i = tile2Hash(obj.tilePos);
            if (spatialMap[i]) {
                spatialMap[i].push(obj);
            } else {
                spatialMap[i] = [obj];
            }
        };

        const removeFromSpatialMap = (obj: GameObj) => {
            const i = tile2Hash(obj.tilePos);
            if (spatialMap[i]) {
                const index = spatialMap[i].indexOf(obj);
                if (index >= 0) {
                    spatialMap[i].splice(index, 1);
                }
            }
        };

        const updateSpatialMap = () => {
            let spatialMapChanged = false;
            for (const child of level.children) {
                const tilePos = level.pos2Tile(child.pos);
                if (
                    child.tilePos.x != tilePos.x || child.tilePos.y != tilePos.y
                ) {
                    spatialMapChanged = true;
                    removeFromSpatialMap(child);
                    child.tilePos.x = tilePos.x;
                    child.tilePos.y = tilePos.y;
                    insertIntoSpatialMap(child);
                }
            }
            if (spatialMapChanged) {
                level.trigger("spatial_map_changed");
            }
        };

        // The obstacle map tells which tiles are accessible
        // Cost: accessible with cost
        // Infinite: inaccessible
        const createCostMap = () => {
            const spatialMap = level.getSpatialMap();
            const size = level.numRows() * level.numColumns();
            if (!costMap) {
                costMap = new Array<number>(size);
            } else {
                costMap.length = size;
            }
            costMap.fill(1, 0, size);
            for (let i = 0; i < spatialMap.length; i++) {
                const objects = spatialMap[i];
                if (objects) {
                    let cost = 0;
                    for (const obj of objects) {
                        if (obj.isObstacle) {
                            cost = Infinity;
                            break;
                        } else {
                            cost += obj.cost;
                        }
                    }
                    costMap[i] = cost || 1;
                }
            }
        };

        // The edge map tells which edges between nodes are walkable
        const createEdgeMap = () => {
            const spatialMap = level.getSpatialMap();
            const size = level.numRows() * level.numColumns();
            if (!edgeMap) {
                edgeMap = new Array<number>(size);
            } else {
                edgeMap.length = size;
            }
            edgeMap.fill(EdgeMask.All, 0, size);
            for (let i = 0; i < spatialMap.length; i++) {
                const objects = spatialMap[i];
                if (objects) {
                    const len = objects.length;
                    let mask = EdgeMask.All;
                    for (let j = 0; j < len; j++) {
                        mask |= objects[j].edgeMask;
                    }
                    edgeMap[i] = mask;
                }
            }
        };

        // The connectivity map is used to see whether two locations are connected
        // -1: inaccesible n: connectivity group
        const createConnectivityMap = () => {
            const size = level.numRows() * level.numColumns();
            const traverse = (i: number, index: number) => {
                const frontier: number[] = [];
                frontier.push(i);
                while (frontier.length > 0) {
                    const i = frontier.pop();
                    getNeighbours(i).forEach((i) => {
                        if (connectivityMap[i] < 0) {
                            connectivityMap[i] = index;
                            frontier.push(i);
                        }
                    });
                }
            };
            if (!connectivityMap) {
                connectivityMap = new Array<number>(size);
            } else {
                connectivityMap.length = size;
            }
            connectivityMap.fill(-1, 0, size);
            let index = 0;
            for (let i = 0; i < costMap.length; i++) {
                if (connectivityMap[i] >= 0) {
                    index++;
                    continue;
                }
                traverse(i, index);
                index++;
            }
        };

        const getCost = (node: number, neighbour: number) => {
            // Cost of destination tile
            return costMap[neighbour];
        };

        const getHeuristic = (node: number, goal: number) => {
            // Euclidian distance to target
            const p1 = hash2Tile(node);
            const p2 = hash2Tile(goal);
            return p1.dist(p2);
        };

        const getNeighbours = (node: number, diagonals?: boolean) => {
            const n = [];
            const x = Math.floor(node % numColumns);
            const left = x > 0
                && (edgeMap[node] & EdgeMask.Left)
                && costMap[node - 1] !== Infinity;
            const top = node >= numColumns
                && (edgeMap[node] & EdgeMask.Top)
                && costMap[node - numColumns] !== Infinity;
            const right = x < numColumns - 1
                && (edgeMap[node] & EdgeMask.Right)
                && costMap[node + 1] !== Infinity;
            const bottom = node < numColumns * numRows - numColumns - 1
                && (edgeMap[node] & EdgeMask.Bottom)
                && costMap[node + numColumns] !== Infinity;
            if (diagonals) {
                if (left) {
                    if (top) n.push(node - numColumns - 1);
                    n.push(node - 1);
                    if (bottom) n.push(node + numColumns - 1);
                }
                if (top) {
                    n.push(node - numColumns);
                }
                if (right) {
                    if (top) n.push(node - numColumns + 1);
                    n.push(node + 1);
                    if (bottom) n.push(node + numColumns + 1);
                }
                if (bottom) {
                    n.push(node + numColumns);
                }
            } else {
                if (left) {
                    n.push(node - 1);
                }
                if (top) {
                    n.push(node - numColumns);
                }
                if (right) {
                    n.push(node + 1);
                }
                if (bottom) {
                    n.push(node + numColumns);
                }
            }
            return n;
        };

        const levelComp: LevelComp = {
            id: "level",

            tileWidth() {
                return opt.tileWidth;
            },

            tileHeight() {
                return opt.tileHeight;
            },

            spawn(
                this: GameObj<LevelComp>,
                key: string | CompList<any>,
                ...args: Vec2Args
            ): GameObj | null {
                const p = vec2(...args);

                const comps = (() => {
                    if (typeof key === "string") {
                        if (opt.tiles[key]) {
                            if (typeof opt.tiles[key] !== "function") {
                                throw new Error(
                                    "Level symbol def must be a function returning a component list",
                                );
                            }
                            return opt.tiles[key](p);
                        } else if (opt.wildcardTile) {
                            return opt.wildcardTile(key, p);
                        }
                    } else if (Array.isArray(key)) {
                        return key;
                    } else {
                        throw new Error(
                            "Expected a symbol or a component list",
                        );
                    }
                })();

                // empty tile
                if (!comps) {
                    return null;
                }

                let hasPos = false;
                let hasTile = false;

                for (const comp of comps) {
                    if (comp.id === "tile") hasTile = true;
                    if (comp.id === "pos") hasPos = true;
                }

                if (!hasPos) comps.push(pos());
                if (!hasTile) comps.push(tile());

                const obj = level.add(comps);

                if (hasPos) {
                    obj.tilePosOffset = obj.pos.clone();
                }

                obj.tilePos = p;

                if (spatialMap) {
                    insertIntoSpatialMap(obj);
                    this.trigger("spatial_map_changed");
                    this.trigger("navigation_map_invalid");
                }

                return obj;
            },

            numColumns() {
                return numColumns;
            },

            numRows() {
                return numRows;
            },

            levelWidth() {
                return numColumns * this.tileWidth();
            },

            levelHeight() {
                return numRows * this.tileHeight();
            },

            tile2Pos(...args: Vec2Args) {
                return vec2(...args).scale(this.tileWidth(), this.tileHeight());
            },

            pos2Tile(...args: Vec2Args) {
                const p = vec2(...args);
                return vec2(
                    Math.floor(p.x / this.tileWidth()),
                    Math.floor(p.y / this.tileHeight()),
                );
            },

            getSpatialMap() {
                if (!spatialMap) {
                    createSpatialMap();
                }
                return spatialMap;
            },

            onSpatialMapChanged(this: GameObj<LevelComp>, cb: () => void) {
                return this.on("spatial_map_changed", cb);
            },

            onNavigationMapInvalid(this: GameObj<LevelComp>, cb: () => void) {
                return this.on("navigation_map_invalid", cb);
            },

            getAt(tilePos: Vec2) {
                if (!spatialMap) {
                    createSpatialMap();
                }
                const hash = tile2Hash(tilePos);
                return spatialMap[hash] || [];
            },

            raycast(origin: Vec2, direction: Vec2) {
                origin = origin.scale(
                    1 / this.tileWidth(),
                    1 / this.tileHeight(),
                );
                const hit = raycastGrid(origin, direction, (tilePos: Vec2) => {
                    const tiles = this.getAt(tilePos);
                    if (tiles.some(t => t.isObstacle)) {
                        return true;
                    }
                    let minHit: RaycastResult;
                    for (const tile of tiles) {
                        if (tile.is("area")) {
                            const shape = tile.worldArea();
                            const hit = shape.raycast(origin, direction);
                            if (minHit) {
                                if (hit.fraction < minHit.fraction) {
                                    minHit = hit;
                                    minHit.object = tile;
                                }
                            } else {
                                minHit = hit;
                                minHit.object = tile;
                            }
                        }
                    }
                    return minHit || false;
                }, 64);
                if (hit) {
                    hit.point = hit.point.scale(
                        this.tileWidth(),
                        this.tileHeight(),
                    );
                }
                return hit;
            },

            update() {
                if (spatialMap) {
                    updateSpatialMap();
                }
            },

            invalidateNavigationMap() {
                costMap = null;
                edgeMap = null;
                connectivityMap = null;
            },

            onNavigationMapChanged(this: GameObj<LevelComp>, cb: () => void) {
                return this.on("navigation_map_changed", cb);
            },

            getTilePath(
                this: GameObj<LevelComp>,
                from: Vec2,
                to: Vec2,
                opts: PathFindOpt = {},
            ) {
                if (!costMap) {
                    createCostMap();
                }
                if (!edgeMap) {
                    createEdgeMap();
                }
                if (!connectivityMap) {
                    createConnectivityMap();
                }

                // Tiles are outside the grid
                if (
                    from.x < 0 || from.x >= numColumns
                    || from.y < 0 || from.y >= numRows
                ) {
                    return null;
                }
                if (
                    to.x < 0 || to.x >= numColumns
                    || to.y < 0 || to.y >= numRows
                ) {
                    return null;
                }

                const start = tile2Hash(from);
                const goal = tile2Hash(to);

                // Tiles are not accessible
                // If we test the start tile, we may get stuck
                /*if (costMap[start] === Infinity) {
                    return null
                }*/
                if (costMap[goal] === Infinity) {
                    return null;
                }

                // Same Tile, no waypoints needed
                if (start === goal) {
                    return [];
                }

                // Tiles are not within the same section
                // If we test the start tile when invalid, we may get stuck
                if (
                    connectivityMap[start] != -1
                    && connectivityMap[start] !== connectivityMap[goal]
                ) {
                    return null;
                }

                // Find a path
                interface CostNode {
                    cost: number;
                    node: number;
                }
                const frontier = new BinaryHeap<CostNode>((a, b) =>
                    a.cost < b.cost
                );
                frontier.insert({ cost: 0, node: start });

                const cameFrom = new Map<number, number>();
                cameFrom.set(start, start);
                const costSoFar = new Map<number, number>();
                costSoFar.set(start, 0);

                while (frontier.length !== 0) {
                    const current = frontier.remove()?.node;

                    if (current === goal) {
                        break;
                    }

                    const neighbours = getNeighbours(
                        current,
                        opts.allowDiagonals,
                    );
                    for (const next of neighbours) {
                        const newCost = (costSoFar.get(current) || 0)
                            + getCost(current, next)
                            + getHeuristic(next, goal);
                        if (
                            !costSoFar.has(next)
                            || newCost < costSoFar.get(next)
                        ) {
                            costSoFar.set(next, newCost);
                            frontier.insert({ cost: newCost, node: next });
                            cameFrom.set(next, current);
                        }
                    }
                }

                const path = [];
                let node = goal;
                const p = hash2Tile(node);
                path.push(p);
                while (node !== start) {
                    node = cameFrom.get(node);
                    const p = hash2Tile(node);
                    path.push(p);
                }
                return path.reverse();
            },

            getPath(
                this: GameObj<LevelComp>,
                from: Vec2,
                to: Vec2,
                opts: PathFindOpt = {},
            ) {
                const tw = this.tileWidth();
                const th = this.tileHeight();
                const path = this.getTilePath(
                    this.pos2Tile(from),
                    this.pos2Tile(to),
                    opts,
                );
                if (path) {
                    return [
                        from,
                        ...path
                            .slice(1, -1)
                            .map((tilePos) =>
                                tilePos.scale(tw, th).add(tw / 2, th / 2)
                            ),
                        to,
                    ];
                } else {
                    return null;
                }
            },
        };

        level.use(levelComp);

        level.onNavigationMapInvalid(() => {
            level.invalidateNavigationMap();
            level.trigger("navigation_map_changed");
        });

        map.forEach((row, i) => {
            const keys = row.split("");
            numColumns = Math.max(keys.length, numColumns);
            keys.forEach((key, j) => {
                level.spawn(key, vec2(j, i));
            });
        });

        return level;
    }

    type RaycastHit = BaseRaycastHit & {
        object?: GameObj;
    };

    type RaycastResult = RaycastHit | null;

    function record(frameRate?): Recording {
        const stream = app.canvas.captureStream(frameRate);
        const audioDest = audio.ctx.createMediaStreamDestination();

        audio.masterNode.connect(audioDest);

        // TODO: Enabling audio results in empty video if no audio received
        // const audioStream = audioDest.stream
        // const [firstAudioTrack] = audioStream.getAudioTracks()

        // stream.addTrack(firstAudioTrack);

        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };

        recorder.onerror = () => {
            audio.masterNode.disconnect(audioDest);
            stream.getTracks().forEach(t => t.stop());
        };

        recorder.start();

        return {
            resume() {
                recorder.resume();
            },

            pause() {
                recorder.pause();
            },

            stop(): Promise<Blob> {
                recorder.stop();
                // cleanup
                audio.masterNode.disconnect(audioDest);
                stream.getTracks().forEach(t => t.stop());
                return new Promise((resolve) => {
                    recorder.onstop = () => {
                        resolve(
                            new Blob(chunks, {
                                type: "video/mp4",
                            }),
                        );
                    };
                });
            },

            download(filename = "kaboom.mp4") {
                this.stop().then((blob) => downloadBlob(filename, blob));
            },
        };
    }

    function isFocused(): boolean {
        return document.activeElement === app.canvas;
    }

    function destroy(obj: GameObj) {
        obj.destroy();
    }

    // aliases for root game obj operations
    const add = game.root.add.bind(game.root);
    const readd = game.root.readd.bind(game.root);
    const destroyAll = game.root.removeAll.bind(game.root);
    const get = game.root.get.bind(game.root);
    const wait = game.root.wait.bind(game.root);
    const loop = game.root.loop.bind(game.root);
    const query = game.root.query.bind(game.root);
    const tween = game.root.tween.bind(game.root);
    const layers = function(layerNames: string[], defaultLayer: string) {
        if (game.layers) {
            throw Error("Layers can only be assigned once.");
        }
        const defaultLayerIndex = layerNames.indexOf(defaultLayer);
        if (defaultLayerIndex == -1) {
            throw Error(
                "The default layer name should be present in the layers list.",
            );
        }
        game.layers = layerNames;
        game.defaultLayerIndex = defaultLayerIndex;
    };

    function boom(speed: number = 2, size: number = 1): Comp {
        let time = 0;
        return {
            require: ["scale"],
            update(this: GameObj<ScaleComp>) {
                const s = Math.sin(time * speed) * size;
                if (s < 0) {
                    this.destroy();
                }
                this.scale = vec2(s);
                time += dt();
            },
        };
    }

    const kaSprite = loadSprite(null, kaSpriteSrc);
    const boomSprite = loadSprite(null, boomSpriteSrc);

    function addKaboom(p: Vec2, opt: BoomOpt = {}): GameObj {
        const kaboom = add([
            pos(p),
            stay(),
        ]);

        const speed = (opt.speed || 1) * 5;
        const s = opt.scale || 1;

        kaboom.add([
            sprite(boomSprite),
            scale(0),
            anchor("center"),
            boom(speed, s),
            ...opt.comps ?? [],
        ]);

        const ka = kaboom.add([
            sprite(kaSprite),
            scale(0),
            anchor("center"),
            timer(),
            ...opt.comps ?? [],
        ]);

        ka.wait(0.4 / speed, () => ka.use(boom(speed, s)));
        ka.onDestroy(() => kaboom.destroy());

        return kaboom;
    }

    function updateFrame() {
        // update every obj
        game.root.update();
    }

    class Collision {
        source: GameObj;
        target: GameObj;
        displacement: Vec2;
        resolved: boolean = false;
        constructor(
            source: GameObj,
            target: GameObj,
            dis: Vec2,
            resolved = false,
        ) {
            this.source = source;
            this.target = target;
            this.displacement = dis;
            this.resolved = resolved;
        }
        reverse() {
            return new Collision(
                this.target,
                this.source,
                this.displacement.scale(-1),
                this.resolved,
            );
        }
        hasOverlap() {
            return !this.displacement.isZero();
        }
        isLeft() {
            return this.displacement.cross(game.gravity || vec2(0, 1)) > 0;
        }
        isRight() {
            return this.displacement.cross(game.gravity || vec2(0, 1)) < 0;
        }
        isTop() {
            return this.displacement.dot(game.gravity || vec2(0, 1)) > 0;
        }
        isBottom() {
            return this.displacement.dot(game.gravity || vec2(0, 1)) < 0;
        }
        preventResolution() {
            this.resolved = true;
        }
    }

    function checkFrame() {
        // TODO: persistent grid?
        // start a spatial hash grid for more efficient collision detection
        const grid: Record<number, Record<number, GameObj<AreaComp>[]>> = {};
        const cellSize = gopt.hashGridSize || DEF_HASH_GRID_SIZE;

        // current transform
        let tr = new Mat4();

        // a local transform stack
        const stack = [];

        function checkObj(obj: GameObj) {
            stack.push(tr.clone());

            // Update object transform here. This will be the transform later used in rendering.
            if (obj.pos) tr.translate(obj.pos);
            if (obj.scale) tr.scale(obj.scale);
            if (obj.angle) tr.rotate(obj.angle);
            obj.transform = tr.clone();

            if (obj.c("area") && !obj.paused) {
                // TODO: only update worldArea if transform changed
                const aobj = obj as GameObj<AreaComp>;
                const area = aobj.worldArea();
                const bbox = area.bbox();

                // Get spatial hash grid coverage
                const xmin = Math.floor(bbox.pos.x / cellSize);
                const ymin = Math.floor(bbox.pos.y / cellSize);
                const xmax = Math.ceil((bbox.pos.x + bbox.width) / cellSize);
                const ymax = Math.ceil((bbox.pos.y + bbox.height) / cellSize);

                // Cache objs that are already checked
                const checked = new Set();

                // insert & check against all covered grids
                for (let x = xmin; x <= xmax; x++) {
                    for (let y = ymin; y <= ymax; y++) {
                        if (!grid[x]) {
                            grid[x] = {};
                            grid[x][y] = [aobj];
                        } else if (!grid[x][y]) {
                            grid[x][y] = [aobj];
                        } else {
                            const cell = grid[x][y];
                            check: for (const other of cell) {
                                if (other.paused) continue;
                                if (!other.exists()) continue;
                                if (checked.has(other.id)) continue;
                                for (const tag of aobj.collisionIgnore) {
                                    if (other.is(tag)) {
                                        continue check;
                                    }
                                }
                                for (const tag of other.collisionIgnore) {
                                    if (aobj.is(tag)) {
                                        continue check;
                                    }
                                }
                                // TODO: cache the world area here
                                const res = sat(
                                    aobj.worldArea(),
                                    other.worldArea(),
                                );
                                if (res) {
                                    // TODO: rehash if the object position is changed after resolution?
                                    const col1 = new Collision(
                                        aobj,
                                        other,
                                        res,
                                    );
                                    aobj.trigger("collideUpdate", other, col1);
                                    const col2 = col1.reverse();
                                    // resolution only has to happen once
                                    col2.resolved = col1.resolved;
                                    other.trigger("collideUpdate", aobj, col2);
                                }
                                checked.add(other.id);
                            }
                            cell.push(aobj);
                        }
                    }
                }
            }

            obj.children.forEach(checkObj);
            tr = stack.pop();
        }

        checkObj(game.root);
    }

    function drawFrame() {
        // calculate camera matrix
        const cam = game.cam;
        const shake = Vec2.fromAngle(rand(0, 360)).scale(cam.shake);

        cam.shake = lerp(cam.shake, 0, 5 * dt());
        cam.transform = new Mat4()
            .translate(center())
            .scale(cam.scale)
            .rotate(cam.angle)
            .translate((cam.pos ?? center()).scale(-1).add(shake));

        game.root.draw();
        flush();
    }

    function drawLoadScreen() {
        const progress = loadProgress();

        if (game.events.numListeners("loading") > 0) {
            game.events.trigger("loading", progress);
        } else {
            drawUnscaled(() => {
                const w = width() / 2;
                const h = 24;
                const pos = vec2(width() / 2, height() / 2).sub(
                    vec2(w / 2, h / 2),
                );
                drawRect({
                    pos: vec2(0),
                    width: width(),
                    height: height(),
                    color: rgb(0, 0, 0),
                });
                drawRect({
                    pos: pos,
                    width: w,
                    height: h,
                    fill: false,
                    outline: {
                        width: 4,
                    },
                });
                drawRect({
                    pos: pos,
                    width: w * progress,
                    height: h,
                });
            });
        }
    }

    function drawInspectText(pos, txt) {
        drawUnscaled(() => {
            const pad = vec2(8);

            pushTransform();
            pushTranslate(pos);

            const ftxt = formatText({
                text: txt,
                font: DBG_FONT,
                size: 16,
                pos: pad,
                color: rgb(255, 255, 255),
                fixed: true,
            });

            const bw = ftxt.width + pad.x * 2;
            const bh = ftxt.height + pad.x * 2;

            if (pos.x + bw >= width()) {
                pushTranslate(vec2(-bw, 0));
            }

            if (pos.y + bh >= height()) {
                pushTranslate(vec2(0, -bh));
            }

            drawRect({
                width: bw,
                height: bh,
                color: rgb(0, 0, 0),
                radius: 4,
                opacity: 0.8,
                fixed: true,
            });

            drawFormattedText(ftxt);
            popTransform();
        });
    }

    function drawDebug() {
        if (debug.inspect) {
            let inspecting = null;

            for (const obj of game.root.get("*", { recursive: true })) {
                if (obj.c("area") && obj.isHovering()) {
                    inspecting = obj;
                    break;
                }
            }

            game.root.drawInspect();

            if (inspecting) {
                const lines = [];
                const data = inspecting.inspect();

                for (const tag in data) {
                    if (data[tag]) {
                        // pushes the inspect function (eg: `sprite: "bean"`)
                        lines.push(`${data[tag]}`);
                    }

                    else {
                        // pushes only the tag (name of the component)
                        lines.push(`${tag}`);
                    }
                }

                drawInspectText(contentToView(mousePos()), lines.join("\n"));
            }

            drawInspectText(vec2(8), `FPS: ${debug.fps()}`);
        }

        if (debug.paused) {
            drawUnscaled(() => {
                // top right corner
                pushTransform();
                pushTranslate(width(), 0);
                pushTranslate(-8, 8);

                const size = 32;

                // bg
                drawRect({
                    width: size,
                    height: size,
                    anchor: "topright",
                    color: rgb(0, 0, 0),
                    opacity: 0.8,
                    radius: 4,
                    fixed: true,
                });

                // pause icon
                for (let i = 1; i <= 2; i++) {
                    drawRect({
                        width: 4,
                        height: size * 0.6,
                        anchor: "center",
                        pos: vec2(-size / 3 * i, size * 0.5),
                        color: rgb(255, 255, 255),
                        radius: 2,
                        fixed: true,
                    });
                }

                popTransform();
            });
        }

        if (debug.timeScale !== 1) {
            drawUnscaled(() => {
                // bottom right corner
                pushTransform();
                pushTranslate(width(), height());
                pushTranslate(-8, -8);

                const pad = 8;

                // format text first to get text size
                const ftxt = formatText({
                    text: debug.timeScale.toFixed(1),
                    font: DBG_FONT,
                    size: 16,
                    color: rgb(255, 255, 255),
                    pos: vec2(-pad),
                    anchor: "botright",
                    fixed: true,
                });

                // bg
                drawRect({
                    width: ftxt.width + pad * 2 + pad * 4,
                    height: ftxt.height + pad * 2,
                    anchor: "botright",
                    color: rgb(0, 0, 0),
                    opacity: 0.8,
                    radius: 4,
                    fixed: true,
                });

                // fast forward / slow down icon
                for (let i = 0; i < 2; i++) {
                    const flipped = debug.timeScale < 1;
                    drawTriangle({
                        p1: vec2(-ftxt.width - pad * (flipped ? 2 : 3.5), -pad),
                        p2: vec2(
                            -ftxt.width - pad * (flipped ? 2 : 3.5),
                            -pad - ftxt.height,
                        ),
                        p3: vec2(
                            -ftxt.width - pad * (flipped ? 3.5 : 2),
                            -pad - ftxt.height / 2,
                        ),
                        pos: vec2(-i * pad * 1 + (flipped ? -pad * 0.5 : 0), 0),
                        color: rgb(255, 255, 255),
                        fixed: true,
                    });
                }

                // text
                drawFormattedText(ftxt);

                popTransform();
            });
        }

        if (debug.curRecording) {
            drawUnscaled(() => {
                pushTransform();
                pushTranslate(0, height());
                pushTranslate(24, -24);

                drawCircle({
                    radius: 12,
                    color: rgb(255, 0, 0),
                    opacity: wave(0, 1, app.time() * 4),
                    fixed: true,
                });

                popTransform();
            });
        }

        if (debug.showLog && game.logs.length > 0) {
            drawUnscaled(() => {
                pushTransform();
                pushTranslate(0, height());
                pushTranslate(8, -8);

                const pad = 8;
                const logs = [];

                for (const log of game.logs) {
                    let str = "";
                    const style = log.msg instanceof Error ? "error" : "info";
                    str += `[time]${log.time.toFixed(2)}[/time]`;
                    str += " ";
                    str += `[${style}]${
                        log.msg?.toString ? log.msg.toString() : log.msg
                    }[/${style}]`;
                    logs.push(str);
                }

                game.logs = game.logs
                    .filter((log) =>
                        app.time() - log.time < (gopt.logTime || LOG_TIME)
                    );

                const ftext = formatText({
                    text: logs.join("\n"),
                    font: DBG_FONT,
                    pos: vec2(pad, -pad),
                    anchor: "botleft",
                    size: 16,
                    width: width() * 0.6,
                    lineSpacing: pad / 2,
                    fixed: true,
                    styles: {
                        "time": { color: rgb(127, 127, 127) },
                        "info": { color: rgb(255, 255, 255) },
                        "error": { color: rgb(255, 0, 127) },
                    },
                });

                drawRect({
                    width: ftext.width + pad * 2,
                    height: ftext.height + pad * 2,
                    anchor: "botleft",
                    color: rgb(0, 0, 0),
                    radius: 4,
                    opacity: 0.8,
                    fixed: true,
                });

                drawFormattedText(ftext);
                popTransform();
            });
        }
    }

    function onLoading(action: (progress: number) => void) {
        game.events.on("loading", action);
    }

    function onResize(action: () => void) {
        app.onResize(action);
    }

    function onError(action: (err: Error) => void) {
        game.events.on("error", action);
    }

    function handleErr(err: Error) {
        console.error(err);
        audio.ctx.suspend();

        // TODO: this should only run once
        app.run(() => {
            frameStart();

            drawUnscaled(() => {
                const pad = 32;
                const gap = 16;
                const gw = width();
                const gh = height();

                const textStyle = {
                    size: 36,
                    width: gw - pad * 2,
                    letterSpacing: 4,
                    lineSpacing: 4,
                    font: DBG_FONT,
                    fixed: true,
                };

                drawRect({
                    width: gw,
                    height: gh,
                    color: rgb(0, 0, 255),
                    fixed: true,
                });

                const title = formatText({
                    ...textStyle,
                    text: "Error",
                    pos: vec2(pad),
                    color: rgb(255, 128, 0),
                    fixed: true,
                });

                drawFormattedText(title);

                drawText({
                    ...textStyle,
                    text: err.message,
                    pos: vec2(pad, pad + title.height + gap),
                    fixed: true,
                });

                popTransform();
                game.events.trigger("error", err);
            });

            frameEnd();
        });
    }

    function onCleanup(action: () => void) {
        gc.push(action);
    }

    function quit() {
        game.events.onOnce("frameEnd", () => {
            app.quit();

            // clear canvas
            gl.clear(
                gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT
                    | gl.STENCIL_BUFFER_BIT,
            );

            // unbind everything
            const numTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

            for (let unit = 0; unit < numTextureUnits; unit++) {
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.bindTexture(gl.TEXTURE_2D, null);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            // run all scattered gc events
            ggl.destroy();
            gc.forEach((f) => f());
        });
    }

    let isFirstFrame = true;

    // main game loop
    app.run(() => {
        try {
            if (!assets.loaded) {
                if (loadProgress() === 1 && !isFirstFrame) {
                    assets.loaded = true;
                    game.events.trigger("load");
                }
            }

            if (
                !assets.loaded && gopt.loadingScreen !== false
                || isFirstFrame
            ) {
                frameStart();
                // TODO: Currently if assets are not initially loaded no updates or timers will be run, however they will run if loadingScreen is set to false. What's the desired behavior or should we make them consistent?
                drawLoadScreen();
                frameEnd();
            } else {
                if (!debug.paused) updateFrame();
                checkFrame();
                frameStart();
                drawFrame();
                if (gopt.debug !== false) drawDebug();
                frameEnd();
            }

            if (isFirstFrame) {
                isFirstFrame = false;
            }

            game.events.trigger("frameEnd");
        } catch (e) {
            handleErr(e);
        }
    });

    // update viewport based on user setting and fullscreen state
    function updateViewport() {
        // content size (scaled content size, with scale, stretch and letterbox)
        // view size (unscaled viewport size)
        // window size (will be the same as view size except letterbox mode)

        // canvas size
        const pd = pixelDensity;
        const cw = gl.drawingBufferWidth / pd;
        const ch = gl.drawingBufferHeight / pd;

        if (gopt.letterbox) {
            if (!gopt.width || !gopt.height) {
                throw new Error(
                    "Letterboxing requires width and height defined.",
                );
            }

            const rc = cw / ch;
            const rg = gopt.width / gopt.height;

            if (rc > rg) {
                const sw = ch * rg;
                const x = (cw - sw) / 2;
                gfx.viewport = {
                    x: x,
                    y: 0,
                    width: sw,
                    height: ch,
                };
            } else {
                const sh = cw / rg;
                const y = (ch - sh) / 2;
                gfx.viewport = {
                    x: 0,
                    y: y,
                    width: cw,
                    height: sh,
                };
            }

            return;
        }

        if (gopt.stretch) {
            if (!gopt.width || !gopt.height) {
                throw new Error(
                    "Stretching requires width and height defined.",
                );
            }
        }

        gfx.viewport = {
            x: 0,
            y: 0,
            width: cw,
            height: ch,
        };
    }

    function initEvents() {
        app.onHide(() => {
            if (!gopt.backgroundAudio) {
                audio.ctx.suspend();
            }
        });

        app.onShow(() => {
            if (!gopt.backgroundAudio && !debug.paused) {
                audio.ctx.resume();
            }
        });

        app.onResize(() => {
            if (app.isFullscreen()) return;
            const fixedSize = gopt.width && gopt.height;
            if (fixedSize && !gopt.stretch && !gopt.letterbox) return;
            canvas.width = canvas.offsetWidth * pixelDensity;
            canvas.height = canvas.offsetHeight * pixelDensity;
            updateViewport();
            if (!fixedSize) {
                gfx.frameBuffer.free();
                gfx.frameBuffer = new FrameBuffer(
                    ggl,
                    gl.drawingBufferWidth,
                    gl.drawingBufferHeight,
                );
                gfx.width = gl.drawingBufferWidth / pixelDensity / gscale;
                gfx.height = gl.drawingBufferHeight / pixelDensity / gscale;
            }
        });

        if (gopt.debug !== false) {
            app.onKeyPress(
                gopt.debugKey ?? "f1",
                () => debug.inspect = !debug.inspect,
            );
            app.onKeyPress("f2", () => debug.clearLog());
            app.onKeyPress("f8", () => debug.paused = !debug.paused);
            app.onKeyPress("f7", () => {
                debug.timeScale = toFixed(
                    clamp(debug.timeScale - 0.2, 0, 2),
                    1,
                );
            });
            app.onKeyPress("f9", () => {
                debug.timeScale = toFixed(
                    clamp(debug.timeScale + 0.2, 0, 2),
                    1,
                );
            });
            app.onKeyPress("f10", () => debug.stepFrame());
        }

        if (gopt.burp) {
            app.onKeyPress("b", () => burp());
        }
    }

    updateViewport();
    initEvents();

    const internalCtx = {
        kaboomCtx: ctx,
        app,
        game,
        isFixed,
        toFixed,
        getViewportScale,
        getRenderProps,
        resolveSprite,
        drawTexture,
        drawRaw,
        calcTransform,
    } satisfies InternalCtx;

    // the exported ctx handle
    ctx = {
        _k: internalCtx,
        VERSION,
        // asset load
        loadRoot,
        loadProgress,
        loadSprite,
        loadSpriteAtlas,
        loadSound,
        loadMusic,
        loadBitmapFont,
        loadFont,
        loadShader,
        loadShaderURL,
        loadAseprite,
        loadPedit,
        loadBean,
        loadJSON,
        load,
        getSprite,
        getSound,
        getFont,
        getBitmapFont,
        getShader,
        getAsset,
        Asset,
        SpriteData,
        SoundData,
        // query
        width,
        height,
        center,
        dt,
        time: app.time,
        screenshot: app.screenshot,
        record,
        isFocused,
        setCursor: app.setCursor,
        getCursor: app.getCursor,
        setCursorLocked: app.setCursorLocked,
        isCursorLocked: app.isCursorLocked,
        setFullscreen: app.setFullscreen,
        isFullscreen: app.isFullscreen,
        isTouchscreen: app.isTouchscreen,
        onLoad,
        onLoading,
        onResize,
        onGamepadConnect: app.onGamepadConnect,
        onGamepadDisconnect: app.onGamepadDisconnect,
        onError,
        onCleanup,
        // misc
        camPos,
        camScale,
        camFlash,
        camRot,
        camTransform,
        shake,
        toScreen,
        toWorld,
        setGravity,
        getGravity,
        setGravityDirection,
        getGravityDirection,
        setBackground,
        getBackground,
        getGamepads: app.getGamepads,
        // obj
        getTreeRoot,
        add,
        make,
        destroy,
        destroyAll,
        get,
        query,
        readd,
        // comps
        pos,
        scale,
        rotate,
        color,
        opacity,
        anchor,
        area,
        sprite,
        text,
        polygon,
        rect,
        circle,
        uvquad,
        outline,
        particles,
        body,
        doubleJump,
        shader,
        timer,
        fixed,
        stay,
        health,
        lifespan,
        named,
        state,
        z,
        layer,
        move,
        offscreen,
        follow,
        fadeIn,
        mask,
        drawon,
        raycast,
        tile,
        agent,
        sentry,
        patrol,
        navigation,
        // group events
        on,
        onUpdate,
        onDraw,
        onAdd,
        onDestroy,
        onClick,
        onCollide,
        onCollideUpdate,
        onCollideEnd,
        onHover,
        onHoverUpdate,
        onHoverEnd,
        // input
        onKeyDown: app.onKeyDown,
        onKeyPress: app.onKeyPress,
        onKeyPressRepeat: app.onKeyPressRepeat,
        onKeyRelease: app.onKeyRelease,
        onMouseDown: app.onMouseDown,
        onMousePress: app.onMousePress,
        onMouseRelease: app.onMouseRelease,
        onMouseMove: app.onMouseMove,
        onCharInput: app.onCharInput,
        onTouchStart: app.onTouchStart,
        onTouchMove: app.onTouchMove,
        onTouchEnd: app.onTouchEnd,
        onScroll: app.onScroll,
        onHide: app.onHide,
        onShow: app.onShow,
        onGamepadButtonDown: app.onGamepadButtonDown,
        onGamepadButtonPress: app.onGamepadButtonPress,
        onGamepadButtonRelease: app.onGamepadButtonRelease,
        onGamepadStick: app.onGamepadStick,
        onButtonPress: app.onButtonPress,
        onButtonDown: app.onButtonDown,
        onButtonRelease: app.onButtonRelease,
        mousePos: mousePos,
        mouseDeltaPos: app.mouseDeltaPos,
        isKeyDown: app.isKeyDown,
        isKeyPressed: app.isKeyPressed,
        isKeyPressedRepeat: app.isKeyPressedRepeat,
        isKeyReleased: app.isKeyReleased,
        isMouseDown: app.isMouseDown,
        isMousePressed: app.isMousePressed,
        isMouseReleased: app.isMouseReleased,
        isMouseMoved: app.isMouseMoved,
        isGamepadButtonPressed: app.isGamepadButtonPressed,
        isGamepadButtonDown: app.isGamepadButtonDown,
        isGamepadButtonReleased: app.isGamepadButtonReleased,
        getGamepadStick: app.getGamepadStick,
        isButtonPressed: app.isButtonPressed,
        isButtonDown: app.isButtonDown,
        isButtonReleased: app.isButtonReleased,
        setButton: app.setButton,
        getButton: app.getButton,
        charInputted: app.charInputted,
        // timer
        loop,
        wait,
        // audio
        play,
        volume,
        burp,
        audioCtx: audio.ctx,
        // math
        Line,
        Rect,
        Circle,
        Ellipse,
        Point,
        Polygon,
        Vec2,
        Color,
        Mat4,
        Quad,
        RNG,
        rand,
        randi,
        randSeed,
        vec2,
        rgb,
        hsl2rgb,
        quad,
        choose,
        chooseMultiple,
        shuffle,
        chance,
        lerp,
        tween,
        easings,
        map,
        mapc,
        wave,
        deg2rad,
        rad2deg,
        clamp,
        evaluateQuadratic,
        evaluateQuadraticFirstDerivative,
        evaluateQuadraticSecondDerivative,
        evaluateBezier,
        evaluateBezierFirstDerivative,
        evaluateBezierSecondDerivative,
        evaluateCatmullRom,
        evaluateCatmullRomFirstDerivative,
        curveLengthApproximation,
        normalizedCurve,
        easingSteps,
        easingLinear,
        easingCubicBezier,
        testLineLine,
        testRectRect,
        testRectLine,
        testRectPoint,
        testCirclePolygon,
        testLinePoint,
        testLineCircle,
        isConvex,
        triangulate,
        NavMesh,
        // raw draw
        drawSprite,
        drawText,
        formatText,
        drawRect,
        drawLine,
        drawLines,
        drawTriangle,
        drawCircle,
        drawEllipse,
        drawUVQuad,
        drawPolygon,
        drawCurve,
        drawBezier,
        drawFormattedText,
        drawMasked,
        drawSubtracted,
        pushTransform,
        popTransform,
        pushTranslate,
        pushScale,
        pushRotate,
        pushMatrix,
        usePostEffect,
        makeCanvas,
        // debug
        debug,
        // scene
        scene,
        getSceneName,
        go,
        onSceneLeave,
        // layers
        layers,
        // level
        addLevel,
        // storage
        getData,
        setData,
        download,
        downloadJSON,
        downloadText,
        downloadBlob,
        // plugin
        plug,
        // char sets
        ASCII_CHARS,
        // dom
        canvas: app.canvas,
        // misc
        addKaboom,
        // dirs
        LEFT: Vec2.LEFT,
        RIGHT: Vec2.RIGHT,
        UP: Vec2.UP,
        DOWN: Vec2.DOWN,
        // colors
        RED: Color.RED,
        GREEN: Color.GREEN,
        BLUE: Color.BLUE,
        YELLOW: Color.YELLOW,
        MAGENTA: Color.MAGENTA,
        CYAN: Color.CYAN,
        WHITE: Color.WHITE,
        BLACK: Color.BLACK,
        quit,
        // helpers
        KEvent: KEvent,
        KEventHandler: KEventHandler,
        KEventController: KEventController,
    };

    if (gopt.plugins) {
        gopt.plugins.forEach(plug);
    }

    // export everything to window if global is set
    if (gopt.global !== false) {
        for (const k in ctx) {
            window[k] = ctx[k];
        }
    }

    if (gopt.focus !== false) {
        app.canvas.focus();
    }

    return ctx as TPlugins extends [undefined]
        ? KaboomCtx<TButtons, TButtonsName>
        : KaboomCtx<TButtons, TButtonsName> & MergePlugins<TPlugins>;
};

export default kaplay;
