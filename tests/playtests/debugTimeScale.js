/**
 * @file Time Scale
 * @description Test time scale and dt() difference.
 * @difficulty 3
 * @tags basics
 * @minver 3001.0
 */

kaplay();

let firstFrameDt;

wait(0.5, () => {
    firstFrameDt = dt();
    debug.timeScale = 2;
});

wait(1, () => {
    const newDt = dt();

    if (newDt > firstFrameDt) {
        debug.log(
            `✔ TEST PASSED. 1st dt: ${firstFrameDt}, modified dt: ${newDt}`,
        );
    }
    else {
        debug.log(`TEST FAILED.`);
    }
});
