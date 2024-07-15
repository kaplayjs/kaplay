const VERSION = "3001.0.0";

import {
    type App,
    camFlash,
    camPos,
    camRot,
    camScale,
    camTransform,
    initApp,
    shake,
    toScreen,
    toWorld,
} from "./app";
import {
    type AppGfxCtx,
    center,
    drawBezier,
    drawCircle,
    drawCurve,
    drawDebug,
    drawEllipse,
    drawFormattedText,
    drawFrame,
    drawLine,
    drawLines,
    drawLoadScreen,
    drawMasked,
    drawPolygon,
    drawRect,
    drawSprite,
    drawSubtracted,
    drawText,
    drawTexture,
    drawTriangle,
    drawUnscaled,
    drawUVQuad,
    flush,
    formatText,
    FrameBuffer,
    height,
    initAppGfx,
    initGfx,
    mousePos,
    popTransform,
    pushMatrix,
    pushRotate,
    pushScale,
    pushTransform,
    pushTranslate,
    updateViewport,
    width,
} from "./gfx";

import {
    Asset,
    fetchJSON,
    fetchText,
    getBitmapFont,
    getFont,
    getShader,
    getSound,
    getSprite,
    initAssets,
    loadBitmapFont,
    loadFont,
    loadImg,
    loadProgress,
    makeShader,
    type ShaderData,
    slice,
    SoundData,
    SpriteData,
    type Uniform,
} from "./assets";

import {
    ASCII_CHARS,
    BG_GRID_SIZE,
    DBG_FONT,
    DEF_HASH_GRID_SIZE,
    LOG_MAX,
    MAX_TEXT_CACHE_SIZE,
    SPRITE_ATLAS_HEIGHT,
    SPRITE_ATLAS_WIDTH,
} from "./constants";

import {
    chance,
    choose,
    chooseMultiple,
    Circle,
    clamp,
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
    Rect,
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
    wave,
} from "./math/math";

import { Color, type ColorArgs, hsl2rgb, rgb } from "./math/color";

import { NavMesh } from "./math/navigationmesh";

import easings from "./math/easings";

import {
    download,
    downloadBlob,
    downloadJSON,
    downloadText,
    getFileName,
    isDataURL,
    KEvent,
    KEventController,
    KEventHandler,
    overload2,
    Registry,
} from "./utils/";

import type {
    AsepriteData,
    ButtonsDef,
    Debug,
    EventController,
    GameObj,
    ImageSource,
    KaboomCtx,
    KaboomOpt,
    KaboomPlugin,
    LoadSpriteOpt,
    LoadSpriteSrc,
    MergePlugins,
    PeditFile,
    PluginList,
    Recording,
    SpriteAnim,
    SpriteAtlasData,
    Tag,
} from "./types";

import {
    agent,
    anchor,
    animate,
    area,
    type AreaComp,
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
    textInput,
    tile,
    timer,
    uvquad,
    z,
} from "./components";

import { dt } from "./app";
import { burp, play, volume } from "./audio";
import { type AudioCtx, initAudio } from "./audio/audio";
import {
    addKaboom,
    addLevel,
    destroy,
    getSceneName,
    getTreeRoot,
    go,
    initEvents,
    onSceneLeave,
    scene,
} from "./game";
import { type Game, initGame } from "./game/game";
import { make } from "./game/make";
import beanSpriteSrc from "./kassets/bean.png";
import boomSpriteSrc from "./kassets/boom.png";
import kaSpriteSrc from "./kassets/ka.png";

