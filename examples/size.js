/**
 * @file Sizing
 * @description How to make set up your game's size.
 * @difficulty 0
 * @tags basics
 * @minver 3001.0
 */

kaplay({
    // without specifying "width" and "height", kaplay will size to the container (document.body by default)
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
