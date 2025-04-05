import { _k } from "../kaplay";
import { deprecateMsg } from "../utils/log";
export function setVolume(v: number) {
    _k.audio.masterNode.gain.value = v;
}

export function getVolume() {
    return _k.audio.masterNode.gain.value;
}

// get / set master volume
export function volume(v?: number): number {
    deprecateMsg("volume", "setVolume / getVolume");

    if (v !== undefined) {
        setVolume(v);
    }
    return getVolume();
}
