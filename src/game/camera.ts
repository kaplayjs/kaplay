import { color, fixed, opacity, rect } from "../components";
import { center, height, width } from "../gfx";
import { game } from "../kaplay";
import { type Color, rgb } from "../math/color";
import { type Mat23, type Vec2, vec2, type Vec2Args } from "../math/math";
import { destroy } from ".";

export function camPos(...pos: Vec2Args): Vec2 {
    if (pos.length > 0) {
        game.cam.pos = vec2(...pos);
    }
    return game.cam.pos ? game.cam.pos.clone() : center();
}

export function camScale(...scale: Vec2Args): Vec2 {
    if (scale.length > 0) {
        game.cam.scale = vec2(...scale);
    }
    return game.cam.scale.clone();
}

export function camRot(angle: number): number {
    if (angle !== undefined) {
        game.cam.angle = angle;
    }
    return game.cam.angle;
}

export function camFlash(
    flashColor: Color = rgb(255, 255, 255),
    fadeOutTime: number = 1,
) {
    let flash = game.root.add([
        rect(width(), height()),
        color(flashColor),
        opacity(1),
        fixed(),
    ]);
    let fade = flash.fadeOut(fadeOutTime);
    fade.onEnd(() => destroy(flash));
    return fade;
}

export function camTransform(): Mat23 {
    return game.cam.transform.clone();
}

export function shake(intensity: number = 12) {
    game.cam.shake += intensity;
}

export function toScreen(p: Vec2): Vec2 {
    return game.cam.transform.transformPoint(p, vec2());
}

export function toWorld(p: Vec2): Vec2 {
    return game.cam.transform.inverse.transformPoint(p, vec2());
}
