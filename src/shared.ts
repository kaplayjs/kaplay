import type { Engine } from "./core/engine.js";

/**
 * KAPLAY.js internal data
 */

export let _k: Engine;

export function updateEngine(e: Engine) {
    _k = e;
}
