import {
    ApiReferenceRecord,
    ChangelogRecord,
    ParameterRecord,
} from "@fern-ui/fern-docs-search-server/src/algolia/types";
import { Hit } from "algoliasearch/lite";
import { ReactElement } from "react";
import { Snippet } from "react-instantsearch";
import { MarkRequired, UnreachableCaseError } from "ts-essentials";
import { AlgoliaRecordHit, MarkdownRecordHit } from "../types";

const headingLevels = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

function HierarchyBreadcrumb({
    pageTitle,
    hierarchy,
    level,
}: {
    pageTitle: string | undefined;
    hierarchy: Partial<Record<"h1" | "h2" | "h3" | "h4" | "h5" | "h6", { title?: string; id?: string }>> | undefined;
    level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | undefined;
}) {
    if (!level) {
        return null;
    }
    const breadcrumb: string[] = [];

    if (pageTitle) {
        breadcrumb.push(pageTitle);
    }

    headingLevels.slice(0, headingLevels.indexOf(level)).forEach((level) => {
        const { title } = hierarchy[level] ?? {};
        if (title) {
            breadcrumb.push(title);
        }
    });

    return (
        <div className="text-xs text-[#969696]">
            {breadcrumb.map((title, idx) => (
                <>
                    <span key={title}>{title}</span>
                    {idx < breadcrumb.length - 1 && <span>{" / "}</span>}
                </>
            ))}
        </div>
    );
}

function MarkdownHitContent({ hit }: { hit: MarkdownRecordHit }): ReactElement {
    return (
        <div>
            <div>
                <span>{hit.level_title ?? hit.page_title}</span>
            </div>
            <HierarchyBreadcrumb pageTitle={hit.page_title} hierarchy={hit.hierarchy} level={hit.level} />
            <Snippet
                attribute="content"
                hit={hit}
                className="text-sm leading-snug block"
                classNames={{
                    highlighted: "font-bold bg-transparent",
                }}
            />
        </div>
    );
}

function ChangelogHitContent({ hit }: { hit: MarkRequired<ChangelogRecord, "type"> }): ReactElement {
    return <div>{hit.page_title ?? hit.objectID}</div>;
}

function ApiReferenceHitContent({ hit }: { hit: MarkRequired<ApiReferenceRecord, "type"> }): ReactElement {
    return <div>{hit.page_title ?? hit.objectID}</div>;
}

function ParameterHitContent({ hit }: { hit: MarkRequired<ParameterRecord, "type"> }): ReactElement {
    return <div>{hit.parameter_name}</div>;
}

export function HitContent({ hit }: { hit: MarkRequired<AlgoliaRecordHit, "type"> }): ReactElement {
    switch (hit.type) {
        case "markdown":
            return <MarkdownHitContent hit={hit as MarkdownRecordHit} />;
        case "changelog":
            return <ChangelogHitContent hit={hit as MarkRequired<Hit<ChangelogRecord>, "type">} />;
        case "api-reference":
            return <ApiReferenceHitContent hit={hit as MarkRequired<Hit<ApiReferenceRecord>, "type">} />;
        case "parameter":
            return <ParameterHitContent hit={hit as MarkRequired<Hit<ParameterRecord>, "type">} />;
        default:
            throw new UnreachableCaseError(hit.type);
    }
}
