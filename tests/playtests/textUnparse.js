/**
 * @file Text unparse
 * @description Ok dragoncoder explain this
 * @difficulty 3
 * @tags text
 * @minver 3001.0
 */

kaplay();

const text =
    "hello [foo]styled[/foo] world \\[weird tag] with \\] [barbaz]some more [nested]text[/nested][/barbaz] bloop";
// const text = "hello [a][b]a[/b][/a] goodbye";
const formatted = compileStyledText(text);
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

for (var start = 0; start < formatted.text.length; start++) {
    for (var end = start + 1; end <= formatted.text.length; end++) {
        const t = sliceUnparse(formatted, start, end);
        console.log(t);
    }
}
