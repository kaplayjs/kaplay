import { describe, expectTypeOf, test } from "vitest";
import { kaplay } from "../../src/kaplay";
import type { KAPLAYCtx } from "../../src/types";

const implicitTestPlug = (k: KAPLAYCtx) => ({
    getVersion() {
        return k.VERSION;
    },
});

describe("Type Inference from plugins", () => {
    test("kaplay() should infer plugin methods and add them to context", () => {
        const k = kaplay({
            plugins: [
                implicitTestPlug,
            ],
        });

        expectTypeOf(k.getVersion).toEqualTypeOf<() => string>();
    });
});
