import { ZComp } from "@/types";

export function z(z: number): ZComp {
    return {
        id: "z",
        z: z,
        inspect() {
            return `${this.z}`;
        },
    };
}
