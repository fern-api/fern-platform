"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";

import { experimental_useObject } from "ai/react";
import { debounce } from "es-toolkit/function";

import { isNonNullish } from "@fern-api/ui-core-utils";
import { SuggestionsSchema } from "@fern-docs/search-server";

import * as Command from "../cmdk";
import { Skeleton } from "../ui/skeleton";

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
  const [isLoading, setIsLoading] = useState(true);
  const { object, submit } = experimental_useObject({
    api,
    schema: SuggestionsSchema,
    headers,
    onFinish: () => setIsLoading(false),
  });

  const debouncedSubmit = useMemo(
    () => debounce(submit, 500, { edges: ["leading"] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    debouncedSubmit(body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (object?.suggestions == null && !isLoading) {
    return false;
  }

  const suggestions = object?.suggestions?.filter(isNonNullish) ?? [];

  return (
    <Command.Group forceMount heading="Suggestions">
      {suggestions.map((suggestion) => (
        <Command.Item
          key={suggestion}
          value={suggestion}
          onSelect={() => askAI(suggestion)}
          forceMount
        >
          {suggestion}
        </Command.Item>
      ))}
      {isLoading &&
        suggestions.length < 5 &&
        Array.from({ length: 5 - suggestions.length }).map((_, index) => (
          <Command.Item key={`skeleton-${index}`} forceMount disabled>
            <Skeleton className="h-5 w-full" />
          </Command.Item>
        ))}
    </Command.Group>
  );
};
