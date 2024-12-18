import { DocsV1Read } from "@fern-api/fdr-sdk";
import { isEqual } from "es-toolkit/predicate";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { DOCS_ATOM, EMPTY_ANALYTICS_CONFIG } from "./docs";
import { DocsProps } from "./types";

const ANALYTICS_CONFIG_ATOM = selectAtom<DocsProps, DocsV1Read.AnalyticsConfig>(
    DOCS_ATOM,
    (docs) => docs.analyticsConfig ?? EMPTY_ANALYTICS_CONFIG,
    isEqual,
);

export function useAnalyticsConfig(): DocsV1Read.AnalyticsConfig {
    return useAtomValue(ANALYTICS_CONFIG_ATOM);
}
