// @ts-check

// Start the game in burp mode
kaplay({
    burp: true,
});

// "b" triggers a burp in burp mode
add([
    text("press b"),
]);

// burp() on click / tap for our friends on mobile
onClick(() => burp());
