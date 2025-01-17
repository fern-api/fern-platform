import { FernRegistry } from "../../client/generated";

export function mergeSnippets(
  leftSnippets:
    | Record<string, FernRegistry.api.latest.CodeSnippet[]>
    | undefined,
  rightSnippets:
    | Record<string, FernRegistry.api.latest.CodeSnippet[]>
    | undefined
): Record<string, FernRegistry.api.latest.CodeSnippet[]> | undefined {
  const mergedSnippets: Record<string, FernRegistry.api.latest.CodeSnippet[]> =
    { ...leftSnippets };
  for (const [key, value] of Object.entries(rightSnippets ?? {})) {
    mergedSnippets[key] = [...(mergedSnippets[key] ?? []), ...value];
  }
  return Object.keys(mergedSnippets).length > 0 ? mergedSnippets : undefined;
}
