// Test when a dependency is missing on obj.use()

const k = kaplay({});

k.onError((e) => {
    if (e == 'Error: Component "body" requires component "pos"') {
        console.log("TEST PASSED");
    }
});

const dummy = k.add([]);

dummy.use(body());

