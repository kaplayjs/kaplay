// multiple kaboom contexts in one page

const backgrounds = [
    [255, 0, 255],
    [0, 0, 255],
];

const positions = [
    [200, 200],
    [220, 100],
];

for (let i = 0; i < 2; i++) {
    const k = kaplay({
        background: backgrounds[i],
        global: false,
        width: 320,
        height: 320,
    });

    k.loadBean();

    // custom spin component
    function spin() {
        return {
            id: "spin",
            update() {
                this.scale = Math.sin(k.time() + i) * 9;
                this.angle = k.time() * 60;
            },
        };
    }

    k.add([
        k.circle(40),
        k.anchor("center"),
        k.pos(
            positions[i][0],
            positions[i][1],
        ),
    ]);

    k.add([
        k.text(`#${i}`),
    ]);
}
