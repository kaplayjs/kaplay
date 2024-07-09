export const isEqOrIncludes = <T>(listOrSmt: T | T[], el: unknown): boolean => {
    if (Array.isArray(listOrSmt)) {
        return (listOrSmt as any[])?.includes(el);
    }

    return listOrSmt === el;
};

export const setHasOrIncludes = <K>(
    set: Set<K>,
    key: K | K[],
): boolean => {
    if (Array.isArray(key)) {
        return key.some((k) => set.has(k));
    }

    return set.has(key);
};
