/**
 * @file Fixed Update
 * @description TBD
 * @difficulty 1
 * @tags ui, input
 * @minver 4000.0
 * @locked
 */
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
