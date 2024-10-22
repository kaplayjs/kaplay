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
export const FONT_ATLAS_WIDTH = 2048;
export const FONT_ATLAS_HEIGHT = 2048;
export const SPRITE_ATLAS_WIDTH = 2048;
export const SPRITE_ATLAS_HEIGHT = 2048;
// 0.1 pixel padding to texture coordinates to prevent artifact
export const UV_PAD = 0.1;
export const DEF_HASH_GRID_SIZE = 64;
export const DEF_FONT_FILTER = "linear";
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
export const VERT_TEMPLATE = `
attribute vec2 a_pos;
attribute vec2 a_uv;
attribute vec4 a_color;

varying vec2 v_pos;
varying vec2 v_uv;
varying vec4 v_color;

vec4 def_vert() {
	return vec4(a_pos, 0.0, 1.0);
}

{{user}}

void main() {
	vec4 pos = vert(a_pos, a_uv, a_color);
	v_pos = a_pos;
	v_uv = a_uv;
	v_color = a_color;
	gl_Position = pos;
}
`;
// fragment shader template, replace {{user}} with user fragment shader code
export const FRAG_TEMPLATE = `
precision mediump float;

varying vec2 v_pos;
varying vec2 v_uv;
varying vec4 v_color;

uniform sampler2D u_tex;

vec4 def_frag() {
	return v_color * texture2D(u_tex, v_uv);
}

{{user}}

void main() {
	gl_FragColor = frag(v_pos, v_uv, v_color, u_tex);
	if (gl_FragColor.a == 0.0) {
		discard;
	}
}
`;
// default {{user}} vertex shader code
export const DEF_VERT = `
vec4 vert(vec2 pos, vec2 uv, vec4 color) {
	return def_vert();
}
`;
// default {{user}} fragment shader code
export const DEF_FRAG = `
vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
	return def_frag();
}
`;
export const COMP_DESC = new Set(["id", "require"]);
export const COMP_EVENTS = new Set([
    "add",
    "fixedUpdate",
    "update",
    "draw",
    "destroy",
    "inspect",
    "drawInspect",
]);
export const DEF_OFFSCREEN_DIS = 200;
// maximum y velocity with body()
export const DEF_JUMP_FORCE = 640;
export const MAX_VEL = 65536;
