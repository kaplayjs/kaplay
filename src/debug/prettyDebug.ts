export function prettyDebug(
    object: any | undefined,
    inside: boolean = false,
    seen: Set<any> = new Set(),
    escape = true,
    read: (object: object, key: PropertyKey) => unknown = Reflect.get,
    watchPreview = false,
): string {
    if (seen.has(object)) return "<recursive>";
    var outStr = "", tmp;
    if (inside && typeof object === "string") {
        object = JSON.stringify(object);
    }
    if (Array.isArray(object)) {
        outStr = [
            "[",
            Array.from(
                { length: read(object, "length") as number },
                (_, index) =>
                    index in object
                        ? prettyDebug(
                            read(object, index),
                            true,
                            seen.union(new Set([object])),
                            escape,
                            read,
                            watchPreview,
                        )
                        : "",
            )
                .join(", "),
            "]",
        ].join("");
        object = outStr;
    }
    if (object === null) return "null";
    const prototype = watchPreview && typeof object === "object"
        ? Object.getPrototypeOf(object)
        : undefined;
    if (
        typeof object === "object"
        && (watchPreview
                && (prototype === Object.prototype || prototype === null)
            || read(object, "toString") === Object.prototype.toString)
    ) {
        const constructor = read(object, "constructor");
        if (
            constructor !== Object && typeof constructor === "function"
            && constructor.name
        ) {
            outStr += constructor.name + " ";
        }
        outStr += [
            "{",
            (tmp = Object.getOwnPropertyNames(object)
                    .map(p =>
                        `${/^\w+$/.test(p) ? p : JSON.stringify(p)}: ${
                            prettyDebug(
                                read(object, p),
                                true,
                                seen.union(new Set([object])),
                                escape,
                                read,
                                watchPreview,
                            )
                        }`
                    )
                    .join(", "))
                ? ` ${tmp} `
                : "",
            "}",
        ].join("");
        object = outStr;
    }
    const display = watchPreview && object !== null
            && (typeof object === "object" || typeof object === "function")
        ? new Proxy({}, {
            get(_target, key) {
                const value = read(object, key);
                return (
                        key === Symbol.toPrimitive || key === "toString"
                        || key === "valueOf"
                    ) && typeof value === "function"
                    ? value.bind(object)
                    : value;
            },
        })
        : object;
    const rendered = String(display);
    return escape ? rendered.replaceAll(/(?<!\\)\[/g, "\\[") : rendered;
}
