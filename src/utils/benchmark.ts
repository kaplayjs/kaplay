export function benchmark(task: () => void, times: number = 1) {
    const t1 = performance.now();
    for (let i = 0; i < times; i++) {
        task();
    }
    const t2 = performance.now();
    return t2 - t1;
}

export function comparePerf(t1: () => void, t2: () => void, times: number = 1) {
    return benchmark(t2, times) / benchmark(t1, times);
}
