export function deepEq(o1: any, o2: any): boolean {
    if (o1 === o2) {
        return true;
    }
    const t1 = typeof o1;
    const t2 = typeof o2;
    if (t1 !== t2) {
        return false;
    }
    if (t1 === "object" && t2 === "object" && o1 !== null && o2 !== null) {
        if (Array.isArray(o1) !== Array.isArray(o2)) {
            return false;
        }
        const k1 = Object.keys(o1);
        const k2 = Object.keys(o2);
        if (k1.length !== k2.length) {
            return false;
        }
        for (const k of k1) {
            const v1 = o1[k];
            const v2 = o2[k];
            if (!deepEq(v1, v2)) {
                return false;
            }
        }
        return true;
    }
    return false;
}
