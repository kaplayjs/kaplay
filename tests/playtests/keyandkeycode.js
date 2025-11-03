kaplay({
    buttons: {
        foo: {
            keyboard: "q",
            keyboardCode: "KeyQ",
        },
    },
});

onButtonPress("foo", () => {
    debug.log("ohhi");
});

onButtonRelease("foo", () => {
    debug.log("ohbye");
});
