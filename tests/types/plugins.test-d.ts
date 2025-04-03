import { describe, expectTypeOf, test } from "vitest";
import { kaplay } from "../../src/kaplay";
import type { KAPLAYCtx } from "../../src/types";

type ImplicitTestPlug = ReturnType<typeof implicitTestPlug>;

const implicitTestPlug = (k: KAPLAYCtx) => ({
    getVersion() {
        return k.VERSION;
    },
});

describe("Type Inference from plugins", () => {
    // Inferred Plugin

    test("type of plugin should be inferred from kaplay({ plugins: [ implicitTestPlug ] })", () => {
        const k = kaplay({ plugins: [implicitTestPlug] });

        k.getVersion;

        expectTypeOf(k).toEqualTypeOf<
            KAPLAYCtx<{}, never> & ImplicitTestPlug
        >();
    });
});
