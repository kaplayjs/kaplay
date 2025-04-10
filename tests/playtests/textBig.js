/**
 * @file Big Text
 * @description Testing for big big text.
 * @difficulty 3
 * @tags basics
 * @minver 3001.0
 */

kaplay();

add([
    text(
        "text text text text text text text text text text text text text text text\ntext [big]big[/big] text\ntext text text",
        {
            styles: {
                big() {
                    return {
                        scale: vec2(wave(3, 5, time())),
                        stretchInPlace: false,
                    };
                },
            },
            width: width() / 2,
        },
    ),
    pos(100, 100),
    area(),
]);
debug.inspect = true;
