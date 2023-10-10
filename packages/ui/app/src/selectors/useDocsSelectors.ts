import { type DefinitionInfo, DocsNode } from "@fern-ui/app-utils";
import { useMemo } from "react";
import { useNavigationContext } from "../navigation-context/useNavigationContext";

interface DocsSelectors {
    definitionInfo: DefinitionInfo;
    activeVersionContext: ActiveVersionContext;
    selectedSlug: string;
}

interface ActiveVersionContextUnversioned {
    type: "unversioned";
}

interface ActiveVersionContextVersioned {
    type: "versioned";
    version: DocsNode.Version;
}

export type ActiveVersionContext = ActiveVersionContextUnversioned | ActiveVersionContextVersioned;

export function useDocsSelectors(): DocsSelectors {
    const { activeNavigatable } = useNavigationContext();

    const definitionInfo = useMemo(() => activeNavigatable.context.root.info, [activeNavigatable]);

    const activeVersionContext = useMemo<ActiveVersionContext>(() => {
        if (
            activeNavigatable.context.type === "versioned-tabbed" ||
            activeNavigatable.context.type === "versioned-untabbed"
        ) {
            return { type: "versioned", version: activeNavigatable.context.version };
        } else {
            return { type: "unversioned" };
        }
    }, [activeNavigatable]);

    const selectedSlug = useMemo(() => activeNavigatable.leadingSlug, [activeNavigatable]);

    return {
        definitionInfo,
        activeVersionContext,
        selectedSlug,
    };
}
