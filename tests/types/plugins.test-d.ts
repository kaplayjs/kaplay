import { describe, expectTypeOf, test } from "vitest";
import type { KAPLAYCtx } from "../../src";
import { kaplay } from "../../src/kaplay";

type ImplicitTestPlug = ReturnType<typeof implicitTestPlug>;

const implicitTestPlug = (k: KAPLAYCtx) => ({
    getVersion() {
        return k.VERSION;
    },
});

describe("Type Inference from plugins", () => {
    // Infered Plugin

    test("type of plugin should be infered from kaplay({ plugins: [ implicitTestPlug ] })", () => {
        const k = kaplay({ plugins: [implicitTestPlug] });

        k.getVersion;

        expectTypeOf(k).toEqualTypeOf<
            KAPLAYCtx<{}, never> & ImplicitTestPlug
        >();
    });
});
