import {
    resetTreeIndex,
    updateLastTransformVersion,
} from "../../ecs/entity/GameObjRaw";
import { lerp } from "../../math/lerp";
import { rand } from "../../math/math";
import { Vec2 } from "../../math/Vec2";
import { _k } from "../../shared";
import { center, flush } from "../stack";

export function transformFrame() {
    resetTreeIndex();
    _k.game.root.transformTree(false);
    updateLastTransformVersion();
}

export function drawFrame() {
    // calculate camera matrix
    const cam = _k.game.cam;
    let shake = Vec2.fromAngle(rand(0, 360)).scale(cam.shake);
    if (cam.shakeAxis) {
        shake = shake.project(cam.shakeAxis);
    }
    const shakeAlpha = 5 * _k.app.dt() * (cam.shakeSpeed ?? 1);

    cam.shake = lerp(cam.shake, 0, shakeAlpha);
    cam.transform.setIdentity()
        .translateSelfV(center())
        .scaleSelfV(cam.scale)
        .rotateSelf(cam.angle)
        .translateSelfV((cam.pos ?? center()).scale(-1).add(shake));

    _k.app.state.events.trigger("draw");
    _k.game.root.draw();
    flush();
}
