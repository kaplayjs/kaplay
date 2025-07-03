import { lerp } from "../../math/lerp.js";
import { rand } from "../../math/math.js";
import { Vec2 } from "../../math/Vec2.js";
import { _k } from "../../shared.js";
import { center, flush } from "../stack.js";

export function drawFrame() {
    // calculate camera matrix
    const cam = _k.game.cam;
    const shake = Vec2.fromAngle(rand(0, 360)).scale(cam.shake);

    cam.shake = lerp(cam.shake, 0, 5 * _k.app.dt());
    cam.transform.setIdentity()
        .translateSelfV(center())
        .scaleSelfV(cam.scale)
        .rotateSelf(cam.angle)
        .translateSelfV((cam.pos ?? center()).scale(-1).add(shake));

    _k.game.root.draw();
    flush();
}
