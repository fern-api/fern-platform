import { EMPTY_ARRAY, isNonNullish } from "@fern-api/ui-core-utils";
import { ReactNode, memo } from "react";
import * as Command from "../cmdk";

const Suggestions = memo(
    ({
        suggestions = EMPTY_ARRAY,
        onSubmitMessage,
    }: {
        suggestions?: readonly (string | undefined)[];
        onSubmitMessage?: (message: string) => void;
    }): ReactNode => {
        if (suggestions?.length === 0) {
            return false;
        }

        return (
            <Command.Group forceMount heading="Suggestions">
                {suggestions.filter(isNonNullish).map((suggestion) => (
                    <Command.Item
                        key={suggestion}
                        value={suggestion}
                        onSelect={() => onSubmitMessage?.(suggestion)}
                        forceMount
                    >
                        {suggestion}
                    </Command.Item>
                ))}
            </Command.Group>
        );
    },
);

Suggestions.displayName = "Suggestions";

export { Suggestions };
