import { describe, expectTypeOf, test } from "vitest";
import type { KAPLAYCtx } from "../../src/core/contextType";
import { kaplay } from "../../src/kaplay";

type ImplicitTestPlug = ReturnType<typeof implicitTestPlug>;

const implicitTestPlug = (k: KAPLAYCtx) => ({
    getVersion() {
        return k.VERSION;
    },
});

describe("Type Inference from plugins", () => {
    // Inferred plugins

    test("type of plugin should be inferred from kaplay({ plugins: [ implicitTestPlug ] })", () => {
        const k = kaplay({ plugins: [implicitTestPlug] });

        k.getVersion;

        expectTypeOf(k).toEqualTypeOf<
            KAPLAYCtx & ImplicitTestPlug
        >();
    });
});
