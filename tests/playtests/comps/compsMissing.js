/**
 * @file Missing comps
 * @description Test behaviour when missing components at add().
 * @difficulty 3
 * @tags comps
 * @minver 3001.0
 */

// Test when a dependency is missing on obj creation

const k = kaplay({});

k.onError((e) => {
    if (e == "Error: Component \"body\" requires component \"pos\"") {
        console.log("TEST PASSED");
    }
});

k.add([
    k.body(),
]);
