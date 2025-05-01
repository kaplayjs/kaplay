// The definitive version!
import packageJson from "../package.json";
import type { ButtonsDef } from "./app/inputBindings";
import { loadAseprite } from "./assets/aseprite";
import {
    Asset,
    getAsset,
    getFailedAssets,
    load,
    loadJSON,
    loadProgress,
    loadRoot,
} from "./assets/asset";
import { getBitmapFont, loadBitmapFont, loadHappy } from "./assets/bitmapFont";
import { getFont, loadFont } from "./assets/font";
import { loadPedit } from "./assets/pedit";
import {
    getShader,
    loadShader,
    loadShaderURL,
    type Uniform,
} from "./assets/shader";
import { getSound, loadMusic, loadSound, SoundData } from "./assets/sound";
import { getSprite, loadBean, loadSprite, SpriteData } from "./assets/sprite";
import { loadSpriteAtlas } from "./assets/spriteAtlas";
import { burp } from "./audio/burp";
import { play } from "./audio/play";
import { getVolume, setVolume, volume } from "./audio/volume";
import { ASCII_CHARS, EVENT_CANCEL_SYMBOL } from "./constants/general";
import { createEngine } from "./core/engine";
import { handleErr } from "./core/errors";
import { blend } from "./ecs/components/draw/blend";
import { circle } from "./ecs/components/draw/circle";
import { color } from "./ecs/components/draw/color";
import { drawon } from "./ecs/components/draw/drawon";
import { ellipse } from "./ecs/components/draw/ellipse";
import { fadeIn } from "./ecs/components/draw/fadeIn";
import { mask } from "./ecs/components/draw/mask";
import { opacity } from "./ecs/components/draw/opacity";
import { outline } from "./ecs/components/draw/outline";
import { particles } from "./ecs/components/draw/particles";
import { picture } from "./ecs/components/draw/picture";
import { polygon } from "./ecs/components/draw/polygon";
import { raycast } from "./ecs/components/draw/raycast";
import { rect } from "./ecs/components/draw/rect";
import { shader } from "./ecs/components/draw/shader";
import { sprite } from "./ecs/components/draw/sprite";
import { text } from "./ecs/components/draw/text";
import { uvquad } from "./ecs/components/draw/uvquad";
import { video } from "./ecs/components/draw/video";
import { agent } from "./ecs/components/level/agent";
import { level } from "./ecs/components/level/level";
import { pathfinder } from "./ecs/components/level/pathfinder";
import { patrol } from "./ecs/components/level/patrol";
import { sentry } from "./ecs/components/level/sentry";
import { tile } from "./ecs/components/level/tile";
import { animate, serializeAnimation } from "./ecs/components/misc/animate";
import { fakeMouse } from "./ecs/components/misc/fakeMouse";
import { health } from "./ecs/components/misc/health";
import { lifespan } from "./ecs/components/misc/lifespan";
import { named } from "./ecs/components/misc/named";
import { state } from "./ecs/components/misc/state";
import { stay } from "./ecs/components/misc/stay";
import { textInput } from "./ecs/components/misc/textInput";
import { timer } from "./ecs/components/misc/timer";
import { area } from "./ecs/components/physics/area";
import { body } from "./ecs/components/physics/body";
import { doubleJump } from "./ecs/components/physics/doubleJump";
import {
    areaEffector,
    buoyancyEffector,
    constantForce,
    platformEffector,
    pointEffector,
    surfaceEffector,
} from "./ecs/components/physics/effectors";
import { anchor } from "./ecs/components/transform/anchor";
import { fixed } from "./ecs/components/transform/fixed";
import { follow } from "./ecs/components/transform/follow";
import { layer } from "./ecs/components/transform/layer";
import { move } from "./ecs/components/transform/move";
import { offscreen } from "./ecs/components/transform/offscreen";
import { pos } from "./ecs/components/transform/pos";
import { rotate } from "./ecs/components/transform/rotate";
import { scale } from "./ecs/components/transform/scale";
import { z } from "./ecs/components/transform/z";
import { KeepFlags } from "./ecs/entity/GameObjRaw";
import { getCollisionSystem } from "./ecs/systems/collision";
import { KEvent, KEventController, KEventHandler } from "./events/events";
import {
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
    onTag,
    onUntag,
    onUnuse,
    onUpdate,
    onUse,
    trigger,
} from "./events/globalEvents";
import {
    camFlash,
    camPos,
    camRot,
    camScale,
    camTransform,
    flash,
    getCamPos,
    getCamRot,
    getCamScale,
    getCamTransform,
    setCamPos,
    setCamRot,
    setCamScale,
    shake,
    toScreen,
    toWorld,
} from "./game/camera";
import {
    getGravity,
    getGravityDirection,
    setGravity,
    setGravityDirection,
} from "./game/gravity";
import { initEvents } from "./game/initEvents";
import { addKaboom } from "./game/kaboom";
import { getDefaultLayer, getLayers, layers, setLayers } from "./game/layers";
import { addLevel } from "./game/level";
import { destroy, getTreeRoot } from "./game/object";
import { getSceneName, go, onSceneLeave, scene } from "./game/scenes";
import { LCEvents, system } from "./game/systems";
import { getBackground, setBackground } from "./gfx/bg";
import { FrameBuffer } from "./gfx/classes/FrameBuffer";
import { drawBezier } from "./gfx/draw/drawBezier";
import { drawCanvas } from "./gfx/draw/drawCanvas";
import { drawCircle } from "./gfx/draw/drawCircle";
import { drawCurve } from "./gfx/draw/drawCurve";
import { drawDebug } from "./gfx/draw/drawDebug";
import { drawEllipse } from "./gfx/draw/drawEllipse";
import { drawFormattedText } from "./gfx/draw/drawFormattedText";
import { drawFrame } from "./gfx/draw/drawFrame";
import { drawLine, drawLines } from "./gfx/draw/drawLine";
import { drawLoadScreen } from "./gfx/draw/drawLoadingScreen";
import { drawMasked } from "./gfx/draw/drawMasked";
import {
    appendToPicture,
    beginPicture,
    drawPicture,
    endPicture,
    Picture,
} from "./gfx/draw/drawPicture";
import { drawPolygon } from "./gfx/draw/drawPolygon";
import { drawRect } from "./gfx/draw/drawRect";
import { drawSprite } from "./gfx/draw/drawSprite";
import { drawSubtracted } from "./gfx/draw/drawSubstracted";
import { drawText } from "./gfx/draw/drawText";
import { drawTriangle } from "./gfx/draw/drawTriangle";
import { drawUVQuad } from "./gfx/draw/drawUVQuad";
import { compileStyledText, formatText } from "./gfx/formatText";
import {
    center,
    flush,
    height,
    loadMatrix,
    multRotate,
    multScaleV,
    multTranslateV,
    popTransform,
    pushTransform,
    width,
} from "./gfx/stack";
import { updateViewport } from "./gfx/viewport";

