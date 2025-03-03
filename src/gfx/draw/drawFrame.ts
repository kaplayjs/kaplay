import { _k } from "../../kaplay";
import { lerp, rand, Vec2 } from "../../math/math";
import { center, flush } from "../stack";

export function drawFrame() {
    // calculate camera matrix
    const cam = _k.game.cam;
    const shake = Vec2.fromAngle(rand(0, 360)).scale(cam.shake);

    cam.shake = lerp(cam.shake, 0, 5 * _k.k.dt());
    cam.transform.setIdentity()
        .translateSelfV(center())
        .scaleSelfV(cam.scale)
        .rotateSelf(cam.angle)
        .translateSelfV((cam.pos ?? center()).scale(-1).add(shake));

    _k.game.root.draw();
    flush();
}
