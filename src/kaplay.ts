// the definitive version! :bean:
const VERSION = "4000.0.0";

import { type ButtonsDef, initApp } from "./app";

import {
    appendToPicture,
    beginPicture,
    center,
    drawBezier,
    drawCanvas,
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
    drawPicture,
    drawPolygon,
    drawRect,
    drawSprite,
    drawSubtracted,
    drawText,
    drawTexture,
    drawTriangle,
    drawUnscaled,
    drawUVQuad,
    endPicture,
    flush,
    formatText,
    FrameBuffer,
    getBackground,
    height,
    initAppGfx,
    initGfx,
    mousePos,
    Picture,
    popTransform,
    pushMatrix,
    pushRotate,
    pushScaleV,
    pushTransform,
    pushTranslateV,
    setBackground,
    updateViewport,
    width,
} from "./gfx";

import {
    Asset,
    getAsset,
    getBitmapFont,
    getFailedAssets,
    getFont,
    getShader,
    getSound,
    getSprite,
    initAssets,
    load,
    loadAseprite,
    loadBean,
    loadBitmapFont,
    loadFont,
    loadHappy,
    loadJSON,
    loadMusic,
    loadPedit,
    loadProgress,
    loadRoot,
    loadShader,
    loadShaderURL,
    loadSound,
    loadSprite,
    loadSpriteAtlas,
    SoundData,
    SpriteData,
    type Uniform,
} from "./assets";

import {
    ASCII_CHARS,
    BG_GRID_SIZE,
    DBG_FONT,
    EVENT_CANCEL_SYMBOL,
    LOG_MAX,
    MAX_TEXT_CACHE_SIZE,
} from "./constants";

import {
    bezier,
    cardinal,
    catmullRom,
    chance,
    choose,
    chooseMultiple,
    Circle,
    clamp,
    clipLineToCircle,
    clipLineToRect,
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
    gjkShapeIntersection,
    gjkShapeIntersects,
    hermite,
    hsl2rgb,
    isConvex,
    kochanekBartels,
    lerp,
    Line,
    map,
    mapc,
    Mat23,
    Mat4,
    NavMesh,
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
    rgb,
    RNG,
    shuffle,
    SweepAndPrune,
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
} from "./math";

import easings from "./math/easings";

import {
    download,
    downloadBlob,
    downloadJSON,
    downloadText,
    KEvent,
    KEventController,
    KEventHandler,
} from "./utils";

import {
    BlendMode,
    type Canvas,
    type Debug,
    type GameObj,
    type KAPLAYCtx,
    type KAPLAYInternal,
    type KAPLAYOpt,
    type KAPLAYPlugin,
    type MergePlugins,
    type PluginList,
    type Recording,
} from "./types";

import {
    agent,
    anchor,
    animate,
    area,
    type AreaComp,
    areaEffector,
    blend,
    body,
    buoyancyEffector,
    circle,
    color,
    constantForce,
    doubleJump,
    drawon,
    ellipse,
    fadeIn,
    fakeMouse,
    fixed,
    follow,
    health,
    layer,
    lifespan,
    mask,
    move,
    named,
    offscreen,
    opacity,
    outline,
    particles,
    pathfinder,
    patrol,
    picture,
    platformEffector,
    pointEffector,
    polygon,
    pos,
    raycast,
    rect,
    rotate,
    scale,
    sentry,
    serializeAnimation,
    shader,
    sprite,
    state,
    stay,
    surfaceEffector,
    text,
    textInput,
    tile,
    timer,
    usesArea,
    uvquad,
    video,
    z,
} from "./components";

import { burp, getVolume, initAudio, play, setVolume, volume } from "./audio";

import {
    addKaboom,
    addLevel,
    camFlash,
    camPos,
    camRot,
    camScale,
    camTransform,
    destroy,
    flash,
    getCamPos,
    getCamRot,
    getCamScale,
    getCamTransform,
    getDefaultLayer,
    getGravity,
    getGravityDirection,
    getLayers,
    getSceneName,
    getTreeRoot,
    go,
    initEvents,
    initGame,
    KeepFlags,
    layers,
    on,
    onAdd,
    onClick,
    onCollide,
    onCollideEnd,
    onCollideUpdate,
    onDestroy,
    onDraw,
    onError,
    onFixedUpdate,
    onHover,
    onHoverEnd,
    onHoverUpdate,
    onLoad,
    onLoadError,
    onLoading,
    onResize,
    onSceneLeave,
    onTag,
    onUntag,
    onUnuse,
    onUpdate,
    onUse,
    scene,
    setCamPos,
    setCamRot,
    setCamScale,
    setGravity,
    setGravityDirection,
    setLayers,
    shake,
    toScreen,
    toWorld,
    trigger,
} from "./game";

