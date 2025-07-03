import { getData, setData } from "../app/data.js";
import { loadAseprite } from "../assets/aseprite.js";
import {
    Asset,
    getAsset,
    load,
    loadJSON,
    loadProgress,
    loadRoot,
} from "../assets/asset.js";
import {
    getBitmapFont,
    loadBitmapFont,
    loadBitmapFontFromSprite,
    loadHappy,
} from "../assets/bitmapFont.js";
import { getFont, loadFont } from "../assets/font.js";
import { getShader, loadShader, loadShaderURL } from "../assets/shader.js";
import { getSound, loadMusic, loadSound, SoundData } from "../assets/sound.js";
import {
    getSprite,
    loadBean,
    loadSprite,
    SpriteData,
} from "../assets/sprite.js";
import { loadSpriteAtlas } from "../assets/spriteAtlas.js";
import { burp } from "../audio/burp.js";
import { play } from "../audio/play.js";
import { getVolume, setVolume, volume } from "../audio/volume.js";
import { ASCII_CHARS, EVENT_CANCEL_SYMBOL } from "../constants/general.js";
import { record } from "../debug/record.js";
import { blend } from "../ecs/components/draw/blend.js";
import { circle } from "../ecs/components/draw/circle.js";
import { color } from "../ecs/components/draw/color.js";
import { drawon } from "../ecs/components/draw/drawon.js";
import { ellipse } from "../ecs/components/draw/ellipse.js";
import { fadeIn } from "../ecs/components/draw/fadeIn.js";
import { mask } from "../ecs/components/draw/mask.js";
import { opacity } from "../ecs/components/draw/opacity.js";
import { outline } from "../ecs/components/draw/outline.js";
import { particles } from "../ecs/components/draw/particles.js";
import { picture } from "../ecs/components/draw/picture.js";
import { polygon } from "../ecs/components/draw/polygon.js";
import { raycast } from "../ecs/components/draw/raycast.js";
import { rect } from "../ecs/components/draw/rect.js";
import { shader } from "../ecs/components/draw/shader.js";
import { sprite } from "../ecs/components/draw/sprite.js";
import { text } from "../ecs/components/draw/text.js";
import { uvquad } from "../ecs/components/draw/uvquad.js";
import { video } from "../ecs/components/draw/video.js";
import { agent } from "../ecs/components/level/agent.js";
import { level } from "../ecs/components/level/level.js";
import { pathfinder } from "../ecs/components/level/pathfinder.js";
import { patrol } from "../ecs/components/level/patrol.js";
import { sentry } from "../ecs/components/level/sentry.js";
import { tile } from "../ecs/components/level/tile.js";
import { animate, serializeAnimation } from "../ecs/components/misc/animate.js";
import { fakeMouse } from "../ecs/components/misc/fakeMouse.js";
import { health } from "../ecs/components/misc/health.js";
import { lifespan } from "../ecs/components/misc/lifespan.js";
import { named } from "../ecs/components/misc/named.js";
import { state } from "../ecs/components/misc/state.js";
import { stay } from "../ecs/components/misc/stay.js";
import { textInput } from "../ecs/components/misc/textInput.js";
import { timer } from "../ecs/components/misc/timer.js";
import { area } from "../ecs/components/physics/area.js";
import { body } from "../ecs/components/physics/body.js";
import { doubleJump } from "../ecs/components/physics/doubleJump.js";
import {
    areaEffector,
    buoyancyEffector,
    constantForce,
    platformEffector,
    pointEffector,
    surfaceEffector,
} from "../ecs/components/physics/effectors.js";
import { anchor } from "../ecs/components/transform/anchor.js";
import { fixed } from "../ecs/components/transform/fixed.js";
import { follow } from "../ecs/components/transform/follow.js";
import { layer } from "../ecs/components/transform/layer.js";
import { move } from "../ecs/components/transform/move.js";
import { offscreen } from "../ecs/components/transform/offscreen.js";
import { pos } from "../ecs/components/transform/pos.js";
import { rotate } from "../ecs/components/transform/rotate.js";
import { scale } from "../ecs/components/transform/scale.js";
import { z } from "../ecs/components/transform/z.js";
import { KeepFlags } from "../ecs/entity/GameObjRaw.js";
import { addKaboom } from "../ecs/entity/premade/addKaboom.js";
import { addLevel } from "../ecs/entity/premade/addLevel.js";
import { destroy, getTreeRoot } from "../ecs/entity/utils.js";
import { system } from "../ecs/systems/systems.js";
import { KEvent, KEventController, KEventHandler } from "../events/events.js";
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
} from "../events/globalEvents.js";
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
} from "../game/camera.js";
import {
    getGravity,
    getGravityDirection,
    setGravity,
    setGravityDirection,
} from "../game/gravity.js";
import {
    getDefaultLayer,
    getLayers,
    layers,
    setLayers,
} from "../game/layers.js";
import { getSceneName, go, onSceneLeave, scene } from "../game/scenes.js";
import { getBackground, setBackground } from "../gfx/bg.js";
import { makeCanvas } from "../gfx/canvasBuffer.js";
import { drawBezier } from "../gfx/draw/drawBezier.js";
import { drawCanvas } from "../gfx/draw/drawCanvas.js";
import { drawCircle } from "../gfx/draw/drawCircle.js";
import { drawCurve } from "../gfx/draw/drawCurve.js";
import { drawEllipse } from "../gfx/draw/drawEllipse.js";
import { drawFormattedText } from "../gfx/draw/drawFormattedText.js";
import { drawLine, drawLines } from "../gfx/draw/drawLine.js";
import { drawMasked } from "../gfx/draw/drawMasked.js";
import {
    appendToPicture,
    beginPicture,
    drawPicture,
    endPicture,
    Picture,
} from "../gfx/draw/drawPicture.js";
import { drawPolygon } from "../gfx/draw/drawPolygon.js";
import { drawRect } from "../gfx/draw/drawRect.js";
import { drawSprite } from "../gfx/draw/drawSprite.js";
import { drawSubtracted } from "../gfx/draw/drawSubstracted.js";
import { drawText } from "../gfx/draw/drawText.js";
import { drawTriangle } from "../gfx/draw/drawTriangle.js";
import { drawUVQuad } from "../gfx/draw/drawUVQuad.js";
import { compileStyledText, formatText } from "../gfx/formatText.js";
import {
    center,
    height,
    loadMatrix,
    multRotate,
    multScaleV,
    multTranslateV,
    popTransform,
    pushTransform,
    usePostEffect,
    width,
} from "../gfx/stack.js";
import { clamp } from "../math/clamp.js";
import { Color, hsl2rgb, rgb } from "../math/color.js";
import { easings } from "../math/easings.js";
import { gjkShapeIntersection, gjkShapeIntersects } from "../math/gjk.js";
import { lerp } from "../math/lerp.js";
import { Mat4 } from "../math/Mat4.js";
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
} from "../math/math.js";
import { NavMesh } from "../math/navigationmesh.js";
import { Vec2 } from "../math/Vec2.js";
import { BlendMode, type KAPLAYCtx, type KAPLAYPlugin } from "../types.js";
import {
    download,
    downloadBlob,
    downloadJSON,
    downloadText,
} from "../utils/dataURL.js";
import type { Engine } from "./engine.js";
import { throwError } from "./errors.js";
import { plug } from "./plug.js";
import { onCleanup, quit } from "./quit.js";

