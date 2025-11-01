import { getData, setData } from "../app/data";
import { loadAseprite } from "../assets/aseprite";
import {
    Asset,
    getAsset,
    load,
    loadJSON,
    loadProgress,
    loadRoot,
} from "../assets/asset";
import {
    getBitmapFont,
    loadBitmapFont,
    loadBitmapFontFromSprite,
    loadHappy,
} from "../assets/bitmapFont";
import { getFont, loadFont } from "../assets/font";
import { getShader, loadShader, loadShaderURL } from "../assets/shader";
import { getSound, loadMusic, loadSound, SoundData } from "../assets/sound";
import { getSprite, loadBean, loadSprite, SpriteData } from "../assets/sprite";
import { loadSpriteAtlas } from "../assets/spriteAtlas";
import { burp } from "../audio/burp";
import { play } from "../audio/play";
import { getVolume, setVolume, volume } from "../audio/volume";
import { ASCII_CHARS, EVENT_CANCEL_SYMBOL } from "../constants/general";
import { record } from "../debug/record";
import { blend } from "../ecs/components/draw/blend";
import { circle } from "../ecs/components/draw/circle";
import { color } from "../ecs/components/draw/color";
import { drawon } from "../ecs/components/draw/drawon";
import { ellipse } from "../ecs/components/draw/ellipse";
import { fadeIn } from "../ecs/components/draw/fadeIn";
import { mask } from "../ecs/components/draw/mask";
import { opacity } from "../ecs/components/draw/opacity";
import { outline } from "../ecs/components/draw/outline";
import { particles } from "../ecs/components/draw/particles";
import { picture } from "../ecs/components/draw/picture";
import { polygon } from "../ecs/components/draw/polygon";
import { raycast } from "../ecs/components/draw/raycast";
import { rect } from "../ecs/components/draw/rect";
import { shader } from "../ecs/components/draw/shader";
import { sprite } from "../ecs/components/draw/sprite";
import { text } from "../ecs/components/draw/text";
import { uvquad } from "../ecs/components/draw/uvquad";
import { video } from "../ecs/components/draw/video";
import { agent } from "../ecs/components/level/agent";
import { level } from "../ecs/components/level/level";
import { pathfinder } from "../ecs/components/level/pathfinder";
import { patrol } from "../ecs/components/level/patrol";
import { sentry } from "../ecs/components/level/sentry";
import { tile } from "../ecs/components/level/tile";
import { animate, serializeAnimation } from "../ecs/components/misc/animate";
import { button, checkbox, radio } from "../ecs/components/misc/button";
import { cursor } from "../ecs/components/misc/cursor";
import { fakeMouse } from "../ecs/components/misc/fakeMouse";
import { health } from "../ecs/components/misc/health";
import { layout } from "../ecs/components/misc/layout";
import { lifespan } from "../ecs/components/misc/lifespan";
import { named } from "../ecs/components/misc/named";
import { slider } from "../ecs/components/misc/slider";
import { state } from "../ecs/components/misc/state";
import { stay } from "../ecs/components/misc/stay";
import { textInput } from "../ecs/components/misc/textInput";
import { timer } from "../ecs/components/misc/timer";
import { ui } from "../ecs/components/misc/ui";
import { area } from "../ecs/components/physics/area";
import { body } from "../ecs/components/physics/body";
import { doubleJump } from "../ecs/components/physics/doubleJump";
import {
    areaEffector,
    buoyancyEffector,
    constantForce,
    platformEffector,
    pointEffector,
    surfaceEffector,
} from "../ecs/components/physics/effectors";
import { anchor } from "../ecs/components/transform/anchor";
import { constraint } from "../ecs/components/transform/constraint";
import { fixed } from "../ecs/components/transform/fixed";
import { follow } from "../ecs/components/transform/follow";
import { layer } from "../ecs/components/transform/layer";
import { move } from "../ecs/components/transform/move";
import { offscreen } from "../ecs/components/transform/offscreen";
import { pos } from "../ecs/components/transform/pos";
import { rotate } from "../ecs/components/transform/rotate";
import { scale } from "../ecs/components/transform/scale";
import { skew } from "../ecs/components/transform/skew";
import { z } from "../ecs/components/transform/z";
import { KeepFlags } from "../ecs/entity/GameObjRaw";
import { createPrefab, loadPrefab } from "../ecs/entity/prefab";
import { addKaboom } from "../ecs/entity/premade/addKaboom";
import { addLevel } from "../ecs/entity/premade/addLevel";
import { destroy, getTreeRoot } from "../ecs/entity/utils";
import { Collision } from "../ecs/systems/Collision";
import { system, SystemPhase } from "../ecs/systems/systems";
import { KEvent, KEventController, KEventHandler } from "../events/events";
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
} from "../events/globalEvents";
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
} from "../game/camera";
import {
    getGravity,
    getGravityDirection,
    setGravity,
    setGravityDirection,
} from "../game/gravity";
import { getDefaultLayer, getLayers, layers, setLayers } from "../game/layers";
import {
    getSceneName,
    go,
    onSceneLeave,
    popScene,
    pushScene,
    scene,
} from "../game/scenes";
import { anchorPt } from "../gfx/anchor";
import { getBackground, setBackground } from "../gfx/bg";
import { makeCanvas } from "../gfx/canvasBuffer";
import { drawBezier } from "../gfx/draw/drawBezier";
import { drawCanvas } from "../gfx/draw/drawCanvas";
import { drawCircle } from "../gfx/draw/drawCircle";
import { drawCurve } from "../gfx/draw/drawCurve";
import { drawEllipse } from "../gfx/draw/drawEllipse";
import { drawFormattedText } from "../gfx/draw/drawFormattedText";
import { drawLine, drawLines } from "../gfx/draw/drawLine";
import { drawMasked } from "../gfx/draw/drawMasked";
import {
    appendToPicture,
    beginPicture,
    drawPicture,
    endPicture,
    Picture,
} from "../gfx/draw/drawPicture";
import { drawPolygon } from "../gfx/draw/drawPolygon";
import { drawRect } from "../gfx/draw/drawRect";
import { drawSprite } from "../gfx/draw/drawSprite";
import { drawSubtracted } from "../gfx/draw/drawSubstracted";
import { drawText } from "../gfx/draw/drawText";
import { drawTriangle } from "../gfx/draw/drawTriangle";
import { drawUVQuad } from "../gfx/draw/drawUVQuad";
import { compileStyledText, formatText } from "../gfx/formatText";
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
} from "../gfx/stack";
import { DecisionNode, DecisionTree } from "../math/ai/decisiontree";
import { Rule, RuleSystem } from "../math/ai/rulesystem";
import { StateMachine } from "../math/ai/statemachine";
import { clamp } from "../math/clamp";
import { Color, hsl2rgb, rgb } from "../math/color";
import { easings } from "../math/easings";
import { gjkShapeIntersection, gjkShapeIntersects } from "../math/gjk";
import { lerp } from "../math/lerp";
import { Mat4 } from "../math/Mat4";
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
} from "../math/math";
import { NavMesh } from "../math/navigationmesh";
import { insertionSort } from "../math/sort";
import { Vec2 } from "../math/Vec2";
import { BlendMode, type KAPLAYPlugin } from "../types";
import {
    download,
    downloadBlob,
    downloadJSON,
    downloadText,
} from "../utils/dataURL";
import type { KAPLAYCtx } from "./contextType";
import type { Engine } from "./engine";
import { throwError } from "./errors";
import { plug } from "./plug";
import { onCleanup, quit } from "./quit";

