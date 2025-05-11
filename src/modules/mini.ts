// The definitive version!
import { _k, updateEngine } from "../_k";
import type { ButtonsDef } from "../app/inputBindings";
import { createContext } from "../core/context";
import { createEngine } from "../core/engine";
import { createCollisionSystem } from "../ecs/systems/createCollisionSystem";
import { LCEvents, system } from "../ecs/systems/systems";
import {
    type KAPLAYCtx,
    type KAPLAYOpt,
    type KAPLAYPlugin,
    type MergePlugins,
    type PluginList,
} from "../types";

// If KAPLAY was runned before
let runned = false;

/**
 * Initialize KAPLAY context. The starting point of all KAPLAY games.
 *
 * @example
 * ```js
 * // Start KAPLAY with default options (will create a fullscreen canvas under <body>)
 * kaplay()
 *
 * // Init with some options
 * kaplay({
 *     width: 320,
 *     height: 240,
 *     font: "sans-serif",
 *     canvas: document.querySelector("#mycanvas"),
 *     background: [ 0, 0, 255, ],
 * })
 *
 * // All KAPLAY functions are imported to global after calling kaplay()
 * add()
 * onUpdate()
 * onKeyPress()
 * vec2()
 *
 * // If you want to prevent KAPLAY from importing all functions to global and use a context handle for all KAPLAY functions
 * const k = kaplay({ global: false })
 *
 * k.add(...)
 * k.onUpdate(...)
 * k.onKeyPress(...)
 * k.vec2(...)
 * ```
 *
 * @group Start
 */
export const kaplay = <
    TPlugins extends PluginList<unknown> = [undefined],
    TButtons extends ButtonsDef = {},
    TButtonsName extends string = keyof TButtons & string,
>(
    gopt: KAPLAYOpt<TPlugins, TButtons> = {},
): TPlugins extends [undefined] ? KAPLAYCtx<TButtons, TButtonsName>
    : KAPLAYCtx<TButtons, TButtonsName> & MergePlugins<TPlugins> =>
{
    if (runned) {
        console.warn(
            "KAPLAY was runned before, cleaning state",
        );

        // cleanup
        // @ts-ignore
        updateEngine(null);
    }

    runned = true;

    updateEngine(createEngine(gopt));

    const { app } = _k;

    const { checkFrame } = createCollisionSystem({
        narrow: gopt.narrowPhaseCollisionAlgorithm || "gjk",
    });

    system("collision", checkFrame, [
        LCEvents.AfterFixedUpdate,
        LCEvents.AfterUpdate,
    ]);

    _k.startLoop();

    // the exported ctx handle
    const ctx: KAPLAYCtx = createContext(
        _k,
        gopt.plugins as KAPLAYPlugin<Record<string, unknown>>[],
        gopt.global !== false,
    );

    if (gopt.focus !== false) {
        app.canvas.focus();
    }

    return ctx as unknown as TPlugins extends [undefined]
        ? KAPLAYCtx<TButtons, TButtonsName>
        : KAPLAYCtx<TButtons, TButtonsName> & MergePlugins<TPlugins>;
};

export default kaplay;
