/**
 * @file Text Wrap
 * @description Test text wrap.
 * @difficulty 3
 * @tags basics
 * @minver 3001.0
 */

kaplay({ background: "#000000" });

const theText = `MAN PAGE
    Very long description paragraph. Very long description paragraph. Very long description paragraph. Very long description paragraph. Very long description paragraph. Very long description paragraph. Very long description paragraph.

ANOTHER SECTION
    Yet some more text here. Yet some more text here. Yet some more text here. Yet some more text here.`;

add([
    pos(100, 100),
    text(theText, {
        size: 16,
        width: 17 * 16,
    }),
]);

add([
    pos(400, 100),
    text(theText, {
        size: 16,
        width: 17 * 16,
        indentAll: true,
    }),
]);
