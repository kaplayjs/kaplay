// @ts-check

kaplay();

loadBean();

const interval = 0.001;
const delay = 1;

loop(
    interval,
    () => {
        const bean = add([
            sprite("bean"),
            pos(rand(vec2(0), vec2(width(), height()))),
        ]);
        wait(delay, () => {
            destroy(bean);
        });
    },
    -1,
    true,
);

const counter = add([
    pos(10, 10),
    text(""),
    z(9999),
]);
add([
    pos(counter.pos),
    rect(counter.width, counter.height),
    color(BLACK),
    z(counter.z - 1),
    {
        update() {
            this.width = counter.width;
            this.height = counter.height;
        },
    },
]);

var beanCount = 0;
onAdd(() => beanCount++);
onDestroy(() => beanCount--);
loop(0.1, () => {
    const error = 100 * Math.abs((delay / interval) - beanCount)
        / (delay / interval);
    counter.text = `${beanCount.toFixed().padStart(5)} beans\nerror: ${
        error.toFixed(2).padStart(5)
    }%`;
});
