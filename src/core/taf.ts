import type { ButtonBinding } from "../app/inputBindings";
import type { KEventController } from "../events/events";
import type { ScopeHandlers } from "../events/scopeHandlers";
import type { KAPLAYOpt } from "../types";
import type { KAPLAYCtx } from "./contextType";

export type InfKAPLAYOpt<T extends KAPLAYOpt = KAPLAYOpt> = {
    buttons: T extends { buttons: infer B } ? B : undefined;
    plugins: T extends { plugins: infer P } ? P : undefined;
    scenes: T extends { types: infer P }
        ? P extends { scenes: infer S } ? S : undefined
        : undefined;
    tags: T extends { types: infer P }
        ? P extends { tags: infer T } ? T : undefined
        : undefined;
    strictScenes: T extends { types: infer P }
        ? P extends { strictScenes: infer S } ? S : undefined
        : undefined;
    strictTag: T extends { types: infer P }
        ? P extends { strictTags: infer T } ? T : undefined
        : undefined;
};

export type OptionalString<T extends string> = T | {} & string;

/**
 * Type options for the KAPLAY context.
 */
export type TypesOpt = {
    /**
     * Scene types, made for inference in
     *
     * - `go()`
     * - `scene()`
     * - `stay()`
     */
    scenes?: {
        [key in string]?: any[];
    };
    /**
     * Tag types, made for inference in
     *
     * - `get()`
     * - all `on()` functions
     */
    // tags?: {
    //     [key in string]: Comp;
    // };
    /**
     * If `true`, the scene name must be only the ones defined in `scenes`.
     */
    strictScenes?: boolean;
    /**
     * If `true`, the tag name must be only the ones defined in `tags`.
     */
    //    strictTags?: boolean;
};

export type Opt<T extends TypesOpt = TypesOpt> = T;

export type KAPLAYOptTypeOptions = Pick<
    KAPLAYOpt,
    "buttons" | "plugins" | "types"
>;

export type KAPLAYTypeOptWithoutPlugins = Omit<KAPLAYOptTypeOptions, "plugins">;
// Helpers

type SceneName<O extends KAPLAYOptTypeOptions> =
    InfKAPLAYOpt<O>["scenes"] extends undefined ? string
        : InfKAPLAYOpt<O>["strictScenes"] extends true
            ? keyof InfKAPLAYOpt<O>["scenes"]
        : OptionalString<Extract<keyof InfKAPLAYOpt<O>["scenes"], string>>;

type SceneArgs<TScene, TSceneMap> = TScene extends keyof TSceneMap
    ? TSceneMap[TScene] extends Array<any> ? TSceneMap[TScene] : any[]
    : any[];

// export type TagName<O extends KAPLAYTypeOpt = any> = O extends KAPLAYTypeOpt
//     ? keyof O["tags"] extends undefined ? string
//     : O["strictTags"] extends true ? Extract<keyof O["tags"], string>
//     : OptionalString<Extract<keyof O["tags"], string>>
//     : string;

export type ButtonName<TOpt extends KAPLAYOptTypeOptions> =
    keyof TOpt["buttons"] extends undefined ? string
        : TOpt["buttons"] extends Record<string, ButtonBinding>
            ? Extract<keyof TOpt["buttons"], string>
        : OptionalString<Extract<keyof TOpt["buttons"], string>>;

// export type CompFromTag<O extends KAPLAYTypeOpt, TTag> = TTag extends
//     keyof O["tags"] ? O["tags"][TTag]
//     : any;

// #region Scopes
export type SceneScopeT<
    O extends KAPLAYOptTypeOptions = any,
> = ScopeHandlers & {
    <T extends SceneName<O>>(
        name: T,
        def: (
            ...args: SceneArgs<T, InfKAPLAYOpt<O>["scenes"]>
        ) => void,
    ): void;
};

// #endregion

// Typed Context

export interface KAPLAYCtxTMethods<
    O extends KAPLAYOptTypeOptions = any,
> {
    scene: SceneScopeT<O>;

    go<T extends SceneName<O>>(
        name: T,
        ...args: SceneArgs<T, InfKAPLAYOpt<O>["scenes"]>
    ): void;

    pushScene<T extends SceneName<O>>(
        T: string,
        ...args: SceneArgs<T, InfKAPLAYOpt<O>["scenes"]>
    ): void;

    getSceneName(): SceneName<O> | null;

    // Buttons API
    onButtonPress(
        btn: ButtonName<O> | ButtonName<O>[],
        action: (btn: ButtonName<O>) => void,
    ): KEventController;
    onButtonPress(action: (btn: ButtonName<O>) => void): KEventController;

    onButtonRelease(
        btn: ButtonName<O> | ButtonName<O>[],
        action: (btn: ButtonName<O>) => void,
    ): KEventController;
    onButtonRelease(action: (btn: ButtonName<O>) => void): KEventController;

    onButtonDown(
        btn: string | string[],
        action: (btn: string) => void,
    ): KEventController;
    onButtonDown(action: (btn: ButtonName<O>) => void): KEventController;

    isButtonPressed(btn?: ButtonName<O> | ButtonName<O>[]): boolean;
    isButtonDown(btn?: ButtonName<O> | ButtonName<O>[]): boolean;
    isButtonReleased(btn?: ButtonName<O> | ButtonName<O>[]): boolean;

    getButton(btn: ButtonName<O>): ButtonBinding;

    pressButton(btn: ButtonName<O>): void;
    releaseButton(btn: ButtonName<O>): void;
}

export type KAPLAYCtxT<O extends KAPLAYOptTypeOptions = any> =
    & KAPLAYCtxTMethods<O>
    & Omit<KAPLAYCtx, keyof KAPLAYCtxTMethods<O>>;
