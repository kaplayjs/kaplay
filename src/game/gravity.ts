import { _k } from "../kaplay";
import { type Vec2, vec2 } from "../math/math";

export function setGravity(g: number) {
    // If g > 0 use either the current direction or use (0, 1)
    // Else null
    _k.game.gravity = g
        ? (_k.game.gravity || vec2(0, 1)).unit().scale(g)
        : null;
}

export function getGravity() {
    // If gravity > 0 return magnitude
    // Else 0
    return _k.game.gravity ? _k.game.gravity.len() : 0;
}

export function setGravityDirection(d: Vec2) {
    // If gravity > 0 keep magnitude, otherwise use 1
    _k.game.gravity = d.unit().scale(
        _k.game.gravity ? _k.game.gravity.len() : 1,
    );
}

export function getGravityDirection() {
    // If gravity != null return unit vector, otherwise return (0, 1)
    return _k.game.gravity ? _k.game.gravity.unit() : vec2(0, 1);
}