import { startEngine } from "./core/engine";
import { getCollisionSystem } from "./ecs/systems/collision";
import { LCEvents, system } from "./game/systems";
import boomSpriteSrc from "./kassets/boom.png";
import kaSpriteSrc from "./kassets/ka.png";

// Internal data, shared between all modules
export const _k = {
    k: null,
    globalOpt: null,
    gfx: null,
    game: null,
    app: null,
    assets: null,
    fontCacheCanvas: null,
    fontCacheC2d: null,
    debug: null,
    audio: null,
    pixelDensity: null,
    canvas: null,
    gscale: null,
    kaSprite: null,
    boomSprite: null,
    handleErr: null,
    systems: [], // all systems added
    // we allocate systems
    systemsByEvent: [
        [], // afterDraw
        [], // afterFixedUpdate
        [], // afterUpdate
        [], // beforeDraw
        [], // beforeFixedUpdate
        [], // beforeUpdate
    ],
} as unknown as KAPLAYInternal;

// If KAPLAY crashed
let crashed = false;

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
    gopt: KAPLAYOpt<TPlugins, TButtons> = {},
): TPlugins extends [undefined] ? KAPLAYCtx<TButtons, TButtonsName>
    : KAPLAYCtx<TButtons, TButtonsName> & MergePlugins<TPlugins> =>
{
    if (_k.k) {
        console.warn(
            "KAPLAY already initialized, you are calling kaplay() multiple times, it may lead bugs!",
        );
        _k.k.quit();
    }

    _k.globalOpt = gopt;

    const {
        appGfx,
        assets,
        audio,
        canvas,
        fontCacheC2d,
        fontCacheCanvas,
        frameEnd,
        frameStart,
        gfx,
        app,
        game,
    } = startEngine(gopt);

    _k.app = app;
    _k.audio = audio;
    _k.canvas = canvas;
    _k.fontCacheC2d = fontCacheC2d;
    _k.fontCacheCanvas = fontCacheCanvas, _k.gfx = appGfx;
    _k.pixelDensity = gopt.pixelDensity ?? 1;
    _k.gscale = 1;
    _k.assets = assets;
    _k.game = game;

    const { checkFrame } = getCollisionSystem();

    system("collision", checkFrame, [
        LCEvents.AfterFixedUpdate,
        LCEvents.AfterUpdate,
    ]);

    function makeCanvas(w: number, h: number): Canvas {
        const fb = new FrameBuffer(gfx, w, h);

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
            get fb() {
                return fb;
            },
        };
    }

    function usePostEffect(name: string, uniform?: Uniform | (() => Uniform)) {
        appGfx.postShader = name;
        appGfx.postShaderUniform = uniform ?? null;
    }

    let debugPaused = false;

    const debug: Debug = {
        inspect: false,
        set timeScale(timeScale: number) {
            app.state.timeScale = timeScale;
        },
        get timeScale() {
            return app.state.timeScale;
        },
        showLog: true,
        fps: () => app.fps(),
        numFrames: () => app.numFrames(),
        stepFrame: updateFrame,
        drawCalls: () => appGfx.lastDrawCalls,
        clearLog: () => game.logs = [],
        log: (...msgs) => {
            const max = gopt.logMax ?? LOG_MAX;
            const msg = msgs.length > 1 ? msgs.concat(" ").join(" ") : msgs[0];

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
            }
            else {
                audio.ctx.resume();
            }
        },
    };

    _k.debug = debug;

    function getData<T>(key: string, def?: T): T | null {
        try {
            return JSON.parse(window.localStorage[key]);
        } catch {
            if (def) {
                setData(key, def);
                return def;
            }
            else {
                return null;
            }
        }
    }

    function setData(key: string, data: any) {
        window.localStorage[key] = JSON.stringify(data);
    }

    function plug<T extends Record<string, any>>(
        plugin: KAPLAYPlugin<T>,
        ...args: any
    ): KAPLAYCtx & T {
        const funcs = plugin(ctx);
        let funcsObj: T;
        if (typeof funcs === "function") {
            const plugWithOptions = funcs(...args);
            funcsObj = plugWithOptions(ctx);
        }
        else {
            funcsObj = funcs;
        }

        for (const key in funcsObj) {
            ctx[key as keyof typeof ctx] = funcsObj[key];

            if (gopt.global !== false) {
                window[key as any] = funcsObj[key];
            }
        }
        return ctx as unknown as KAPLAYCtx & T;
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

    const kaSprite = loadSprite(null, kaSpriteSrc);
    const boomSprite = loadSprite(null, boomSpriteSrc);

    _k.kaSprite = kaSprite;
    _k.boomSprite = boomSprite;

    function fixedUpdateFrame() {
        // update every obj
        game.root.fixedUpdate();
    }

    function updateFrame() {
        game.root.update();
    }

    function handleErr(err: Error) {
        if (crashed) return;
        crashed = true;
        console.error(err);
        audio.ctx.suspend();
        const errorMessage = err.message ?? String(err)
            ?? "Unknown error, check console for more info";
        let errorScreen = false;

        app.run(
            () => {},
            () => {
                if (errorScreen) return;
                errorScreen = true;

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
                        text: errorMessage,
                        pos: vec2(pad, pad + title.height + gap),
                        fixed: true,
                    });

                    popTransform();
                    game.events.trigger("error", err);
                });

                frameEnd();
            },
        );
    }

    _k.handleErr = handleErr;

    const gc: Array<() => void> = [];

    function onCleanup(action: () => void) {
        gc.push(action);
    }

    function quit() {
        game.events.onOnce("frameEnd", () => {
            app.quit();

            // clear canvas
            gfx.gl.clear(
                gfx.gl.COLOR_BUFFER_BIT | gfx.gl.DEPTH_BUFFER_BIT
                    | gfx.gl.STENCIL_BUFFER_BIT,
            );

            // unbind everything
            const numTextureUnits = gfx.gl.getParameter(
                gfx.gl.MAX_TEXTURE_IMAGE_UNITS,
            );

            for (let unit = 0; unit < numTextureUnits; unit++) {
                gfx.gl.activeTexture(gfx.gl.TEXTURE0 + unit);
                gfx.gl.bindTexture(gfx.gl.TEXTURE_2D, null);
                gfx.gl.bindTexture(gfx.gl.TEXTURE_CUBE_MAP, null);
            }

            gfx.gl.bindBuffer(gfx.gl.ARRAY_BUFFER, null);
            gfx.gl.bindBuffer(gfx.gl.ELEMENT_ARRAY_BUFFER, null);
            gfx.gl.bindRenderbuffer(gfx.gl.RENDERBUFFER, null);
            gfx.gl.bindFramebuffer(gfx.gl.FRAMEBUFFER, null);

            // run all scattered gc events
            gfx.destroy();
            gc.forEach((f) => f());
        });
    }

    let isFirstFrame = true;

    // main game loop
    app.run(
        () => {
            try {
                if (assets.loaded) {
                    if (!debug.paused) {
                        for (
                            const sys of _k
                                .systemsByEvent[LCEvents.BeforeFixedUpdate]
                        ) {
                            sys.run();
                        }

                        fixedUpdateFrame();

                        for (
                            const sys of _k
                                .systemsByEvent[LCEvents.AfterFixedUpdate]
                        ) {
                            sys.run();
                        }
                    }

                    // checkFrame();
                }
            } catch (e) {
                handleErr(e as Error);
            }
        },
        (processInput, resetInput) => {
            try {
                processInput();

                if (!assets.loaded) {
                    if (loadProgress() === 1 && !isFirstFrame) {
                        assets.loaded = true;
                        getFailedAssets().forEach(details =>
                            game.events.trigger("loadError", ...details)
                        );
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
                }
                else {
                    if (!debug.paused) {
                        for (
                            const sys of _k
                                .systemsByEvent[LCEvents.BeforeUpdate]
                        ) {
                            sys.run();
                        }

                        updateFrame();

                        for (
                            const sys of _k.systemsByEvent[LCEvents.AfterUpdate]
                        ) {
                            sys.run();
                        }
                    }

                    // checkFrame();
                    frameStart();

                    for (const sys of _k.systemsByEvent[LCEvents.BeforeDraw]) {
                        sys.run();
                    }

                    drawFrame();
                    if (gopt.debug !== false) drawDebug();

                    for (const sys of _k.systemsByEvent[LCEvents.AfterDraw]) {
                        sys.run();
                    }

                    frameEnd();
                }

                if (isFirstFrame) {
                    isFirstFrame = false;
                }

                game.events.trigger("frameEnd");

                resetInput();
            } catch (e) {
                handleErr(e as Error);
            }
        },
    );

    updateViewport();
    initEvents();

    // the exported ctx handle
    const ctx: KAPLAYCtx = {
        _k,
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
        loadHappy: loadHappy,
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
        dt: app.dt,
        fixedDt: app.fixedDt,
        restDt: app.restDt,
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
        onLoadError,
        onLoading,
        onResize,
        onGamepadConnect: app.onGamepadConnect,
        onGamepadDisconnect: app.onGamepadDisconnect,
        onError,
        onCleanup,
        // misc
        flash: flash,
        setCamPos: setCamPos,
        getCamPos: getCamPos,
        setCamRot: setCamRot,
        getCamRot: getCamRot,
        setCamScale: setCamScale,
        getCamScale: getCamScale,
        getCamTransform: getCamTransform,
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
        blend,
        opacity,
        anchor,
        area,
        sprite,
        text,
        polygon,
        rect,
        circle,
        ellipse,
        uvquad,
        video,
        picture,
        outline,
        particles,
        body,
        surfaceEffector,
        areaEffector,
        pointEffector,
        buoyancyEffector,
        platformEffector,
        constantForce,
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
        serializeAnimation,
        agent,
        sentry,
        patrol,
        pathfinder,
        fakeMouse,
        // group events
        trigger,
        on: on as KAPLAYCtx["on"], // our internal on should be strict, user shouldn't
        onFixedUpdate,
        onUpdate,
        onDraw,
        onAdd,
        onDestroy,
        onUse,
        onUnuse,
        onTag,
        onUntag,
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
        pressButton: app.pressButton,
        releaseButton: app.releaseButton,
        getLastInputDeviceType: app.getLastInputDeviceType,
        charInputted: app.charInputted,
        // timer
        loop,
        wait,
        // audio
        play,
        setVolume: setVolume,
        getVolume: getVolume,
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
        Mat23,
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
        hermite,
        cardinal,
        catmullRom,
        bezier,
        kochanekBartels,
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
        clipLineToRect,
        clipLineToCircle,
        gjkShapeIntersects,
        gjkShapeIntersection,
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
        beginPicture,
        appendToPicture,
        endPicture,
        drawPicture,
        pushTransform,
        popTransform,
        pushTranslate: pushTranslateV,
        pushScale: pushScaleV,
        pushRotate,
        pushMatrix,
        usePostEffect,
        makeCanvas,
        drawCanvas,
        Picture,
        // debug
        debug,
        // scene
        scene,
        getSceneName,
        go,
        onSceneLeave,
        // layers
        layers: layers,
        getLayers: getLayers,
        setLayers: setLayers,
        getDefaultLayer: getDefaultLayer,
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
        system,
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
        KeepFlags,
        cancel: () => EVENT_CANCEL_SYMBOL,
        BlendMode,
    };

    _k.k = ctx;

    const plugins = gopt.plugins as KAPLAYPlugin<Record<string, unknown>>[];

    if (plugins) {
        plugins.forEach(plug);
    }

    // export everything to window if global is set
    if (gopt.global !== false) {
        for (const key in ctx) {
            (<any> window[<any> key]) = ctx[key as keyof KAPLAYCtx];
        }
    }

    if (gopt.focus !== false) {
        app.canvas.focus();
    }

    return ctx as unknown as TPlugins extends [undefined]
        ? KAPLAYCtx<TButtons, TButtonsName>
        : KAPLAYCtx<TButtons, TButtonsName> & MergePlugins<TPlugins>;
};

export { kaplay };
