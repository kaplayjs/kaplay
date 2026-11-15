import { color } from "../ecs/components/draw/color";
import { opacity } from "../ecs/components/draw/opacity";
import { rect } from "../ecs/components/draw/rect";
import { fixed } from "../ecs/components/transform/fixed";
import { destroy } from "../ecs/entity/utils";
import { center, flush, height, width } from "../gfx/stack";
import { type Color, rgb } from "../math/color";
import { type Mat23, vec2, type Vec2Args } from "../math/math";
import { rand } from "../math/random";
import { Vec2 } from "../math/Vec2";
import { _k } from "../shared";
import { deprecateMsg } from "../utils/log";

export function setCamPos(...pos: Vec2Args) {
    changeCamera(() => {
        _k.game.cam.pos = vec2(...pos);
    });
}

export function getCamPos(): Vec2 {
    return _k.game.cam.pos ? _k.game.cam.pos.clone() : center();
}

export function setCamScale(...scale: Vec2Args) {
    changeCamera(() => {
        _k.game.cam.scale = vec2(...scale);
    });
}

export function getCamScale(): Vec2 {
    return _k.game.cam.scale.clone();
}

export function setCamRot(angle: number) {
    changeCamera(() => {
        _k.game.cam.angle = angle;
    });
}

export function getCamRot(): number {
    return _k.game.cam.angle;
}

export function getCamTransform(): Mat23 {
    return _k.game.cam.transform.clone();
}

export function updateCamTransform(): void {
    const cam = _k.game.cam;
    const origin = center();
    const position = cam.pos ?? origin;
    cam.transform.setIdentity()
        .translateSelfV(origin)
        .scaleSelfV(cam.scale)
        .rotateSelf(cam.angle)
        .translateSelfV(position.scale(-1).add(cam.frameShake));
}

let layerDrawHookDepth = 0;

function changeCamera(action: () => void): void {
    if (layerDrawHookDepth > 0) flush();
    action();
    if (layerDrawHookDepth > 0) updateCamTransform();
}

export function withLayerDrawHook(action: () => void): void {
    layerDrawHookDepth++;
    try {
        action();
    } finally {
        layerDrawHookDepth--;
    }
}

export function flash(
    flashColor: Color = rgb(255, 255, 255),
    fadeOutTime: number = 1,
) {
    let flash = _k.game.root.add([
        rect(width(), height()),
        color(flashColor),
        opacity(1),
        fixed(),
    ]);
    let fade = flash.fadeOut(fadeOutTime);
    fade.onEnd(() => destroy(flash));
    return fade;
}

export function shake(intensity: number = 12) {
    changeCamera(() => {
        const cam = _k.game.cam;
        cam.shake += intensity;
        if (layerDrawHookDepth > 0 && intensity !== 0) {
            cam.frameShake = Vec2.fromAngle(rand(0, 360)).scale(cam.shake);
        }
    });
}

export function toScreen(p: Vec2): Vec2 {
    return _k.game.cam.transform.transformPointV(p, new Vec2());
}

export function toWorld(p: Vec2): Vec2 {
    return _k.game.cam.transform.inverse.transformPointV(p, new Vec2());
}

export function camPos(...pos: Vec2Args): Vec2 {
    deprecateMsg("camPos", "setCamPos / getCamPos");

    if (pos.length > 0) {
        setCamPos(...pos);
    }
    return getCamPos();
}

export function camScale(...scale: Vec2Args): Vec2 {
    deprecateMsg("camScale", "setCamScale / getCamScale");

    if (scale.length > 0) {
        setCamScale(...scale);
    }
    return getCamScale();
}

export function camRot(angle: number): number {
    deprecateMsg("camRot", "setCamRot / getCamRot");

    if (angle !== undefined) {
        setCamRot(angle);
    }
    return getCamRot();
}

export function camFlash(
    flashColor: Color = rgb(255, 255, 255),
    fadeOutTime: number = 1,
) {
    deprecateMsg("camFlash", "flash");

    return flash(flashColor, fadeOutTime);
}

export function camTransform(): Mat23 {
    deprecateMsg("camTransform", "getCamTransform");

    return getCamTransform();
}
