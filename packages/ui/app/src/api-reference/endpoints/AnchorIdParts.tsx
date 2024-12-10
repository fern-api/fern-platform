import { FernNavigation } from "@fern-api/fdr-sdk";
import { useDeepCompareMemoize } from "@fern-ui/react-commons";
import { PropsWithChildren, ReactElement, createContext, useContext } from "react";
import { getAnchorId } from "../../util/anchor";

const SlugContext = createContext<FernNavigation.Slug>(FernNavigation.Slug(""));
const AnchorIdPartsContext = createContext<string[]>([]);

export function SlugProvider({ slug, children }: PropsWithChildren<{ slug: FernNavigation.Slug }>): ReactElement {
    return <SlugContext.Provider value={slug}>{children}</SlugContext.Provider>;
}

export function AnchorProvider({
    children,
    parts,
}: PropsWithChildren<{ parts: string | readonly string[] }>): ReactElement {
    const parentParts = useContext(AnchorIdPartsContext);
    const childParts = Array.isArray(parts) ? parts : [parts];
    return (
        <AnchorIdPartsContext.Provider value={useDeepCompareMemoize([...parentParts, ...childParts])}>
            {children}
        </AnchorIdPartsContext.Provider>
    );
}

export function useSlug(): FernNavigation.Slug {
    return useContext(SlugContext);
}

export function useAnchorId(): string {
    const parts = useContext(AnchorIdPartsContext);
    return getAnchorId(parts);
}
