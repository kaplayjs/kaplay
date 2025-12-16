kaplay();
loadBean();

const spinningBean = add([
    pos(100, 100),
    sprite("bean"),
    anchor("top"),
    rotate(),
    {
        update() {
            this.angle += 300 * dt();
        },
    },
]);

const scalingBean = add([
    pos(200, 100),
    sprite("bean"),
    anchor("top"),
    rotate(),
    scale(),
    constraint.rotation(spinningBean, { ratio: 0.9, trackMultiturn: true }),
]);

onUpdate(() => {
    const flip = Math.floor(time() * 100) % 2 ? 1 : -0.5;
    console.log(Math.floor(time()), Math.floor(time()) % 2, flip);
    const zoom = wave(0.5, 1, time() * 3);
    scalingBean.scaleTo(zoom, zoom * flip);
});