import boomSpriteSrc from "./kassets/boom.png";
import kaSpriteSrc from "./kassets/ka.png";
import { clamp } from "./math/clamp";
import { Color, hsl2rgb, rgb } from "./math/color";
import easings from "./math/easings";
import { gjkShapeIntersection, gjkShapeIntersects } from "./math/gjk";
import { Mat4 } from "./math/Mat4";
import {
    bezier,
    cardinal,
    catmullRom,
    chance,
    choose,
    chooseMultiple,
    Circle,
    clipLineToCircle,
    clipLineToRect,
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
    hermite,
    isConvex,
    kochanekBartels,
    lerp,
    Line,
    map,
    mapc,
    Mat23,
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
    shuffle,
    smoothstep,
    step,
    testCirclePolygon,
    testLineCircle,
    testLineLine,
    testLinePoint,
    testRectLine,
    testRectPoint,
    testRectRect,
    triangulate,
    vec2,
    wave,
} from "./math/math";
import { NavMesh } from "./math/navigationmesh";
import { Vec2 } from "./math/Vec2";
import {
    BlendMode,
    type Canvas,
    type KAPLAYCtx,
    type KAPLAYOpt,
    type KAPLAYPlugin,
    type MergePlugins,
    type PluginList,
    type Recording,
} from "./types";
import {
    download,
    downloadBlob,
    downloadJSON,
    downloadText,
} from "./utils/dataURL";

/**
 * KAPLAY.js internal data
 */
export let _k: KAPLAYCtx["_k"];

// If KAPLAY was runned before
let runned = false;

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
    if (runned) {
        console.warn(
            "KAPLAY was runned before, cleaning state",
        );

        // cleanup
        // @ts-ignore
        _k = null;
    }

    runned = true;

    _k = createEngine(gopt);

    const {
        ggl,
        assets,
        audio,
        frameRenderer,
        gfx,
        app,
        game,
        debug,
    } = _k;

    const { checkFrame } = getCollisionSystem({
        narrow: gopt.narrowPhaseCollisionAlgorithm || "gjk",
    });

    system("collision", checkFrame, [
        LCEvents.AfterFixedUpdate,
        LCEvents.AfterUpdate,
    ]);

    // TODO: make this an opt
    game.kaSprite = loadSprite(null, kaSpriteSrc);
    game.boomSprite = loadSprite(null, boomSpriteSrc);

    function makeCanvas(w: number, h: number): Canvas {
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
            get fb() {
                return fb;
            },
        };
    }

    function usePostEffect(name: string, uniform?: Uniform | (() => Uniform)) {
        gfx.postShader = name;
        gfx.postShaderUniform = uniform ?? null;
    }

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
            ggl.destroy();
            gc.forEach((f) => f());

            // remove canvas
            app.canvas.remove();
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
                            const sys of game
                                .systemsByEvent[LCEvents.BeforeFixedUpdate]
                        ) {
                            sys.run();
                        }

                        frameRenderer.fixedUpdateFrame();

                        for (
                            const sys of game
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
                    frameRenderer.frameStart();
                    // TODO: Currently if assets are not initially loaded no updates or timers will be run, however they will run if loadingScreen is set to false. What's the desired behavior or should we make them consistent?
                    drawLoadScreen();
                    frameRenderer.frameEnd();
                }
                else {
                    if (!debug.paused) {
                        for (
                            const sys of game
                                .systemsByEvent[LCEvents.BeforeUpdate]
                        ) {
                            sys.run();
                        }

                        frameRenderer.updateFrame();

                        for (
                            const sys of game
                                .systemsByEvent[LCEvents.AfterUpdate]
                        ) {
                            sys.run();
                        }
                    }

                    // checkFrame();
                    frameRenderer.frameStart();

                    for (
                        const sys of game.systemsByEvent[LCEvents.BeforeDraw]
                    ) {
                        sys.run();
                    }

                    drawFrame();
                    if (gopt.debug !== false) drawDebug();

                    for (const sys of game.systemsByEvent[LCEvents.AfterDraw]) {
                        sys.run();
                    }

                    frameRenderer.frameEnd();
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
    initEvents(gfx);

    // the exported ctx handle
    const ctx: KAPLAYCtx = {
        _k,
        VERSION: packageJson.version,
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
        level,
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
        mousePos: app.mousePos,
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
        step,
        smoothstep,
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
        compileStyledText,
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
        pushTranslate: multTranslateV,
        pushScale: multScaleV,
        pushRotate: multRotate,
        pushMatrix: loadMatrix,
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
export default kaplay;
