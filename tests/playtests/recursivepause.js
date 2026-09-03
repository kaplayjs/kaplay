/**
 * @file Recursive Paused
 * @description The pause and unpause events are recursive
 * @difficulty 3
 * @tags debug
 * @minver 4000.0
 */

kaplay({ background: "black" });

const t = add([text("testing..."), pos(100, 100)]);

const a = add([]);
const b = a.add([]);
const c = b.add(["final"]);
onPause("final", () => {
    t.text += "\nPASSED!";
});
c.onUnpause(() => {
    t.text += "\nFAILED!";
});

// This causes a, b, c to fire onPause
a.paused = true;
// the tree is already paused, so this won't change anything
b.paused = true;
// this will unpause only the parent a because b is already paused
a.paused = false;
