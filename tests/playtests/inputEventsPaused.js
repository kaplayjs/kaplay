kaplay();
const x = add([]);
const e = x.onKeyDown(() => {
    debug.log("key down");
});
e.paused = true;
x.paused = true;
x.paused = false;
debug.log("Should be true:", e.paused);
