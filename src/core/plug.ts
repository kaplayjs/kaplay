import { _k } from "../shared";
import type { KAPLAYCtx, KAPLAYPlugin } from "../types";

export const plug = <T extends Record<string, any>>(
    plugin: KAPLAYPlugin<T>,
    ...args: any
): KAPLAYCtx & T => {
    const funcs = plugin(_k.k);
    let funcsObj: T;
    if (typeof funcs === "function") {
        const plugWithOptions = funcs(...args);
        funcsObj = plugWithOptions(_k.k);
    }
    else {
        funcsObj = funcs;
    }

    for (const key in funcsObj) {
        _k.k[key as keyof typeof _k.k] = funcsObj[key];

        if (_k.globalOpt.global !== false) {
            window[key as any] = funcsObj[key];
        }
    }

    return _k.k as unknown as KAPLAYCtx & T;
};
