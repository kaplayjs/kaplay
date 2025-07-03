"use strict";
// The engine is what KAPLAY needs for running and proccesing all it's stuff
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEngine = void 0;
var app_1 = require("../app/app");
var asset_1 = require("../assets/asset");
var audio_1 = require("../audio/audio");
var debug_1 = require("../debug/debug");
var game_1 = require("../game/game");
var canvas_1 = require("../gfx/canvas");
var gfx_1 = require("../gfx/gfx");
var gfxApp_1 = require("../gfx/gfxApp");
var engineLoop_1 = require("./engineLoop");
var fontCache_1 = require("./fontCache");
var frameRendering_1 = require("./frameRendering");
// Create global variables
window.kaplayjs_assetsAliases = {};
var createEngine = function (gopt) {
    var _a, _b;
    // Default options
    var opt = Object.assign({
        scale: 1,
    }, gopt);
    var canvas = (0, canvas_1.createCanvas)(opt);
    var _c = (0, fontCache_1.createFontCache)(), fontCacheC2d = _c.fontCacheC2d, fontCacheCanvas = _c.fontCacheCanvas;
    var app = (0, app_1.initApp)(__assign({ canvas: canvas }, gopt));
    // TODO: Probably we should move this to initGfx
    var canvasContext = app.canvas
        .getContext("webgl", {
        antialias: true,
        depth: true,
        stencil: true,
        alpha: true,
        preserveDrawingBuffer: true,
    });
    if (!canvasContext)
        throw new Error("WebGL not supported");
    var gl = canvasContext;
    // TODO: Investigate correctly what's the differente between GFX and AppGFX and reduce to 1 method
    var gfx = (0, gfx_1.initGfx)(gl, opt);
    var appGfx = (0, gfxApp_1.initAppGfx)(gfx, opt);
    var assets = (0, asset_1.initAssets)(gfx, (_a = opt.spriteAtlasPadding) !== null && _a !== void 0 ? _a : 0);
    var audio = (0, audio_1.initAudio)();
    var game = (0, game_1.createGame)();
    // Frame rendering
    var frameRenderer = (0, frameRendering_1.createFrameRenderer)(appGfx, game, (_b = opt.pixelDensity) !== null && _b !== void 0 ? _b : 1);
    // Debug mode
    var debug = (0, debug_1.createDebug)(opt, app, appGfx, audio, game, frameRenderer);
    return {
        globalOpt: opt,
        canvas: canvas,
        app: app,
        ggl: gfx,
        gfx: appGfx,
        audio: audio,
        assets: assets,
        frameRenderer: frameRenderer,
        fontCacheC2d: fontCacheC2d,
        fontCacheCanvas: fontCacheCanvas,
        game: game,
        debug: debug,
        gc: [],
        // Patch, k it's only avaible after running kaplay()
        k: null,
        startLoop: function () {
            (0, engineLoop_1.startEngineLoop)(app, game, assets, opt, frameRenderer, debug);
        },
    };
};
exports.createEngine = createEngine;