export let k: KaboomCtx;
export let globalOpt: KaboomOpt;
export let gfx: AppGfxCtx;
export let game: Game;
export let app: App;
export let assets: ReturnType<typeof initAssets>;
export let fontCacheCanvas: HTMLCanvasElement | null;
export let fontCacheC2d: CanvasRenderingContext2D | null;
export let debug: Debug;
export let audio: AudioCtx;
export let pixelDensity: number;
export let canvas: HTMLCanvasElement;
export let gscale: number;
export let kaSprite: Asset<SpriteData>;
export let boomSprite: Asset<SpriteData>;

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
    globalOpt = gopt;
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
    canvas = gopt.canvas
        ?? root.appendChild(document.createElement("canvas"));

    // global pixel scale
    gscale = gopt.scale ?? 1;
    const fixedSize = gopt.width && gopt.height && !gopt.stretch
        && !gopt.letterbox;

    // adjust canvas size according to user size / viewport settings
    if (fixedSize) {
        canvas.width = gopt.width! * gscale;
        canvas.height = gopt.height! * gscale;
    } else {
        canvas.width = canvas.parentElement!.offsetWidth;
        canvas.height = canvas.parentElement!.offsetHeight;
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

    pixelDensity = gopt.pixelDensity || window.devicePixelRatio;

    canvas.width *= pixelDensity;
    canvas.height *= pixelDensity;
    // make canvas focusable
    canvas.tabIndex = 0;

    fontCacheCanvas = document.createElement("canvas");
    fontCacheCanvas.width = MAX_TEXT_CACHE_SIZE;
    fontCacheCanvas.height = MAX_TEXT_CACHE_SIZE;
    fontCacheC2d = fontCacheCanvas.getContext("2d", {
        willReadFrequently: true,
    });

    app = initApp({
        canvas: canvas,
        touchToMouse: gopt.touchToMouse,
        gamepads: gopt.gamepads,
        pixelDensity: gopt.pixelDensity,
        maxFPS: gopt.maxFPS,
        buttons: gopt.buttons,
    });

    const gc: Array<() => void> = [];

    const canvasContext = app.canvas
        .getContext("webgl", {
            antialias: true,
            depth: true,
            stencil: true,
            alpha: true,
            preserveDrawingBuffer: true,
        });

    if (!canvasContext) throw new Error("WebGL not supported");

    const gl = canvasContext;

    const ggl = initGfx(gl, {
        texFilter: gopt.texFilter,
    });

    gfx = initAppGfx(gopt, ggl);
    audio = initAudio();
    assets = initAssets(ggl);

    function fixURL<D>(url: D): D {
        if (typeof url !== "string" || isDataURL(url)) return url;
        return assets.urlPrefix + url as D;
    }

    game = initGame();

    game.root.use(timer());

    // wrap individual loaders with global loader counter, for stuff like progress bar
    function load<T>(prom: Promise<T>): Asset<T> {
        return assets.custom.add(null, prom);
    }

    // global load path prefix
    function loadRoot(path?: string): string {
        if (path !== undefined) {
            assets.urlPrefix = path;
        }
        return assets.urlPrefix;
    }

    function loadJSON(name: string, url: string) {
        return assets.custom.add(name, fetchJSON(url));
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
                const map: Record<string, SpriteData> = {};

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
        if (!c2d) throw new Error("Failed to create canvas context");
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
                if (!c2d) throw new Error("Failed to create canvas context");

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
                const anims: Record<string, number | SpriteAnim> = {};

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
        return assets.shaders.addLoaded(name, makeShader(ggl, vert, frag));
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
                return makeShader(ggl, vcode, fcode);
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

        // TODO: assets.music should be a map
        return assets.music[name as keyof typeof assets.music] = fixURL(url);
    }

    function loadBean(name: string = "bean"): Asset<SpriteData> {
        return loadSprite(name, beanSpriteSrc);
    }

    function getAsset(name: string): Asset<any> | null {
        return assets.custom.get(name) ?? null;
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
            draw: (action: () => void) => {
                flush();
                fb.bind();
                action();
                flush();
                fb.unbind();
            },
        };
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

    // TODO: cache formatted text
    // format text and return a list of chars with their calculated position

    // get game root

    let debugPaused = false;

    debug = {
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

    // add an event to a tag
    // TODO: Implement `cb` args typing
    function on(
        event: string,
        tag: Tag,
        cb: (obj: GameObj, ...args: any[]) => void,
    ): KEventController {
        type EventKey = keyof KEventHandler<Record<string, any[]>>;
        if (!game.objEvents[<EventKey> event]) {
            game.objEvents[<EventKey> event] = new Registry() as any;
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
        const events: EventController[] = [];

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
        const events: EventController[] = [];

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
        const events: EventController[] = [];

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
        const events: EventController[] = [];

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

    function setBackground(...args: ColorArgs) {
        const color = rgb(...args);
        const alpha = args[3] ?? 1;

        gfx.bgColor = color;
        gfx.bgAlpha = alpha;

        gl.clearColor(
            color.r / 255,
            color.g / 255,
            color.b / 255,
            alpha,
        );
    }

    function getBackground() {
        return gfx.bgColor?.clone?.() ?? null;
    }

    function onLoad(cb: () => void): void {
        if (assets.loaded) {
            cb();
        } else {
            game.events.on("load", cb);
        }
    }

    function getData<T>(key: string, def?: T): T | null {
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
        const funcs = plugin(k);
        let funcsObj: T;
        if (typeof funcs === "function") {
            const plugWithOptions = funcs(...args);
            funcsObj = plugWithOptions(k);
        } else {
            funcsObj = funcs;
        }

        for (const key in funcsObj) {
            k[key as keyof typeof k] = funcsObj[key];

            if (gopt.global !== false) {
                window[key as any] = funcsObj[key];
            }
        }
        return k as KaboomCtx & T;
    }

    function record(frameRate?: number): Recording {
        const stream = app.canvas.captureStream(frameRate);
        const audioDest = audio.ctx.createMediaStreamDestination();

        audio.masterNode.connect(audioDest);

        // TODO: Enabling audio results in empty video if no audio received
        // const audioStream = audioDest.stream
        // const [firstAudioTrack] = audioStream.getAudioTracks()

        // stream.addTrack(firstAudioTrack);

        const recorder = new MediaRecorder(stream);
        const chunks: any[] = [];

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

    kaSprite = loadSprite(null, kaSpriteSrc);
    boomSprite = loadSprite(null, boomSpriteSrc);

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
        const stack: any[] = [];

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
            handleErr(e as Error);
        }
    });

    updateViewport();
    initEvents();

    // the exported ctx handle
    k = {
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
        getSound,
        getFont,
        getBitmapFont,
        getSprite,
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
        textInput,
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
        animate,
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
        KEvent,
        KEventHandler,
        KEventController,
    };

    const plugins = gopt.plugins as KaboomPlugin<Record<string, unknown>>[];

    if (plugins) {
        plugins.forEach(plug);
    }

    // export everything to window if global is set
    if (gopt.global !== false) {
        for (const key in k) {
            (<any> window[<any> key]) = k[key as keyof KaboomCtx];
        }
    }

    if (gopt.focus !== false) {
        app.canvas.focus();
    }

    return k as TPlugins extends [undefined] ? KaboomCtx<TButtons, TButtonsName>
        : KaboomCtx<TButtons, TButtonsName> & MergePlugins<TPlugins>;
};

export default kaplay;
