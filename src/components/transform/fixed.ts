import type { Comp } from "../../types";

/**
 * The {@link fixed `fixed()`} component.
 *
 * @group Component Types
 */
export interface FixedComp extends Comp {
    /**
     * If the obj is unaffected by camera
     */
    fixed: boolean;
}

export function fixed(): FixedComp {
    return {
        id: "fixed",
        fixed: true,
    };
}
