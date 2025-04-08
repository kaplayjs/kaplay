kaplay();

loadBean();
const bean = add([
    sprite("bean"),
    pos(),
]);

const t = tween(
    bean.pos,
    center(),
    5,
    (p) => bean.pos = p,
    easings.easeOutQuint,
);

onUpdate(() => {
    debug.log("Time left for the tween to end: " + t.timeLeft);
});
