import type { Comp } from "../../../types";

/**
 * The serialized {@link stay `stay()`} component.
 *
 * @group Components
 * @subgroup Component Serialization
 */
export interface SerializedStayComp {
    scenesToStay: string[];
}

/**
 * The {@link stay `stay()`} component.
 *
 * @group Components
 * @subgroup Component Types
 */
export interface StayComp extends Comp {
    /**
     * If the obj should not be destroyed on scene switch.
     */
    stay: boolean;
    /**
     * Array of scenes that the obj will stay on.
     */
    scenesToStay?: string[];
    serialize(): SerializedStayComp;
}

export function stay(scenesToStay?: string[]): StayComp {
    return {
        id: "stay",
        stay: true,
        scenesToStay,
        serialize() {
            return {
                scenesToStay: scenesToStay ?? [],
            };
        },
    };
}

export function stayFactory(data: SerializedStayComp) {
    return stay(data.scenesToStay);
}
