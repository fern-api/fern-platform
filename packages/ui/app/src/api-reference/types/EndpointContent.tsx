import { CodeExample } from "../examples/code-example";

export type Language = string;
export type ExampleId = string;
export type StatusCode = number;
export type ExampleIndex = number;

export type ExamplesByStatusCode = Record<StatusCode, CodeExample[]>;
export type ExamplesByTitleAndStatusCode = Record<ExampleId, Record<StatusCode, CodeExample[]>>;
export type ExamplesByClientAndTitleAndStatusCode = Record<
    Language,
    Record<ExampleId, Record<StatusCode, CodeExample[]>>
>;
export type SelectedExampleKey = [Language, ExampleId | undefined, StatusCode | undefined, ExampleIndex | undefined];
