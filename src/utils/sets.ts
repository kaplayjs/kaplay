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

export const mapAddOrPush = <K, V>(
    map: Map<K, V[]>,
    key: K,
    value: V,
): void => {
    if (map.has(key)) {
        map.get(key)?.push(value);
    }
    else {
        map.set(key, [value]);
    }
};
