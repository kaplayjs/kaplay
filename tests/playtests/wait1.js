/**
 * @file Wait
 * @description Test the behaviour of wait().
 * @difficulty 3
 * @tags basics
 * @minver 3001.0
 */

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
