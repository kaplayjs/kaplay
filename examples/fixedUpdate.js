// @ts-check

kaplay();

let fixedCount = 0;
let count = 0;

onFixedUpdate(() => {
    fixedCount++;
});

onUpdate(() => {
    count++;
    debug.log(
        `${fixedDt()} ${Math.floor(fixedCount / time())} ${dt()} ${
            Math.floor(count / time())
        }`,
    );
});
