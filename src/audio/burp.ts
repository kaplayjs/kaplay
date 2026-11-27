import { _k } from "../shared";
import { playSound, type SoundPlay, type SoundPlayOpt } from "./play";

// core KAPLAY logic
export function burp(opt?: SoundPlayOpt): SoundPlay {
    if (!_k.game.defaultAssets.burp) {
        throw new Error("You can't use burp in kaplay/mini");
    }

    return playSound(_k.game.defaultAssets.burp, opt);
}
