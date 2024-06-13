import type { Comp, NamedComp } from "@/types";

export function named(name: string): NamedComp {
    return {
        name,
    };
}
