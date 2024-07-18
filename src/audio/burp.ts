import { audio } from "../kaplay";
import { type AudioPlay, type AudioPlayOpt, play } from "./play";

// core KAPLAY logic
export function burp(opt?: AudioPlayOpt): AudioPlay {
    return play(audio.burpSnd, opt);
}
