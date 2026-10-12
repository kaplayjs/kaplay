/**
 * @file nextFrame
 * @description Defer fn to the next frame, same as wait(0)
 * @minver 4000.0
 */

kaplay({ logTime: Infinity });

debug.log("Second and consecutive clicks or key presses should say ohhi");

// without nextFrame, the object would be added in the same frame when events
// are processed, so you would see "ohhi" message on the first space key press

onKeyPress(() => {
    nextFrame(() => {
        const obj = add([]);
        obj.onKeyPress(() => {
            debug.log("ohhi");
        });
    });
    return cancel();
});

onMousePress(() => {
    nextFrame(() => {
        const obj = add([]);
        obj.onMousePress(() => {
            debug.log("ohhi");
        });
    });
    return cancel();
});
