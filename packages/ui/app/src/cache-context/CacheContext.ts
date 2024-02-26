import type { FullSlug } from "@fern-api/fdr-sdk";
import React from "react";
import { SerializedMdxContent } from "../util/mdx";

export const CacheContext = React.createContext<() => CacheContextValue>(() => {
    throw new Error("CacheContextValueProvider is not present in this tree.");
});

export interface CacheContextValue {
    storeSerializedMdxContent: (fullSlug: FullSlug, serializedMdxContent: SerializedMdxContent) => void;
    getSerializedMdxContent: (fullSlug: FullSlug) => SerializedMdxContent | undefined;
}
