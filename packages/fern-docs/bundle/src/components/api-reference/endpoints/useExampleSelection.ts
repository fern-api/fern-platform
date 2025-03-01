"use client";

import React, { useMemo } from "react";

import { SetStateAction } from "jotai";
import { RESET } from "jotai/utils";

import { EndpointDefinition } from "@fern-api/fdr-sdk/api-definition";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";

import {
  getProgrammingLanguage,
  useDefaultProgrammingLanguage,
  useProgrammingLanguage,
} from "@/state/language";

import { CodeExample } from "../examples/code-example";
import {
  getAvailableLanguages,
  groupExamplesByLanguageKeyAndStatusCode,
  selectExampleToRender,
} from "../examples/example-groups";
import {
  ExamplesByKeyAndStatusCode,
  ExamplesByStatusCode,
  SelectedExampleKey,
} from "../type-definitions/EndpointContent";

export function useExampleSelection(
  endpoint: EndpointDefinition,
  initialExampleId?: string
): {
  selectedExample: CodeExample | undefined;
  examplesByStatusCode: ExamplesByStatusCode;
  examplesByKeyAndStatusCode: ExamplesByKeyAndStatusCode;
  selectedExampleKey: SelectedExampleKey;
  defaultLanguage: string;
  availableLanguages: string[];
  setSelectedExampleKey: (
    update: typeof RESET | SetStateAction<SelectedExampleKey>
  ) => void;
} {
  const examplesByLanguageKeyAndStatusCode = React.useMemo(
    () => groupExamplesByLanguageKeyAndStatusCode(endpoint),
    [endpoint]
  );

  const getInitialExampleKey = React.useCallback(
    (language: string): SelectedExampleKey => {
      if (initialExampleId == null) {
        return {
          language,
          exampleKey: undefined,
          statusCode: undefined,
          responseIndex: undefined,
        };
      }
      const allExamples = Object.values(
        examplesByLanguageKeyAndStatusCode[language] ??
          examplesByLanguageKeyAndStatusCode.curl ??
          {}
      )
        .flatMap((e) => Object.values(e))
        .flat();

      const example = allExamples.find(
        (e) =>
          e.name === initialExampleId || e.exampleCall.name === initialExampleId
      );
      if (example == null) {
        return {
          language,
          exampleKey: undefined,
          statusCode: undefined,
          responseIndex: undefined,
        };
      }

      return {
        language,
        exampleKey: example.exampleKey,
        statusCode: String(example.exampleCall.responseStatusCode),
        responseIndex: undefined,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useDeepCompareMemoize([
      examplesByLanguageKeyAndStatusCode,
      initialExampleId,
    ])
  );

  // We use a string here with the intention that this can be used in a query param to deeplink to a particular example
  // const [internalSelectedExampleKey, setSelectedExampleKey] = useR(
  //   useMemoOne(() => {
  //     const internalAtom = atomWithDefault<SelectedExampleKey>((get) => {
  //       return getInitialExampleKey(
  //         get(FERN_LANGUAGE_ATOM) ?? get(DEFAULT_LANGUAGE_ATOM)
  //       );
  //     });

  //     return atom(
  //       (get) => get(internalAtom),
  //       (
  //         get,
  //         set,
  //         update: SetStateAction<SelectedExampleKey> | typeof RESET
  //       ) => {
  //         const prev = get(internalAtom);
  //         const next = typeof update === "function" ? update(prev) : update;
  //         if (next !== RESET) {
  //           set(FERN_LANGUAGE_ATOM, next.language);
  //         }
  //         set(internalAtom, next);
  //       }
  //     );
  //   }, [getInitialExampleKey])
  // );

  const [globalLanguage, setGlobalLanguage] = useProgrammingLanguage();
  const defaultLanguage = useDefaultProgrammingLanguage();
  const [internalSelectedExampleKey, setSelectedExampleKeyInner] =
    React.useState<SelectedExampleKey>(() => {
      return getInitialExampleKey(globalLanguage ?? defaultLanguage);
    });

  const setSelectedExampleKey = React.useCallback(
    (update: typeof RESET | SetStateAction<SelectedExampleKey>) => {
      setSelectedExampleKeyInner((prev) => {
        const next = typeof update === "function" ? update(prev) : update;
        if (next !== RESET) {
          setGlobalLanguage(next.language);
        } else {
          return getInitialExampleKey(getProgrammingLanguage());
        }
        return next;
      });
    },
    [getInitialExampleKey, setGlobalLanguage]
  );

  React.useEffect(() => {
    if (globalLanguage != null) {
      setSelectedExampleKey((prev) => ({ ...prev, language: globalLanguage }));
    }
  }, [globalLanguage, setSelectedExampleKey]);

  const availableLanguages = useMemo(
    () =>
      getAvailableLanguages(
        examplesByLanguageKeyAndStatusCode,
        defaultLanguage
      ),
    [examplesByLanguageKeyAndStatusCode, defaultLanguage]
  );

  const {
    selectedExample,
    examplesByStatusCode,
    examplesByKeyAndStatusCode,
    selectedExampleKey,
  } = useMemo(
    () =>
      selectExampleToRender(
        examplesByLanguageKeyAndStatusCode,
        internalSelectedExampleKey,
        defaultLanguage
      ),
    [
      defaultLanguage,
      examplesByLanguageKeyAndStatusCode,
      internalSelectedExampleKey,
    ]
  );

  return {
    selectedExample,
    examplesByStatusCode,
    examplesByKeyAndStatusCode,
    selectedExampleKey,
    defaultLanguage,
    availableLanguages,
    setSelectedExampleKey,
  };
}
