import { EMPTY_ARRAY, isNonNullish } from "@fern-api/ui-core-utils";
import { experimental_useObject } from "ai/react";
import { debounce } from "es-toolkit/function";
import { useEffect, useMemo, useRef } from "react";

import { SuggestionsSchema, type Suggestions } from "../server/suggestions-schema";

export function useSuggestions<INPUT = object>({
    body,
    shouldSuggest = true,
    ...opts
}: Omit<Parameters<typeof experimental_useObject<Suggestions, INPUT>>[0], "schema"> & {
    body: INPUT;
    shouldSuggest?: boolean;
}): readonly string[] {
    const { object, submit } = experimental_useObject<Suggestions>({ ...opts, schema: SuggestionsSchema });

    const debouncedSubmit = useMemo(() => debounce(submit, 1000, { edges: ["leading"] }), [submit]);

    const suggested = useRef(false);
    useEffect(() => {
        if (shouldSuggest && !suggested.current) {
            debouncedSubmit(body);
            suggested.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldSuggest]);

    return useMemo(() => object?.suggestions?.filter(isNonNullish) ?? EMPTY_ARRAY, [object?.suggestions]);
}
