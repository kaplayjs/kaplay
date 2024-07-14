const VERSION = "3001.0.0";

import { type App, initApp } from "./app";
import {
    type AppGfxCtx,
    createEmptyAudioBuffer,
    drawCircle,
    drawEllipse,
    drawLine,
    drawLines,
    drawPolygon,
    drawSprite,
    drawTexture,
    drawUVQuad,
    formatText,
    FrameBuffer,
    getBitmapFont,
    getFont,
    getShader,
    height,
    initAppGfx,
    initGfx,
    makeShader,
    mousePos,
    popTransform,
    pushMatrix,
    pushRotate,
    pushScale,
    pushTransform,
    pushTranslate,
    Texture,
    width,
} from "./gfx";

import {
    Asset,
    fetchArrayBuffer,
    fetchJSON,
    fetchText,
    initAssets,
    loadImg,
    loadProgress,
} from "./gfx/assets";

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
    raycastGrid,
    type RaycastHit as BaseRaycastHit,
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
    type Vec2Args,
    wave,
} from "./math";

import { Color, type ColorArgs, hsl2rgb, rgb } from "./math/color";

import { NavMesh } from "./math/navigationmesh";

import easings from "./math/easings";

import {
    BinaryHeap,
    dataURLToArrayBuffer,
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
    toFixed,
} from "./utils/";

import { FontData } from "./assets/fonts";

