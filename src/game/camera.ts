import { color } from "../ecs/components/draw/color";
import { opacity } from "../ecs/components/draw/opacity";
import { rect } from "../ecs/components/draw/rect";
import { fixed } from "../ecs/components/transform/fixed";
import { destroy } from "../ecs/entity/utils";
import { center, height, width } from "../gfx/stack";
import { type Color, rgb } from "../math/color";
import { type Mat23, vec2, type Vec2Args } from "../math/math";
import { Vec2 } from "../math/Vec2";
import { _k } from "../shared";
import { deprecateMsg } from "../utils/log";

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

export function shake(intensity: number | Vec2 = 12, duration?: number = 1) {
    _k.game.cam.shake += typeof intensity == "number"
        ? intensity
        : intensity.len();
    // shake visually "ends" when the intensity reaches 0.001 so we calculate the required alpha to get there in the requested duration
    _k.game.cam.shakeSpeed = (Math.log2(_k.game.cam.shake / 0.001) / 7.3391) / duration;
    // 7.3391 is 1/half-life if the duration is 1 since the alpha used is 5*dt*speed (see gfx/draw/drawFrame.ts)
        
        
    _k.game.cam.shakeAxis = typeof intensity == "number"
        ? undefined
        : intensity.unit();
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
