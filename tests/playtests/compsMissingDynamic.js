/**
 * @file Missing components on run-time
 * @description Test missing component dependencies at run-time.
 * @difficulty 3
 * @tags comps
 * @minver 3001.0
 */

// Test when a dependency is missing on obj.use()

const k = kaplay({});

k.onError((e) => {
    if (e == "Error: Component \"body\" requires component \"pos\"") {
        console.log("TEST PASSED");
    }
});

const dummy = k.add([]);

dummy.use(body());
