import { color } from "../ecs/components/draw/color";
import { opacity } from "../ecs/components/draw/opacity";
import { rect } from "../ecs/components/draw/rect";
import { fixed } from "../ecs/components/transform/fixed";
import { center, height, width } from "../gfx/stack";
import { _k } from "../kaplay";
import { type Color, rgb } from "../math/color";
import { type Mat23, Vec2, vec2, type Vec2Args } from "../math/math";
import { deprecateMsg } from "../utils/log";
import { destroy } from "./object";

export function setCamPos(...pos: Vec2Args) {
    _k.game.cam.pos = vec2(...pos);
}

export function getCamPos(): Vec2 {
    return _k.game.cam.pos ? _k.game.cam.pos.clone() : center();
}

export function setCamScale(...scale: Vec2Args) {
    _k.game.cam.scale = vec2(...scale);
}

export function getCamScale(): Vec2 {
    return _k.game.cam.scale.clone();
}

export function setCamRot(angle: number) {
    _k.game.cam.angle = angle;
}

export function getCamRot(): number {
    return _k.game.cam.angle;
}

export function getCamTransform(): Mat23 {
    return _k.game.cam.transform.clone();
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
    _k.game.cam.shake += intensity;
}

export function toScreen(p: Vec2): Vec2 {
    return _k.game.cam.transform.transformPoint(p, new Vec2());
}

export function toWorld(p: Vec2): Vec2 {
    return _k.game.cam.transform.inverse.transformPoint(p, new Vec2());
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
