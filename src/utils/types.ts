/**
 * Convert a union type to an intersection type.
 */
export type UnionToIntersection<U> = (
    U extends any ? (k: U) => void : never
) extends (k: infer I) => void ? I
    : never;

/**
 * It removes the properties that are undefined.
 */
export type Defined<T> = T extends any
    ? Pick<T, { [K in keyof T]-?: T[K] extends undefined ? never : K }[keyof T]>
    : never;

/**
 * It obligates to TypeScript to Expand the type.
 *
 * Instead of being `{ id: 1 } | { name: "hi" }`
 * makes
 * It's `{ id: 1, name: "hi" }`
 *
 * https://www.totaltypescript.com/concepts/the-prettify-helper
 */
export type Expand<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

/**
 * It merges all the objects into one.
 */
export type MergeObj<T> = Expand<UnionToIntersection<Defined<T>>>;
