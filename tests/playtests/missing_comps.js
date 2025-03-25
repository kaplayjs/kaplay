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
