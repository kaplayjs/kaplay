/**
 * @file Keep Aspect Ratio
 * @description How to keep aspect ratio using letterbox
 * @difficulty 0
 * @tags basics
 * @minver 3001.0
 * @category basics
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

onMousePress(() => addKaboom(mousePos()));
