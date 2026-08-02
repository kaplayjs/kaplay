import type { GameObj } from "../types";

// Note: I will doom this soon 😈😈😈😈
export function getRenderProps(obj: GameObj<any>) {
    return {
        color: obj.color,
        opacity: obj.opacity,
        anchor: obj.anchor,
        outline: obj.outline,
        shader: obj.shader,
        uniform: obj.uniform,
        blend: obj.blend,
    };
}

export function defineReactiveProps<T extends object, O extends object>(
    obj: O,
    src: T,
    opt: {
        get?: <K extends keyof T>(this: O, key: K) => T[K];
        set?: <K extends keyof T>(this: O, key: K, value: T[K]) => void;
    },
) {
    for (const key of Object.keys(src) as Array<keyof T>) {
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: opt.get
                ? function(this: O) {
                    return opt.get!.call(this, key);
                }
                : function() {
                    return src[key];
                },
            ...(opt.set && {
                set(this: O, value) {
                    opt.set!.call(this, key, value);
                },
            }),
        });
    }

    return obj;
}
