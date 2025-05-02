import { describe, expectTypeOf, test } from "vitest";
import { kaplay } from "../../src/kaplay";
import type { KAPLAYCtx } from "../../src/types";

const implicitTestPlug = (k: KAPLAYCtx) => ({
    getVersion() {
        return k.VERSION;
    },
});

describe("Type Inference from plugins", () => {
    // Inferred Plugin

    test("type of plugin should be inferred from kaplay({ plugins: [ implicitTestPlug ] })", () => {
        const k = kaplay({ plugins: [implicitTestPlug] });

        expectTypeOf(k.getVersion).toEqualTypeOf<() => string>();
    });
});
