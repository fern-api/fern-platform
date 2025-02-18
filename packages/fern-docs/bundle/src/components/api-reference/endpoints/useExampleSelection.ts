"use client";

import React, { useMemo } from "react";

import { SetStateAction } from "jotai";
import { RESET } from "jotai/utils";
import { useCallbackOne } from "use-memo-one";
import { create } from "zustand";

import { EndpointDefinition } from "@fern-api/fdr-sdk/api-definition";
import { useLazyRef } from "@fern-ui/react-commons";

import { act } from "@/state/act";
import {
  useDefaultProgrammingLanguage,
  useProgrammingLanguage,
  useProgrammingLanguageStore,
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
  const examplesByLanguageKeyAndStatusCode = useMemo(
    () => groupExamplesByLanguageKeyAndStatusCode(endpoint),
    [endpoint]
  );

  const getInitialExampleKey = useCallbackOne(
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
    [examplesByLanguageKeyAndStatusCode, initialExampleId]
  );

  const [lang, setLang] = useProgrammingLanguage();

  const useSelectedExampleKeyStore = useLazyRef(() =>
    create<{
      selectedExampleKey: SelectedExampleKey;
      setSelectedExampleKey: (
        key: React.SetStateAction<SelectedExampleKey> | typeof RESET
      ) => void;
    }>((set) => ({
      selectedExampleKey: getInitialExampleKey(lang),
      setSelectedExampleKey: (key) =>
        set((prev) => {
          if (key === RESET) {
            return { selectedExampleKey: getInitialExampleKey(lang) };
          }
          const next = act(key, prev.selectedExampleKey);
          if (next.language !== prev.selectedExampleKey.language) {
            setLang(next.language);
          }
          return { selectedExampleKey: next };
        }),
    }))
  ).current;

  // We use a string here with the intention that this can be used in a query param to deeplink to a particular example
  const {
    selectedExampleKey: internalSelectedExampleKey,
    setSelectedExampleKey,
  } = useSelectedExampleKeyStore();

  React.useEffect(
    () =>
      useProgrammingLanguageStore.subscribe((state) => {
        const language = state.language;
        if (language == null) {
          return;
        }
        setSelectedExampleKey((prev) => {
          if (prev.language !== language) {
            return { ...prev, language };
          }
          return prev;
        });
      }),
    [setSelectedExampleKey]
  );

  const defaultLanguage = useDefaultProgrammingLanguage();
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
