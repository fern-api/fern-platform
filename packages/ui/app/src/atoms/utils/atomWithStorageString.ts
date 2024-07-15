import { identity } from "lodash-es";
import { z } from "zod";
import { atomWithStorageValidation } from "./atomWithStorageValidation";

export function atomWithStorageString<VALUE extends string>(
    key: string,
    value: VALUE,
    {
        validate,
    }: {
        validate?: z.ZodType<VALUE>;
    } = {},
    { getOnInit }: { getOnInit?: boolean } = {},
): ReturnType<typeof atomWithStorageValidation<VALUE>> {
    return atomWithStorageValidation<VALUE>(
        key,
        value,
        { validate, serialize: identity, parse: identity },
        { getOnInit },
    );
}