// The context is the way the user interact with a KAPLAY game.
export const createContext = (
    e: Engine,
    plugins?: KAPLAYPlugin<Record<string, unknown>>[],
    exportToGlobal?: boolean,
): KAPLAYCtx => {
    // aliases for root Game Obj operations
    const { game, app, audio, debug } = e;
    const add = game.root.add.bind(game.root);
    const readd = game.root.readd.bind(game.root);
    const destroyAll = game.root.removeAll.bind(game.root);
    const get = game.root.get.bind(game.root);
    const wait = game.root.wait.bind(game.root);
    const loop = game.root.loop.bind(game.root);
    const query = game.root.query.bind(game.root);
    const tween = game.root.tween.bind(game.root);

    const ctx: KAPLAYCtx = {
        _k: e,
        // @ts-ignore
        VERSION: KAPLAY_VERSION,
        // asset load
        loadRoot,
        loadProgress,
        loadSprite,
        loadSpriteAtlas,
        loadSound,
        loadMusic,
        loadBitmapFont,
        loadFont,
        loadBitmapFontFromSprite,
        loadShader,
        loadShaderURL,
        loadAseprite,
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
        isFocused: app.isFocused,
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
        throwError,
        // helpers
        KEvent,
        KEventHandler,
        KEventController,
        KeepFlags,
        cancel: () => EVENT_CANCEL_SYMBOL,
        BlendMode,
    };

    // Export context to Engine
    e.k = ctx;

    if (plugins) {
        plugins.forEach(plug);
    }

    if (exportToGlobal) {
        for (const key in ctx) {
            ((window as any)[key]) = ctx[key as keyof KAPLAYCtx];
        }
    }

    return ctx;
};
