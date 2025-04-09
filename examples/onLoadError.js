/**
 * @file Load Error
 * @description How to handle errors on load.
 * @difficulty 1
 * @tags project
 * @minver 3001.0
 */

kaplay();

// this will not load
loadSprite("bobo", "notavalidURL");

// process the load error
// you decide whether to ignore it, or throw an error and halt the game
onLoadError((name, asset) => {
    // ignore it:
    debug.error(`${name} failed to load: ${asset.error}`);
    // throw an error:
    throw asset.error;
});
