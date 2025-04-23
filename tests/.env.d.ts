import type { kaplay as KAPLAY } from "../src/kaplay";

declare global {
    const kaplay: typeof KAPLAY;
}
