const warned = new Set();

export const getErrorMessage = (error: unknown) =>
    (error instanceof Error) ? error.message : String(error);

export function deprecate(
    oldName: string,
    newName: string,
    newFunc: (...args: unknown[]) => any,
) {
    return (...args: unknown[]) => {
        deprecateMsg(oldName, newName);
        return newFunc(...args);
    };
}

export function warn(msg: string) {
    if (!warned.has(msg)) {
        warned.add(msg);
        console.warn(msg);
    }
}

export function deprecateMsg(oldName: string, newName: string) {
    warn(`${oldName} is deprecated. Use ${newName} instead.`);
}
