kaplay({
    buttons: {
        save: { keyboard: "control+s" },
        mixed: { keyboard: "shift", mouse: "left" },
    },
});

onButtonPress("save", () => {
    debug.log("SAVE");
});

onButtonPress("");
