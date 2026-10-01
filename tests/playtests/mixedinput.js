kaplay({
    buttons: {
        "select": {
            // now you can do shift (a keyboard key) + left (a mouse button) and it will work
            mouse: "shift+left",
        },
    },
});

onUpdate(() => {
    debug.log(isButtonDown("select"));
});
