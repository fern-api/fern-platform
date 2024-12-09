import { isNonNullish } from "@fern-api/ui-core-utils";
import { experimental_useObject } from "ai/react";
import { Command } from "cmdk";
import { debounce } from "es-toolkit/function";
import { ReactNode, useEffect, useMemo } from "react";
import { SuggestionsSchema } from "../../server/suggestions-schema";

export const Suggestions = ({
    headers,
    askAI,
}: {
    headers?: Record<string, string>;
    askAI: (suggestion: string) => void;
}): ReactNode => {
    const { object, submit } = experimental_useObject({
        api: "/api/suggest",
        schema: SuggestionsSchema,
        headers,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSubmit = useMemo(() => debounce(submit, 500), []);

    useEffect(() => {
        debouncedSubmit("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (object?.suggestions == null) {
        return false;
    }

    return (
        <Command.Group forceMount heading="Suggestions">
            {object?.suggestions?.filter(isNonNullish).map((suggestion) => (
                <Command.Item key={suggestion} value={suggestion} onSelect={() => askAI(suggestion)} forceMount>
                    {suggestion}
                </Command.Item>
            ))}
        </Command.Group>
    );
};
