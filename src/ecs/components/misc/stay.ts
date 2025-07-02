import type { Comp } from "../../../types";

/**
 * The serialized {@link stay `stay()`} component.
 *
 * @group Component Serializations
 */
export interface SerializeStayComp {
    scenesToStay: string[],
}

/**
 * The {@link stay `stay()`} component.
 *
 * @group Component Types
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
    serialize(): SerializeStayComp
}

export function stay(scenesToStay?: string[]): StayComp {
    return {
        id: "stay",
        stay: true,
        scenesToStay,
        serialize() {
            return {
                scenesToStay: scenesToStay ?? []
            }
        },
    };
}

export function stayFactory(data: SerializeStayComp) {
    return stay(data.scenesToStay)
}

