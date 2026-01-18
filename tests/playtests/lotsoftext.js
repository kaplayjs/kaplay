kaplay();

const bigString = String.fromCodePoint(
    ...new Array(1024).fill(0).map((_, i) => i),
);

const start = performance.now();
formatText({ text: bigString });
const end = performance.now();

add([
    text(`took ${end - start} ms\nto generate all the characters`),
]);
