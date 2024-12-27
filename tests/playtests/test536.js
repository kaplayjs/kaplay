kaplay();

loadBean();

const bean = add([
    sprite("bean"),
    pos(),
    offscreen({ pause: true, unpause: true }),
    rotate(),
    anchor("center"),
    {
        update() {
            this.angle += 400 * dt();
        },
    },
]);

camPos(0, 0);
wait(1, () => {
    camPos(1000, 1000);
    wait(1, () => {
        camPos(0, 0);
    });
});

onUpdate(() => {
    debug.log(bean.isOffScreen());
});
