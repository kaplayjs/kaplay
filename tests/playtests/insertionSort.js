kaplay();

const t = add([
    text(""),
    pos(100, 100),
]);

var passes = 0, fails = 0;

onUpdate(() => {
    const list = new Array(100).fill().map((_, i) => i);
    const correct = list.toString();
    shuffle(list);
    insertionSort(list, (a, b) => b > a);
    const result = list.toString();
    if (correct === result) passes++;
    else fails++;
    t.text = `${passes} passes\n${fails} fails`;
});