// The context is the way the user interact with a KAPLAY game.
export const createContext = (
    e: Engine,
    plugins?: KAPLAYPlugin<Record<string, unknown>>[],
    exportToGlobal?: boolean,
): KAPLAYCtx => {
    // aliases for root Game Obj operations
    const { game, app, audio, debug, globalOpt } = e;
    const add = game.root.add.bind(game.root);
    const addPrefab = game.root.addPrefab.bind(game.root);
    const readd = game.root.readd.bind(game.root);
    const destroyAll = game.root.removeAll.bind(game.root);
    const get = game.root.get.bind(game.root);
    const wait = game.root.wait.bind(game.root);
    const loop = game.root.loop.bind(game.root);
    const query = game.root.query.bind(game.root);
    const tween = game.root.tween.bind(game.root);

    const defaultScope = globalOpt.defaultLifetimeScope == "app"
        ? e.appScope
        : e.sceneScope;

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
        loadHappy,
        loadJSON,
        loadPrefab,
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
        screenshotToBlob: app.screenshotToBlob,
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
        addPrefab,
        createPrefab,
        destroy,
        destroyAll,
        get,
        query,
        readd,
        // comps
        pos,
        rotate,
        scale,
        skew,
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
        ui,
        button,
        checkbox,
        radio,
        slider,
        layout,
        cursor,
        lifespan,
        named,
        state,
        z,
        layer,
        move,
        constraint,
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
        onKeyDown: defaultScope.onKeyDown,
        onKeyPress: defaultScope.onKeyPress,
        onKeyPressRepeat: defaultScope.onKeyPressRepeat,
        onKeyRelease: defaultScope.onKeyRelease,
        onMouseDown: defaultScope.onMouseDown,
        onMousePress: defaultScope.onMousePress,
        onMouseRelease: defaultScope.onMouseRelease,
        onMouseMove: defaultScope.onMouseMove,
        onCharInput: defaultScope.onCharInput,
        onTouchStart: defaultScope.onTouchStart,
        onTouchMove: defaultScope.onTouchMove,
        onTouchEnd: defaultScope.onTouchEnd,
        onScroll: defaultScope.onScroll,
        onHide: defaultScope.onHide,
        onShow: defaultScope.onShow,
        onTabShow: defaultScope.onTabShow,
        onTabHide: defaultScope.onTabHide,
        onGamepadButtonDown: defaultScope.onGamepadButtonDown,
        onGamepadButtonPress: defaultScope.onGamepadButtonPress,
        onGamepadButtonRelease: defaultScope.onGamepadButtonRelease,
        onGamepadStick: defaultScope.onGamepadStick,
        onButtonPress: defaultScope.onButtonPress,
        onButtonDown: defaultScope.onButtonDown,
        onButtonRelease: defaultScope.onButtonRelease,
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
        getGamepadAnalogButton: app.getGamepadAnalogButton,
        isButtonPressed: app.isButtonPressed,
        isButtonDown: app.isButtonDown,
        isButtonReleased: app.isButtonReleased,
        getButton: app.getButton,
        getButtons: app.getButtons,
        setButton: app.setButton,
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
        Collision,
        Vec2,
        Color,
        Mat4,
        Mat23,
        Quad,
        RNG,
        Rule,
        RuleSystem,
        DecisionNode,
        DecisionTree,
        StateMachine,
        insertionSort,
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
        anchorToVec2: anchorPt,
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
        app: e.appScope,
        // scene
        scene: e.sceneScope,
        getSceneName,
        go,
        onSceneLeave,
        pushScene,
        popScene,
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
        SystemPhase,
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
