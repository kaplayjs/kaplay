// Related to load and save data

export function getData<T>(key: string, def?: T): T | null {
    try {
        return JSON.parse(window.localStorage[key]);
    } catch {
        if (def) {
            setData(key, def);
            return def;
        }
        else {
            return null;
        }
    }
}

export function setData(key: string, data: any) {
    window.localStorage[key] = JSON.stringify(data);
}
