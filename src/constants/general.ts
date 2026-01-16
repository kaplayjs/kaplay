/*
As KAPLAY support creating and destroying context, we really need to track all
our global constants not being dependent on the context. If it's a constant, it
never should depend on the context. If it does, should be a variable of Engine
(app, game, gfx, etc)

Constants should be SNAKE_CASE
*/

import GAMEPAD_MAP from "../data/gamepad.json" assert { type: "json" };

// some default charsets for loading bitmap fonts
export const ASCII_CHARS =
    " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
export const DEF_ANCHOR = "topleft";
export const BG_GRID_SIZE = 64;
export const DEF_FONT = "monospace";
export const DBG_FONT = "monospace";
export const DEF_TEXT_SIZE = 36;
export const DEF_TEXT_CACHE_SIZE = 64;
export const MAX_TEXT_CACHE_SIZE = 256;
export const SPRITE_ATLAS_WIDTH = 2048;
export const SPRITE_ATLAS_HEIGHT = 2048;
export const DEF_HASH_GRID_SIZE = 64;
export const LOG_MAX = 8;
export const LOG_TIME = 4;
export const VERTEX_FORMAT = [
    { name: "a_pos", size: 2 },
    { name: "a_uv", size: 2 },
    { name: "a_color", size: 4 },
];
const STRIDE = VERTEX_FORMAT.reduce((sum, f) => sum + f.size, 0);
const MAX_BATCHED_QUAD = 2048;
export const MAX_BATCHED_VERTS = MAX_BATCHED_QUAD * 4 * STRIDE;
export const MAX_BATCHED_INDICES = MAX_BATCHED_QUAD * 6;
// vertex shader template, replace {{user}} with user vertex shader code
export const VERT_TEMPLATE =
    `attribute vec2 a_pos;attribute vec2 a_uv;attribute vec4 a_color;varying vec2 v_pos;varying vec2 v_uv;varying vec4 v_color;uniform float width;uniform float height;uniform mat4 camera;uniform mat4 transform;vec4 def_vert(){vec4 pos=camera*transform*vec4(a_pos,0.0,1.0);return vec4(pos.x/width*2.0-1.0,pos.y/-height*2.0+1.0,pos.z,pos.w);}{{user}}void main(){vec4 pos=vert(a_pos,a_uv,a_color);v_pos=a_pos;v_uv=a_uv;v_color=a_color;gl_Position=pos;}`;
export const FRAG_TEMPLATE =
    `precision mediump float;varying vec2 v_pos;varying vec2 v_uv;varying vec4 v_color;uniform sampler2D u_tex;vec4 def_frag(){vec4 texColor=texture2D(u_tex,v_uv);return vec4((v_color.rgb*texColor.rgb),texColor.a)*v_color.a;}{{user}}void main(){gl_FragColor=frag(v_pos,v_uv,v_color,u_tex);if(gl_FragColor.a==0.0){discard;}}`;
export const DEF_VERT =
    `vec4 vert(vec2 pos,vec2 uv,vec4 color){return def_vert();}`;
export const DEF_FRAG =
    `vec4 frag(vec2 pos,vec2 uv,vec4 color,sampler2D tex){return def_frag();}`;

export const DEF_OFFSCREEN_DIS = 200;
// maximum y velocity with body()
export const DEF_JUMP_FORCE = 640;
export const MAX_VEL = 65536;
export const EVENT_CANCEL_SYMBOL = Symbol.for("kaplay.cancel");

export const GP_MAP = GAMEPAD_MAP as unknown as Record<string, string>;

export const MAX_TRIES = 20;
