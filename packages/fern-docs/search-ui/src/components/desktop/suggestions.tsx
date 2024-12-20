import { isNonNullish } from "@fern-api/ui-core-utils";
import { SuggestionsSchema } from "@fern-docs/search-server";
import { experimental_useObject } from "ai/react";
import { debounce } from "es-toolkit/function";
import { ReactNode, useEffect, useMemo } from "react";
import * as Command from "../cmdk";

export const Suggestions = ({
  api,
  body,
  headers,
  askAI,
}: {
  api: string;
  body?: object;
  headers?: Record<string, string>;
  askAI: (suggestion: string) => void;
}): ReactNode => {
  const { object, submit } = experimental_useObject({
    api,
    schema: SuggestionsSchema,
    headers,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSubmit = useMemo(() => debounce(submit, 500), []);

  useEffect(() => {
    debouncedSubmit(body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (object?.suggestions == null) {
    return false;
  }

  return (
    <Command.Group forceMount heading="Suggestions">
      {object?.suggestions?.filter(isNonNullish).map((suggestion) => (
        <Command.Item
          key={suggestion}
          value={suggestion}
          onSelect={() => askAI(suggestion)}
          forceMount
        >
          {suggestion}
        </Command.Item>
      ))}
    </Command.Group>
  );
};
