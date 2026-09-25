type Func<R = any> = (...args: any[]) => R;

export function overload2<A extends Func, B extends Func>(
    fn1: A,
    fn2: B,
): A & B {
    return ((...args) => {
        const al = args.length;
        if (al === fn1.length) return fn1(...args);
        if (al === fn2.length) return fn2(...args);
    }) as A & B;
}

export function overload2if<A extends Func, B extends Func>(
    fn1: A,
    fn2: B,
    isFn1: Func<boolean>,
): A & B {
    return ((...args) => {
        return isFn1(...args) ? fn1(...args) : fn2(...args);
    }) as A & B;
}

export function overload3<
    A extends Func,
    B extends Func,
    C extends Func,
>(fn1: A, fn2: B, fn3: C): A & B & C {
    return ((...args) => {
        const al = args.length;
        if (al === fn1.length) return fn1(...args);
        if (al === fn2.length) return fn2(...args);
        if (al === fn3.length) return fn3(...args);
    }) as A & B & C;
}

export function overload4<
    A extends Func,
    B extends Func,
    C extends Func,
    D extends Func,
>(fn1: A, fn2: B, fn3: C, fn4: D): A & B & C & D {
    return ((...args) => {
        const al = args.length;
        if (al === fn1.length) return fn1(...args);
        if (al === fn2.length) return fn2(...args);
        if (al === fn3.length) return fn3(...args);
        if (al === fn4.length) return fn4(...args);
    }) as A & B & C & D;
}
