import { StayComp } from "@/types";

export function stay(scenesToStay?: string[]): StayComp {
    return {
        id: "stay",
        stay: true,
        scenesToStay: scenesToStay,
    };
}
