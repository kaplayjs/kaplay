export function proxySetter(obj: any, key: any, onChange: () => void) {
    obj[key] = new Proxy(obj[key], {
        set(target, prop, value) {
            if (target[prop] !== value) {
                target[prop] = value;
                onChange();
            }
            return true;
        }
    });
}
