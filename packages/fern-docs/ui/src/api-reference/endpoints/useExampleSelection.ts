import { EndpointDefinition } from "@fern-api/fdr-sdk/api-definition";
import { SetStateAction, atom, useAtom, useAtomValue } from "jotai";
import { RESET, atomWithDefault } from "jotai/utils";
import { useMemo } from "react";
import { useCallbackOne, useMemoOne } from "use-memo-one";
import {
  DEFAULT_LANGUAGE_ATOM,
  FERN_LANGUAGE_ATOM,
  useAtomEffect,
} from "../../atoms";
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
} from "../types/EndpointContent";

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
        examplesByLanguageKeyAndStatusCode[language] ?? {}
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

  // We use a string here with the intention that this can be used in a query param to deeplink to a particular example
  const [internalSelectedExampleKey, setSelectedExampleKey] = useAtom(
    useMemoOne(() => {
      const internalAtom = atomWithDefault<SelectedExampleKey>((get) => {
        return getInitialExampleKey(
          get(FERN_LANGUAGE_ATOM) ?? get(DEFAULT_LANGUAGE_ATOM)
        );
      });

      return atom(
        (get) => get(internalAtom),
        (
          get,
          set,
          update: SetStateAction<SelectedExampleKey> | typeof RESET
        ) => {
          const prev = get(internalAtom);
          const next = typeof update === "function" ? update(prev) : update;
          if (next !== RESET) {
            set(FERN_LANGUAGE_ATOM, next.language);
          }
          set(internalAtom, next);
        }
      );
    }, [getInitialExampleKey])
  );

  // when the language changes, we'd want to update the selected example key to the new language
  useAtomEffect(
    useCallbackOne(
      (get) => {
        setSelectedExampleKey((prev) => {
          const language =
            get(FERN_LANGUAGE_ATOM) ?? get(DEFAULT_LANGUAGE_ATOM);
          if (prev.language !== language) {
            return { ...prev, language };
          }
          return prev;
        });
      },
      [setSelectedExampleKey]
    )
  );

  const defaultLanguage = useAtomValue(DEFAULT_LANGUAGE_ATOM);

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
