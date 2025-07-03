"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawRaw = drawRaw;
var asset_1 = require("../../assets/asset");
var shader_1 = require("../../assets/shader");
var shared_1 = require("../../shared");
var types_1 = require("../../types");
var stack_1 = require("../stack");
function drawRaw(attributes, indices, fixed, tex, shaderSrc, uniform, blend) {
    if (fixed === void 0) fixed = false;
    var parsedTex = tex !== null && tex !== void 0
        ? tex
        : shared_1._k.gfx.defTex;
    var parsedShader = shaderSrc !== null && shaderSrc !== void 0
        ? shaderSrc
        : shared_1._k.gfx.defShader;
    var shader = (0, shader_1.resolveShader)(parsedShader);
    if (!shader || shader instanceof asset_1.Asset) {
        return;
    }
    var transform = shared_1._k.gfx.transform;
    var vertLength = attributes.pos.length / 2;
    var vv = new Array(vertLength * 8);
    var index = 0;
    for (var i = 0; i < vertLength; i++) {
        shared_1._k.gfx.scratchPt.x = attributes.pos[i * 2];
        shared_1._k.gfx.scratchPt.y = attributes.pos[i * 2 + 1];
        transform.transformPointV(
            shared_1._k.gfx.scratchPt,
            shared_1._k.gfx.scratchPt,
        );
        vv[index++] = shared_1._k.gfx.scratchPt.x;
        vv[index++] = shared_1._k.gfx.scratchPt.y;
        vv[index++] = attributes.uv[i * 2];
        vv[index++] = attributes.uv[i * 2 + 1];
        vv[index++] = attributes.color[i * 3] / 255;
        vv[index++] = attributes.color[i * 3 + 1] / 255;
        vv[index++] = attributes.color[i * 3 + 2] / 255;
        vv[index++] = attributes.opacity[i];
    }
    shared_1._k.gfx.renderer.push(
        shared_1._k.gfx.ggl.gl.TRIANGLES,
        vv,
        indices,
        shader,
        parsedTex,
        uniform,
        blend !== null && blend !== void 0 ? blend : types_1.BlendMode.Normal,
        (0, stack_1.width)(),
        (0, stack_1.height)(),
        shared_1._k.gfx.fixed || fixed,
    );
}
