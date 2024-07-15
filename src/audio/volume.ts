import { audio } from "../kaplay";

// get / set master volume
export function volume(v?: number): number {
    if (v !== undefined) {
        audio.masterNode.gain.value = v;
    }
    return audio.masterNode.gain.value;
}
