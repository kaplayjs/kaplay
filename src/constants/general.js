"use strict";
/*
As KAPLAY support creating and destroying context, we really need to track all
our global constants not being dependent on the context. If it's a constant, it
never should depend on the context. If it does, should be a variable of Engine
(app, game, gfx, etc)

Constants should be SNAKE_CASE
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_TRIES =
    exports.GP_MAP =
    exports.EVENT_CANCEL_SYMBOL =
    exports.MAX_VEL =
    exports.DEF_JUMP_FORCE =
    exports.DEF_OFFSCREEN_DIS =
    exports.COMP_EVENTS =
    exports.COMP_DESC =
    exports.DEF_FRAG =
    exports.DEF_VERT =
    exports.FRAG_TEMPLATE =
    exports.VERT_TEMPLATE =
    exports.MAX_BATCHED_INDICES =
    exports.MAX_BATCHED_VERTS =
    exports.VERTEX_FORMAT =
    exports.LOG_TIME =
    exports.LOG_MAX =
    exports.DEF_FONT_FILTER =
    exports.DEF_HASH_GRID_SIZE =
    exports.UV_PAD =
    exports.SPRITE_ATLAS_HEIGHT =
    exports.SPRITE_ATLAS_WIDTH =
    exports.FONT_ATLAS_HEIGHT =
    exports.FONT_ATLAS_WIDTH =
    exports.MAX_TEXT_CACHE_SIZE =
    exports.DEF_TEXT_CACHE_SIZE =
    exports.DEF_TEXT_SIZE =
    exports.DBG_FONT =
    exports.DEF_FONT =
    exports.BG_GRID_SIZE =
    exports.DEF_ANCHOR =
    exports.ASCII_CHARS =
        void 0;
var gamepad_json_1 = require("../data/gamepad.json");
// some default charsets for loading bitmap fonts
exports.ASCII_CHARS =
    " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
exports.DEF_ANCHOR = "topleft";
exports.BG_GRID_SIZE = 64;
exports.DEF_FONT = "monospace";
exports.DBG_FONT = "monospace";
exports.DEF_TEXT_SIZE = 36;
exports.DEF_TEXT_CACHE_SIZE = 64;
exports.MAX_TEXT_CACHE_SIZE = 256;
exports.FONT_ATLAS_WIDTH = 2048;
exports.FONT_ATLAS_HEIGHT = 2048;
exports.SPRITE_ATLAS_WIDTH = 2048;
exports.SPRITE_ATLAS_HEIGHT = 2048;
// 0.1 pixel padding to texture coordinates to prevent artifact
exports.UV_PAD = 0.1;
exports.DEF_HASH_GRID_SIZE = 64;
exports.DEF_FONT_FILTER = "linear";
exports.LOG_MAX = 8;
exports.LOG_TIME = 4;
exports.VERTEX_FORMAT = [
    { name: "a_pos", size: 2 },
    { name: "a_uv", size: 2 },
    { name: "a_color", size: 4 },
];
var STRIDE = exports.VERTEX_FORMAT.reduce(function(sum, f) {
    return sum + f.size;
}, 0);
var MAX_BATCHED_QUAD = 2048;
exports.MAX_BATCHED_VERTS = MAX_BATCHED_QUAD * 4 * STRIDE;
exports.MAX_BATCHED_INDICES = MAX_BATCHED_QUAD * 6;
// vertex shader template, replace {{user}} with user vertex shader code
exports.VERT_TEMPLATE =
    "attribute vec2 a_pos;attribute vec2 a_uv;attribute vec4 a_color;varying vec2 v_pos;varying vec2 v_uv;varying vec4 v_color;uniform float width;uniform float height;uniform mat4 camera;uniform mat4 transform;vec4 def_vert(){vec4 pos=camera*transform*vec4(a_pos,0.0,1.0);return vec4(pos.x/width*2.0-1.0,pos.y/-height*2.0+1.0,pos.z,pos.w);}{{user}}void main(){vec4 pos=vert(a_pos,a_uv,a_color);v_pos=a_pos;v_uv=a_uv;v_color=a_color;gl_Position=pos;}";
exports.FRAG_TEMPLATE =
    "precision mediump float;varying vec2 v_pos;varying vec2 v_uv;varying vec4 v_color;uniform sampler2D u_tex;vec4 def_frag(){vec4 texColor=texture2D(u_tex,v_uv);return vec4((v_color.rgb*texColor.rgb),texColor.a)*v_color.a;}{{user}}void main(){gl_FragColor=frag(v_pos,v_uv,v_color,u_tex);if(gl_FragColor.a==0.0){discard;}}";
exports.DEF_VERT = "vec4 vert(vec2 pos,vec2 uv,vec4 color){return def_vert();}";
exports.DEF_FRAG =
    "vec4 frag(vec2 pos,vec2 uv,vec4 color,sampler2D tex){return def_frag();}";
exports.COMP_DESC = new Set(["id", "require"]);
exports.COMP_EVENTS = new Set([
    "add",
    "fixedUpdate",
    "update",
    "draw",
    "destroy",
    "inspect",
    "drawInspect",
]);
exports.DEF_OFFSCREEN_DIS = 200;
// maximum y velocity with body()
exports.DEF_JUMP_FORCE = 640;
exports.MAX_VEL = 65536;
exports.EVENT_CANCEL_SYMBOL = Symbol.for("kaplay.cancel");
exports.GP_MAP = gamepad_json_1.default;
exports.MAX_TRIES = 20;
