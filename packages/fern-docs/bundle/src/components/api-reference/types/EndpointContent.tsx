import { CodeExample } from "../examples/code-example";

export type Language = string;
export type StatusCode = string;
export type ExampleKey = string;

export type ExamplesByStatusCode = Record<StatusCode, CodeExample[]>;
export type ExamplesByKeyAndStatusCode = Record<
  ExampleKey,
  ExamplesByStatusCode
>;
export type ExamplesByLanguageKeyAndStatusCode = Record<
  Language,
  ExamplesByKeyAndStatusCode
>;

/**
 * This is a compound key that is used to index into ExamplesByLanguageKeyAndStatusCode.
 */
export type SelectedExampleKey = {
  /**
   * language of the example i.e. "typescript" or "curl"
   */
  language: Language;
  /**
   * join of exampleIndex and snippetIndex
   */
  exampleKey: ExampleKey | undefined;
  /**
   * status code of the example (as a string) i.e. "200"
   */
  statusCode: StatusCode | undefined;
  /**
   * index of the example in the values of ExamplesByStatusCode
   */
  responseIndex: number | undefined;
};
