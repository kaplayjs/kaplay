import { _k } from "../_k";
import { type AudioPlay, type AudioPlayOpt } from "./play";

// core KAPLAY logic
export function burp(opt?: AudioPlayOpt): AudioPlay {
    if (!_k.game.defaultAssets.burp) {
        throw new Error("You can't use burp in kaplay/mini");
    }

    return _k.k.play(_k.game.defaultAssets.burp, opt);
}
