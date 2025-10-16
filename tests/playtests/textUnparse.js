/**
 * @file Text unparse
 * @description How to slice formatted text without breaking styles
 * @difficulty 3
 * @tags text
 * @minver 3001.0
 */

kaplay({ font: "happy", background: "black" });

const str =
    "hello [foo]styled[/foo] world \\[weird tag] with \\] [barbaz]some more [nested]text[/nested][/barbaz] bloop";
// const str = "hello [a][b]a[/b][/a] goodbye";
const formatted = compileStyledText(str);
console.log(formatted);

function tagDiff(l1, l2) {
    var min = 0;
    var out = "";
    while (l1[min] === l2[min] && min < l1.length && min < l2.length) {
        min++;
    }
    for (var i = l1.length - 1; i >= min; i--) {
        out += `[/${l1[i]}]`;
    }
    for (var j = min; j < l2.length; j++) {
        out += `[${l2[j]}]`;
    }
    return out;
}

function sliceUnparse(formatted, start, end) {
    if (!end) end = formatted.text.length;
    var out = "";
    var lastTags = [];
    for (var i = start; i < end; i++) {
        const curTags = formatted.charStyleMap[i] ?? [];
        out += tagDiff(lastTags, curTags);
        out += formatted.text[i].replace(/([\[\\])/g, "\\$1");
        lastTags = curTags;
    }
    out += tagDiff(lastTags, []);
    return out;
}

const theTextObj = add([
    pos(100, 200),
    text("", {
        size: 20,
        styles: {
            foo: {
                color: RED,
            },
            barbaz: {
                scale: 2,
                pos: vec2(0, -16),
            },
            nested: {
                skew: 30,
            },
        },
    }),
]);

loadBean();
loadHappy();
loadSprite("beant", "/crew/beant.png");

var draggin = null;
const startSlider = add([
    sprite("bean"),
    pos(100, 100),
    area(),
    anchor("center"),
    {
        add() {
            this.onMousePress(() => this.isHovering() && (draggin = this));
        },
    },
]);
const endSlider = add([
    sprite("beant"),
    pos(width() - 100, 100),
    area(),
    anchor("center"),
    {
        add() {
            this.onMousePress(() => this.isHovering() && (draggin = this));
        },
    },
]);
onMouseRelease(() => draggin = null);
onMouseMove(pos => {
    if (draggin) draggin.pos.x = pos.x;
});
onUpdate(() => {
    startSlider.pos.x = clamp(startSlider.pos.x, 100, endSlider.pos.x);
    endSlider.pos.x = clamp(endSlider.pos.x, startSlider.pos.x, width() - 100);
    const startIndex =
        map(startSlider.pos.x, 100, width() - 100, 0, formatted.text.length)
        | 0;
    const endIndex =
        map(endSlider.pos.x, 100, width() - 100, 0, formatted.text.length) | 0;
    theTextObj.text = sliceUnparse(formatted, startIndex, endIndex);
    theTextObj.pos.x = 100 + startIndex * 15.5;
});
