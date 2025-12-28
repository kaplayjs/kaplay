// Event handlers that uses the game state and game objects events.

import { _k } from "../../shared";
import type { Tag, GameObj } from "../../types";
import { overload2 } from "../../utils/overload";
import { on } from "./gameEventHandlers";

export const onFixedUpdate = overload2((action: () => void) => {
    return _k.app.state.events.on("fixedUpdate", action);
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("fixedUpdate", tag, action);
});

export const onUpdate = overload2((action: () => void) => {
    return _k.app.state.events.on("update", action);
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("update", tag, action);
});

export const onDraw = overload2((action: () => void) => {
    return _k.app.state.events.on("draw", action);
}, (tag: Tag, action: (obj: GameObj) => void) => {
    return on("draw", tag, action);
});

