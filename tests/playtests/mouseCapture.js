/**
 * @file Mouse capture
 * @description Test mouse release outside of the canvas
 * @minver 4000.0
 */

kaplay({
    width: 600,
    height: 400,
    logTime: Infinity,
});

debug.log(`Steps:

1. Hold mouse down on the canvas
2. Release it outside the canvas

Release event should be registered.`);

onMouseDown(() => debug.log("↓ holding"));
onMouseRelease(() => debug.warn("↑ released"));
