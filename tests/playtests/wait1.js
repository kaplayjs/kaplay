kaplay();

const txt = add([
    pos(100, 100),
    text(""),
]);

var theTime = 0;
const foo = onUpdate(() => {
    theTime += dt();
    txt.text = theTime;
});

wait(1, () => {
    debug.log("callback");
}).onEnd(() => {
    debug.log("onEnd");
    foo.cancel();
});
