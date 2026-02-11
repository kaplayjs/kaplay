kaplay();

loadBean();
const bean = add([sprite("bean"), pos()]);

const tweening = tween(
    bean.pos,
    center(),
    5,
    (p) => bean.pos = p,
    easings.easeOutQuint,
);

// Also has a setter
onMousePress(() => {
    tweening.timeLeft = 5;
});

onUpdate(() => {
    debug.log(`${tweening.currentTime}/5`);
});
