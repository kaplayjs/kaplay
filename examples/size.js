// @ts-check

kaplay({
    // without specifying "width" and "height", kaboom will size to the container (document.body by default)
    width: 200,
    height: 100,
    // "letterbox" makes stretching keeps aspect ratio (leaves black bars on empty spaces), have no effect without "stretch"
    letterbox: true,
});

loadBean();

add([
    sprite("bean"),
]);

onClick(() => addKaboom(mousePos()));
