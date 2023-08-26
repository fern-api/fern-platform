export type Values<T> = T[keyof T];

export function values<T extends Record<string, unknown>>(object: T): Values<T>[] {
    return Object.values(object) as Values<T>[];
}
