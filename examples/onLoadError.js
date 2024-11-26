// @ts-check

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
