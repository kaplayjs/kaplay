"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRenderProps = getRenderProps;
// Note: I will doom this soon 😈😈😈😈
function getRenderProps(obj) {
    return {
        color: obj.color,
        opacity: obj.opacity,
        anchor: obj.anchor,
        outline: obj.outline,
        shader: obj.shader,
        uniform: obj.uniform,
        blend: obj.blend,
    };
}
