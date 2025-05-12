import type { Engine } from "./core/engine";

/**
 * KAPLAY.js internal data
 */

export let _k: Engine;

export function updateEngine(e: Engine) {
    _k = e;
}
