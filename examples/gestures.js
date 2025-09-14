kaplay();

onTouchStart(() => {
    debug.log("touch start");
});

gestures.onTap(1, point => {
    debug.log(`one finger tap at ${point}`);
});

gestures.onSwipe(1, (delta) => {
    debug.log(`one finger swipe by ${delta}, `);
});

gestures.onSwipe(2, (delta) => {
    debug.log(`two finger swipe by ${delta}, `);
});

gestures.onPinch((center, scale) => {
    debug.log(`two finger pinch of ${scale} around ${center}`);
});

gestures.onRotate(2, (center, angle) => {
    debug.log(`two finger rotate of ${angle} degrees around ${center}`);
});
