kaplay();
loadBean();

const spinningBean = add([
    pos(100, 100),
    sprite("bean"),
    anchor("center"),
    rotate(),
    {
        update() {
            this.angle += 120 * dt();
        },
    },
]);

const scalingBean = add([
    pos(200, 100),
    sprite("bean"),
    anchor("center"),
    rotate(),
    scale(),
    constraint.rotation(spinningBean, { scale: 1 }),
]);

onUpdate(() => {
    const flip = Math.floor(time()) % 2 ? 1 : -1;
    console.log(Math.floor(time()), Math.floor(time()) % 2, flip);
    const zoom = wave(0, 1, time() * 3);
    scalingBean.scaleTo(zoom * flip, zoom);
});
