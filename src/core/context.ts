import type { App } from "../app";
import type { AppGfxCtx } from "../gfx";
import { type KaboomCtx } from "../kaboom";

type ParametersOmitFirst<T extends (x: any, ...args: any) => any> = T extends
    (x: any, ...args: infer P) => any ? P : never;

type ParametersOmitFirst2<T extends (x: any, y: any, ...args: any) => any> =
    T extends (x: any, y: any, ...args: infer P) => any ? P : never;

type ParametersOmitFirst4<T extends (x: any, y: any, ...args: any) => any> =
    T extends (x: any, y: any, a: any, b: any, ...args: infer P) => any ? P
        : never;

export type Wrapper<T> = {
    current: T | null;
};

export type StrictWrapper<T> = {
    current: T;
};

// This works for methods, component that uses the components, this means
// is executed after kaplay() is called. If context doesn't exist,
// it will throw an error
export const withKaboomCtx = <
    T extends (k: KaboomCtx, ...args: any[]) => any,
    R extends ReturnType<T>,
>(
    func: T,
) => {
    return (k: Wrapper<KaboomCtx>): (
        ...args: ParametersOmitFirst<T>
    ) => R => {
        return (...args: ParametersOmitFirst<T>) => {
            if (!k.current) {
                throw new Error(
                    "Tried to use kaboom context before it was created.",
                );
            }

            return func(k.current, ...args);
        };
    };
};

// This works for methods that are created before kaplay() is called,
// but after app is created, for example make().
export const withApp = <
    T extends (app: App, ...args: any[]) => any,
    R extends ReturnType<T>,
>(
    func: T,
) => {
    return (app: App): (
        ...args: ParametersOmitFirst<T>
    ) => R => {
        return (...args: ParametersOmitFirst<T>) => {
            return func(app, ...args);
        };
    };
};

// This works for access gfx before kaplay() is called,
// but after gfx is created.
export const withGfx = <
    T extends (gfx: AppGfxCtx, ...args: any[]) => any,
    R extends ReturnType<T>,
>(
    func: T,
) => {
    return (gfx: AppGfxCtx): (
        ...args: ParametersOmitFirst<T>
    ) => R => {
        return (...args: ParametersOmitFirst<T>) => {
            return func(gfx, ...args);
        };
    };
};

type Game = any;

export const withGame = <
    T extends (game: Game, ...args: any[]) => any,
    R extends ReturnType<T>,
>(
    func: T,
) => {
    return (game: Game): (
        ...args: ParametersOmitFirst<T>
    ) => R => {
        return (...args: ParametersOmitFirst<T>) => {
            return func(game, ...args);
        };
    };
};

export const withAppAndKaboom = <
    T extends (app: App, k: KaboomCtx, ...args: any[]) => any,
    R extends ReturnType<T>,
>(func: T) => {
    return (app: App, k: Wrapper<KaboomCtx>): (
        ...args: ParametersOmitFirst2<T>
    ) => R => {
        return (...args: ParametersOmitFirst2<T>) => {
            if (!k.current) {
                throw new Error(
                    "Tried to use kaboom context before it was created.",
                );
            }

            return func(app, k.current, ...args);
        };
    };
};

export const withGfxAndKaboom = <
    T extends (gfx: AppGfxCtx, k: KaboomCtx, ...args: any[]) => any,
    R extends ReturnType<T>,
>(func: T) => {
    return (gfx: AppGfxCtx, k: Wrapper<KaboomCtx>): (
        ...args: ParametersOmitFirst2<T>
    ) => R => {
        return (...args: ParametersOmitFirst2<T>) => {
            if (!k.current) {
                throw new Error(
                    "Tried to use kaboom context before it was created.",
                );
            }

            return func(gfx, k.current, ...args);
        };
    };
};

// This context wraps some functions and wrappers even if they doesn't exist.
export const withFullCtx = <
    T extends (
        app: App,
        gfx: AppGfxCtx,
        game: Wrapper<Game>,
        k: StrictWrapper<KaboomCtx>,
        ...args: any[]
    ) => any,
    R extends ReturnType<T>,
>(
    func: T,
) => {
    return (
        app: App,
        gfx: AppGfxCtx,
        game: Wrapper<Game>,
        k: Wrapper<KaboomCtx>,
    ): (
        ...args: ParametersOmitFirst4<T>
    ) => R => {
        return (...args: ParametersOmitFirst4<T>) => {
            return func(
                app,
                gfx,
                game,
                k as StrictWrapper<KaboomCtx>,
                ...args,
            );
        };
    };
};
