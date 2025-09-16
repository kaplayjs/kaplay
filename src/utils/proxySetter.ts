/**
 * run the hook when any property in obj[key] is changed
 *
 * @param obj
 * @param key
 * @param onChange - hook
 */
export function proxySetter(obj: any, key: any, onChange: () => void) {
    obj[key] = wrapProxy(obj[key], onChange);
}

export function wrapProxy(obj: any, onChange: () => void): any {
    return new Proxy(obj, {
        set(target, prop, value) {
            if (target[prop] !== value) {
                target[prop] = value;
                onChange();
            }
            return true;
        },
    });
}
