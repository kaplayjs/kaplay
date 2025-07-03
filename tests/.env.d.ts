import type { kaplay as KAPLAY } from "../src/kaplay.js";

declare global {
    const kaplay: typeof KAPLAY;
}
