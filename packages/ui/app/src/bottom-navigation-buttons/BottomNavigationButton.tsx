import { type DocsNode } from "@fern-api/fdr-sdk";
import { getFullSlugForNavigatable } from "@fern-ui/app-utils";
import Link from "next/link";
import { useMemo } from "react";
import { RemoteFontAwesomeIcon } from "../commons/FontAwesomeIcon";
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
        <Link
            className="border-border-default-light dark:border-border-default-dark hover:border-border-primary dark:hover:border-accent-primary-dark/50 t-primary hover:t-primary hover:shadow-card-light dark:hover:shadow-card-dark my-12 flex items-center rounded-xl border bg-white p-6 no-underline ring-0 ring-transparent transition-shadow hover:no-underline hover:ring-4 dark:bg-white/5"
            href={`/${fullSlug}`}
        >
            <div className="flex-1">
                <span className="text-base font-semibold">{text}</span>
            </div>
            <span className="border-border-default-light dark:border-border-default-dark t-muted ml-6 inline-flex items-center gap-2 border-l py-2.5 pl-6 text-sm">
                <span className="leading-none">Up Next</span>
                <RemoteFontAwesomeIcon
                    icon="light chevron-right"
                    className="bg-text-muted-light dark:bg-text-muted-dark h-3 w-3"
                />
            </span>
        </Link>
    );
};
