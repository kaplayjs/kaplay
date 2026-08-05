kaplay();

const x = add([]);
const y = x.add([]);
const z = y.add([]);
x.destroy();
console.assert(!exists(y) && !exists(z));
