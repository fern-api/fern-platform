import { keys } from "./objects/keys.js";

export type ObjectPropertiesVisitor<T, R> = {
    [K in keyof T]-?: (value: T[K]) => R;
};

export async function visitObject<T extends Record<string, unknown>>(
    object: T,
    visitor: ObjectPropertiesVisitor<T, void | Promise<void>>,
): Promise<void> {
    for (const key of keys(visitor)) {
        await visitor[key](object[key]);
    }
}