import type {
    AsepriteData,
    AudioPlay,
    AudioPlayOpt,
    BitmapFontData,
    BoomOpt,
    ButtonsDef,
    Comp,
    CompList,
    Debug,
    EventController,
    GameObj,
    GfxFont,
    ImageSource,
    KaboomCtx,
    KaboomOpt,
    KaboomPlugin,
    LevelComp,
    LevelOpt,
    LoadBitmapFontOpt,
    LoadFontOpt,
    LoadSpriteOpt,
    LoadSpriteSrc,
    MergePlugins,
    MusicData,
    PathFindOpt,
    PeditFile,
    PluginList,
    Recording,
    SceneDef,
    SceneName,
    ShaderData,
    SpriteAnim,
    SpriteAtlasData,
    Tag,
    Uniform,
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
    type PosComp,
    raycast,
    rect,
    rotate,
    scale,
    type ScaleComp,
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

import beanSpriteSrc from "./assets/bean.png";
import boomSpriteSrc from "./assets/boom.png";
import burpSoundSrc from "./assets/burp.mp3";
import kaSpriteSrc from "./assets/ka.png";
import { slice, SpriteData } from "./assets/sprite";
import { type Game, initGame } from "./game/game";
import { make } from "./game/make";
import {
    drawBezier,
    drawCurve,
    drawFormattedText,
    drawMasked,
    drawSubtracted,
    drawText,
    drawTriangle,
    drawUnscaled,
} from "./gfx/draw";
import { drawRect } from "./gfx/draw/drawRect";

// for import types from package
export type * from "./types";

export let k: KaboomCtx;
export let globalOpt: KaboomOpt;
export let gfx: AppGfxCtx;
export let game: Game;
export let app: App;
export let assets: ReturnType<typeof initAssets>;
export let fontCacheCanvas: HTMLCanvasElement | null;
export let fontCacheC2d: CanvasRenderingContext2D | null;
export let debug: Debug;

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
    const canvas = gopt.canvas
        ?? root.appendChild(document.createElement("canvas"));

    // global pixel scale
    const gscale = gopt.scale ?? 1;
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

    const pixelDensity = gopt.pixelDensity || window.devicePixelRatio;

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

    class SoundData {
        buf: AudioBuffer;

        constructor(buf: AudioBuffer) {
            this.buf = buf;
        }

        static fromArrayBuffer(buf: ArrayBuffer): Promise<SoundData> {
            return new Promise((resolve, reject) =>
                audio.ctx.decodeAudioData(buf, resolve, reject)
            ).then((buf) => new SoundData(buf as AudioBuffer));
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

    function getSprite(name: string): Asset<SpriteData> | null {
        return assets.sprites.get(name) ?? null;
    }

    function getSound(name: string): Asset<SoundData> | null {
        return assets.sounds.get(name) ?? null;
    }

    function getAsset(name: string): Asset<any> | null {
        return assets.custom.get(name) ?? null;
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
            draw: (action: () => void) => {
                flush();
                fb.bind();
                action();
                flush();
                fb.unbind();
            },
        };
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

    // TODO: cache formatted text
    // format text and return a list of chars with their calculated position

    // get game root
    function getTreeRoot(): GameObj {
        return game.root;
    }

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
            k.opacity(1),
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

    function scene(id: SceneName, def: SceneDef) {
        game.scenes[id] = def;
    }

    function go(name: SceneName, ...args: unknown[]) {
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
            k.pos(opt.pos ?? vec2(0)),
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
            if (spatialMap![i]) {
                spatialMap![i].push(obj);
            } else {
                spatialMap![i] = [obj];
            }
        };

        const removeFromSpatialMap = (obj: GameObj) => {
            const i = tile2Hash(obj.tilePos);
            if (spatialMap![i]) {
                const index = spatialMap![i].indexOf(obj);
                if (index >= 0) {
                    spatialMap![i].splice(index, 1);
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
                    // TODO: Remove non-null assertion
                    const i = frontier.pop()!;

                    getNeighbours(i).forEach((i) => {
                        if (connectivityMap![i] < 0) {
                            connectivityMap![i] = index;
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
            for (let i = 0; i < costMap!.length; i++) {
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
            return costMap![neighbour];
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
                && (edgeMap![node] & EdgeMask.Left)
                && costMap![node - 1] !== Infinity;
            const top = node >= numColumns
                && (edgeMap![node] & EdgeMask.Top)
                && costMap![node - numColumns] !== Infinity;
            const right = x < numColumns - 1
                && (edgeMap![node] & EdgeMask.Right)
                && costMap![node + 1] !== Infinity;
            const bottom = node < numColumns * numRows - numColumns - 1
                && (edgeMap![node] & EdgeMask.Bottom)
                && costMap![node + numColumns] !== Infinity;
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
            ) {
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

                if (!hasPos) comps.push(k.pos());
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
                return spatialMap!;
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
                return spatialMap![hash] || [];
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
                            if (minHit!) {
                                if (hit.fraction < minHit.fraction) {
                                    minHit = hit;
                                    minHit!.object = tile;
                                }
                            } else {
                                minHit = hit;
                                minHit!.object = tile;
                            }
                        }
                    }
                    return minHit! || false;
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
                if (costMap![goal] === Infinity) {
                    return null;
                }

                // Same Tile, no waypoints needed
                if (start === goal) {
                    return [];
                }

                // Tiles are not within the same section
                // If we test the start tile when invalid, we may get stuck
                // TODO: Remove non-null assertion
                if (
                    connectivityMap![start] != -1
                    && connectivityMap![start] !== connectivityMap![goal]
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
                    // TODO: Remove non-null assertion
                    const current = frontier.remove()?.node!;

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
                            // TODO: Remove non-null assertion
                            || newCost < costSoFar.get(next)!
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
                    let cameNode = cameFrom.get(node);

                    if (!cameNode) {
                        throw new Error("Bug in pathfinding algorithm");
                    }

                    node = cameNode;

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
            k.pos(p),
            k.stay(),
        ]);

        const speed = (opt.speed || 1) * 5;
        const s = opt.scale || 1;

        kaboom.add([
            k.sprite(boomSprite),
            k.scale(0),
            k.anchor("center"),
            boom(speed, s),
            ...opt.comps ?? [],
        ]);

        const ka = kaboom.add([
            k.sprite(kaSprite),
            k.scale(0),
            k.anchor("center"),
            k.timer(),
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
function drawDebug() {
    throw new Error("Function not implemented.");
}
