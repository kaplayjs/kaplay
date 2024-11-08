import { _k } from "../kaplay";
import { type AudioPlay, type AudioPlayOpt, play } from "./play";

// core KAPLAY logic
export function burp(opt?: AudioPlayOpt): AudioPlay {
    return _k.k.play(_k.audio.burpSnd, opt);
}
