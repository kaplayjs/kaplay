import { dt } from "../../app/frame";
import { game } from "../../kaplay";
import { lerp, Mat23, rand, Vec2 } from "../../math/math";
import { center, flush } from "../stack";

export function drawFrame() {
    // calculate camera matrix
    const cam = game.cam;
    const shake = Vec2.fromAngle(rand(0, 360)).scale(cam.shake);

    cam.shake = lerp(cam.shake, 0, 5 * dt());
    cam.transform = new Mat23()
        .translateSelfV(center())
        .scaleSelfV(cam.scale)
        .rotateSelf(cam.angle)
        .translateSelfV((cam.pos ?? center()).scale(-1).add(shake));

    game.root.draw();
    flush();
}
