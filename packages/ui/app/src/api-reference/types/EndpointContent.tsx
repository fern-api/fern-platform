import { CodeExample } from "../examples/code-example";

export type Language = string;
export type ExampleTitle = string;
export type StatusCode = number;
export type ExampleIndex = number;

export type ExamplesByStatusCode = Record<StatusCode, CodeExample[]>;
export type ExamplesByTitleAndStatusCode = Record<ExampleTitle, Record<StatusCode, CodeExample[]>>;
export type ExamplesByClientAndTitleAndStatusCode = Record<
    Language,
    Record<ExampleTitle, Record<StatusCode, CodeExample[]>>
>;
export type SelectedExampleKey = [Language, ExampleTitle | undefined, StatusCode | undefined, ExampleIndex | undefined];
