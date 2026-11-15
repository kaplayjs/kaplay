import kaplay from "../../src/kaplay";

const k = kaplay();
const before = k.onBeforeLayerDraw("layer", () => {});
const after = k.onAfterLayerDraw("layer", () => {});
before.paused = true;
after.cancel();
before.cancel();
after.paused = true;
const beforePaused: boolean = before.paused;
const afterPaused: boolean = after.paused;
void beforePaused;
void afterPaused;
