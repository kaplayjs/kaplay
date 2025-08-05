import type { Engine } from "./core/engine";

/**
 * KAPLAY.js internal data
 *
 * @ignore
 */
export let _k: Engine;

/** @ignore */
export function updateEngine(e: Engine) {
    _k = e;
}
