// The definitive version!
import { SoundData } from "./assets/sound";
import { loadSprite } from "./assets/sprite";
import { createEmptyAudioBuffer } from "./audio/audio";
import { createContext } from "./core/context";
import type { KAPLAYCtx } from "./core/contextType";
import { createEngine } from "./core/engine";
import type {
    KAPLAYCtxT,
    KAPLAYOptTypeOptions,
    KAPLAYTypeOptWithoutPlugins,
    TypesOpt,
} from "./core/taf";
import beanSrc from "./data/assets/bean.png";
import boomSpriteSrc from "./data/assets/boom.png";
import burpSoundSrc from "./data/assets/burp.mp3";
import happyFontSrc from "./data/assets/happy.png";
import kaSpriteSrc from "./data/assets/ka.png";
import { _setTopMostOnlyActivate } from "./ecs/components/physics/area";
import { createCollisionSystem } from "./ecs/systems/createCollisionSystem";
import { system, SystemPhase } from "./ecs/systems/systems";
import { _k, updateEngine } from "./shared";
import {
    type KAPLAYOpt,
    type KAPLAYPlugin,
    type MergePlugins,
    type PluginList,
} from "./types";

// If KAPLAY was runned before
let runned = false;

type HasDefinedKeys<TObj, TCheck> = {
    [K in keyof TCheck & keyof TObj]: TObj[K] extends undefined ? never : K;
}[keyof TCheck & keyof TObj] extends never ? never : TObj;

type ChooseKAPLAYCtx<O extends KAPLAYOptTypeOptions> =
    HasDefinedKeys<O, KAPLAYTypeOptWithoutPlugins> extends never ? KAPLAYCtx
        : KAPLAYCtxT<O>;

type KAPLAYGame<O extends KAPLAYOptTypeOptions | undefined> = O extends
    KAPLAYOptTypeOptions ? O["plugins"] extends PluginList<any> ?
            & ChooseKAPLAYCtx<O>
            & MergePlugins<O["plugins"]>
    : ChooseKAPLAYCtx<O>
    : KAPLAYCtx;

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
    O extends KAPLAYOpt,
>(
    opt?: O,
): KAPLAYGame<O> => {
    if (runned) {
        console.warn(
            "KAPLAY was runned before, cleaning state",
        );

        // cleanup
        // @ts-ignore
        updateEngine(null);
    }

    const gopt = opt ?? {} as KAPLAYOpt;

    runned = true;

    updateEngine(createEngine(gopt));

    const {
        app,
        game,
        audio,
    } = _k;

    const { checkFrame, retrieve } = createCollisionSystem({
        broad: gopt.broadPhaseCollisionAlgorithm || "sap",
        narrow: gopt.narrowPhaseCollisionAlgorithm || "gjk",
        opt: gopt,
    });

    game.retrieve = retrieve;

    _setTopMostOnlyActivate(gopt.topMostOnlyActivate ?? false);

    system("collision", checkFrame, [
        SystemPhase.AfterFixedUpdate,
        SystemPhase.AfterUpdate,
    ]);

    // #region Loading default assets
    game.defaultAssets.ka = loadSprite(null, kaSpriteSrc);
    game.defaultAssets.boom = loadSprite(null, boomSpriteSrc);

    // by default browsers can only load audio async, we don't deal with that and just start with an empty audio buffer
    const burpSnd = new SoundData(createEmptyAudioBuffer(audio.ctx));

    // load that burp sound
    audio.ctx.decodeAudioData(burpSoundSrc.buffer.slice(0) as ArrayBuffer).then(
        (buf) => {
            burpSnd.buf = buf;
            game.defaultAssets.burp = burpSnd;
        },
    ).catch((err) => {
        console.error("Failed to load burp: ", err);
    });

    game.defaultAssets.bean = beanSrc;
    game.defaultAssets.happy = happyFontSrc;
    // #endregion

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

    return ctx as KAPLAYGame<O>;
};

export const kaplayTypes = <T extends TypesOpt = TypesOpt>(): T => {
    return null as unknown as T;
};

export default kaplay;
