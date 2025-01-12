import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import {
  createContext,
  PropsWithChildren,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import {
  JsonPropertyPath,
  JsonPropertyPathPart,
} from "../examples/JsonPropertyPath";

const AnchorIdContext = createContext<string | undefined>(undefined);
const SlugContext = createContext<string>("");
const JsonPathPartContext = createContext<RefObject<JsonPropertyPath>>({
  current: [],
});
const TypeDefinitionsContext = createContext<
  Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>
>({});
const VisitedTypeIdsContext = createContext<Set<ApiDefinition.TypeId>>(
  new Set()
);

/**
 * A provider that generates a deep-linked anchor id for the current node.
 */
export function AnchorIdProvider({
  children,
  value,
}: PropsWithChildren & { value: string }) {
  const parentId = useContext(AnchorIdContext);
  return (
    <AnchorIdContext.Provider value={parentId ? `${parentId}.${value}` : value}>
      {children}
    </AnchorIdContext.Provider>
  );
}

/**
 * A provider that specifies the current slug.
 */
export const SlugProvider = SlugContext.Provider;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * A provider that builds the current json path part, which is used for pointer-based
 * example navigation.
 */
export function JsonPathPartProvider({
  children,
  value,
}: PropsWithChildren & {
  value: JsonPropertyPathPart | ((parts: JsonPropertyPath) => JsonPropertyPath);
}) {
  const jsonPathParts = useContext(JsonPathPartContext).current ?? [];
  const ref = useRef(
    typeof value === "function"
      ? value(jsonPathParts)
      : [...jsonPathParts, value]
  );
  useIsomorphicLayoutEffect(() => {
    ref.current =
      typeof value === "function"
        ? value(jsonPathParts)
        : [...jsonPathParts, value];
  }, [jsonPathParts, value]);
  return (
    <JsonPathPartContext.Provider value={ref}>
      {children}
    </JsonPathPartContext.Provider>
  );
}

export const TypeDefinitionsProvider = TypeDefinitionsContext.Provider;

export function VisitedTypeIdsProvider({
  children,
  value,
}: PropsWithChildren & { value: Set<ApiDefinition.TypeId> }) {
  const parent = useContext(VisitedTypeIdsContext);
  return (
    <VisitedTypeIdsContext.Provider value={new Set([...parent, ...value])}>
      {children}
    </VisitedTypeIdsContext.Provider>
  );
}

/**
 * A hook that returns the current anchor id.
 */
export function useAnchorId() {
  return useContext(AnchorIdContext);
}

/**
 * A hook that returns the current slug.
 */
export function useSlug() {
  return useContext(SlugContext);
}

/**
 * A hook that returns a function to get the href for the current node.
 * (this is a callback because it cannot be called on the server-side)
 */
export function useGetHref() {
  const anchorId = useAnchorId();
  const slug = useSlug();
  return useCallback(() => {
    return String(
      new URL(
        anchorId ? `${slug}#${anchorId}` : `/${slug}`,
        window.location.origin
      )
    );
  }, [anchorId, slug]);
}

export function useJsonPathPart(): JsonPropertyPath {
  return useContext(JsonPathPartContext).current ?? EMPTY_ARRAY;
}

export function useTypeDefinitions() {
  return useContext(TypeDefinitionsContext);
}

export function useVisitedTypeIds() {
  return useContext(VisitedTypeIdsContext);
}
