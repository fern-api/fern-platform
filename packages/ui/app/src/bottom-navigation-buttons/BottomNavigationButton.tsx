import { type DocsNode } from "@fern-api/fdr-sdk";
import { getFullSlugForNavigatable } from "@fern-ui/app-utils";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { useMemo } from "react";
import { FernLinkCard } from "../components/FernCard";
import { useDocsContext } from "../docs-context/useDocsContext";

export declare namespace BottomNavigationButton {
    export interface Props {
        docsNode: DocsNode;
    }
}

export const BottomNavigationButton: React.FC<BottomNavigationButton.Props> = ({ docsNode }) => {
    const { pathResolver, basePath } = useDocsContext();

    const navigatable = useMemo(() => pathResolver.resolveNavigatable(docsNode), [pathResolver, docsNode]);

    const text = useMemo(() => {
        switch (docsNode.type) {
            case "docs-section":
            case "api-section":
            case "api-subpackage":
                return docsNode.section.title;
            case "page":
                return docsNode.page.title;
            case "top-level-endpoint":
            case "endpoint":
                return docsNode.endpoint.name;
            case "top-level-webhook":
            case "webhook":
                return docsNode.webhook.name;
            default:
                return undefined;
        }
    }, [docsNode]);

    if (navigatable == null || text == null) {
        return null;
    }

    const fullSlug = getFullSlugForNavigatable(navigatable, { omitDefault: true, basePath });

    return (
        <FernLinkCard className="my-12 flex items-center rounded-xl p-6" href={`/${fullSlug}`}>
            <div className="flex-1">
                <span className="text-base font-semibold">{text}</span>
            </div>
            <span className="sm:border-default t-muted sm-4 inline-flex items-center gap-2 py-2.5 text-sm sm:ml-6 sm:border-l sm:pl-6">
                <span className="hidden leading-none sm:inline">Up Next</span>
                <ChevronRightIcon />
            </span>
        </FernLinkCard>
    );
};
