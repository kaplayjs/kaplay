kaplay();

const txtEl = add([
    text("", {
        styles: {
            pink: {
                color: MAGENTA,
            },
        },
    }),
    pos(100, 100),
]);
const base = "[pink]hello\n[/pink]ohhi\n";
const txt = "foo\n\\[1]\nbar";
var i = -1;
const c = loop(0.5, () => {
    if (txt[i] === "\\") i++;
    i++;
    txtEl.text = base + txt.slice(0, i) + "[pink]bye[/pink]";
    if (i > txt.length) {
        console.log(txtEl.text);
        c.cancel();
    }
});
