export const uid = (() => {
    let id = 0;
    return () => id++;
})();
