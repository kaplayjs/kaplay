import {
    resetTreeIndex,
    updateLastTransformVersion,
} from "../../ecs/entity/GameObjRaw";
import { updateCamTransform } from "../../game/camera";
import { lerp } from "../../math/lerp";
import { rand } from "../../math/random";
import { Vec2 } from "../../math/Vec2";
import { _k } from "../../shared";
import { flush } from "../stack";

export function transformFrame() {
    resetTreeIndex();
    _k.game.root.transformTree(false);
    updateLastTransformVersion();
}

export function drawFrame() {
    // calculate camera matrix
    const cam = _k.game.cam;
    cam.frameShake = Vec2.fromAngle(rand(0, 360)).scale(cam.shake);

    cam.shake = lerp(cam.shake, 0, 5 * _k.app.dt());
    updateCamTransform();

    _k.app.state.events.trigger("draw");
    _k.game.root.draw();
    flush();
}
