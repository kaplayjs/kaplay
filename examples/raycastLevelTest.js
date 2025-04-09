/**
 * @file Post-Effect
 * @description How to use a post effect shader in KAPLAY.
 * @difficulty 1
 * @tags effects
 * @minver 3001.0
 */

kaplay();

const level = addLevel([
    "a",
], {
    tileHeight: 100,
    tileWidth: 100,
    tiles: {
        a: () => [
            rect(32, 32),
            area(),
            color(RED),
        ],
    },
});
try {
    level.raycast(vec2(50, 50), vec2(-50, -50));
} catch (e) {
    debug.error(e.stack);
    throw e;
}
