import { _k } from "../kaplay";

// get / set master volume
export function volume(v?: number): number {
    if (v !== undefined) {
        _k.audio.masterNode.gain.value = v;
    }
    return _k.audio.masterNode.gain.value;
}
