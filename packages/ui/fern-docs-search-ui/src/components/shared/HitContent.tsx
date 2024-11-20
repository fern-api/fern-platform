import { tz } from "@date-fns/tz";
import { AvailabilityBadge, HttpMethodBadge } from "@fern-ui/fern-docs-badges";
import clsx from "clsx";
import { format } from "date-fns";
import { Fragment, ReactElement, ReactNode } from "react";
import { Highlight, Snippet } from "react-instantsearch";
import { MarkRequired, UnreachableCaseError } from "ts-essentials";
import { AlgoliaRecordHit, ApiReferenceRecordHit, ChangelogRecordHit, MarkdownRecordHit } from "../types";

const utc = tz("UTC");

const headingLevels = ["h0", "h1", "h2", "h3", "h4", "h5", "h6"] as const;

function HierarchyBreadcrumb({
    hierarchy,
    level,
}: {
    hierarchy: Partial<Record<(typeof headingLevels)[number], { title?: string; id?: string }>> | undefined;
    level: (typeof headingLevels)[number] | undefined;
}) {
    if (!level) {
        return false;
    }

    const breadcrumb: string[] = [];

    headingLevels.slice(0, headingLevels.indexOf(level)).forEach((headingLevel) => {
        const title = hierarchy?.[headingLevel]?.title;
        if (title) {
            breadcrumb.push(title);
        }
    });

    if (breadcrumb.length === 0) {
        return false;
    }

    return (
        <div className="fern-search-hit-breadcrumb">
            {breadcrumb.map((title, idx) => (
                <Fragment key={title}>
                    <span>{title}</span>
                    {idx < breadcrumb.length - 1 && <span>{" / "}</span>}
                </Fragment>
            ))}
        </div>
    );
}

function HitContentWithTitle({ hit, children }: { hit: AlgoliaRecordHit; children: ReactNode }): ReactElement {
    return (
        <div className="space-y-1.5 flex-1">
            <div className="flex items-baseline gap-1 justify-between">
                <Highlight
                    attribute="title"
                    hit={hit}
                    classNames={{
                        root: clsx("fern-search-hit-title", {
                            deprecated: hit.availability === "Deprecated",
                        }),
                        highlighted: "fern-search-hit-highlighted",
                        nonHighlighted: "fern-search-hit-non-highlighted",
                    }}
                />
                {hit.availability && <AvailabilityBadge availability={hit.availability} size="sm" rounded />}
            </div>
            {children}
        </div>
    );
}

function MarkdownHitContent({ hit }: { hit: MarkdownRecordHit }): ReactElement {
    return (
        <HitContentWithTitle hit={hit}>
            <HierarchyBreadcrumb hierarchy={hit.hierarchy} level={hit.level} />
            <Snippet
                attribute={hit._highlightResult?.description ? "description" : "content"}
                hit={hit}
                classNames={{
                    root: "fern-search-hit-snippet",
                    highlighted: "fern-search-hit-highlighted",
                    nonHighlighted: "fern-search-hit-non-highlighted",
                }}
            />
        </HitContentWithTitle>
    );
}

function ChangelogHitContent({ hit }: { hit: ChangelogRecordHit }): ReactElement {
    const datestring = format(utc(hit.date), "MMM d, yyyy");
    return (
        <HitContentWithTitle hit={hit}>
            <div className="fern-search-hit-breadcrumb">{datestring}</div>
            <Snippet
                attribute={hit._highlightResult?.description ? "description" : "content"}
                hit={hit}
                classNames={{
                    root: "fern-search-hit-snippet",
                    highlighted: "fern-search-hit-highlighted",
                    nonHighlighted: "fern-search-hit-non-highlighted",
                }}
            />
        </HitContentWithTitle>
    );
}

function ApiReferenceHitContent({ hit }: { hit: ApiReferenceRecordHit }): ReactElement {
    const attribute = hit._highlightResult?.request_description
        ? "request_description"
        : hit._highlightResult?.response_description
          ? "response_description"
          : hit._highlightResult?.payload_description
            ? "payload_description"
            : hit._highlightResult?.description
              ? "description"
              : undefined;

    return (
        <HitContentWithTitle hit={hit}>
            <div className="inline-flex items-baseline gap-1">
                <HttpMethodBadge method={hit.method} size="sm" className="shrink-0" />
                <span className="fern-search-hit-endpoint-path shrink">{hit.endpoint_path}</span>
            </div>
            {attribute && (
                <Snippet
                    attribute={attribute}
                    hit={hit}
                    classNames={{
                        root: "fern-search-hit-snippet",
                        highlighted: "fern-search-hit-highlighted",
                        nonHighlighted: "fern-search-hit-non-highlighted",
                    }}
                />
            )}
        </HitContentWithTitle>
    );
}

export function HitContent({ hit }: { hit: MarkRequired<AlgoliaRecordHit, "type"> }): ReactElement | false {
    switch (hit.type) {
        case "markdown":
            return <MarkdownHitContent hit={hit as MarkdownRecordHit} />;
        case "changelog":
            return <ChangelogHitContent hit={hit as ChangelogRecordHit} />;
        case "api-reference":
            return <ApiReferenceHitContent hit={hit as ApiReferenceRecordHit} />;
        case "parameter":
            return false;
        default:
            throw new UnreachableCaseError(hit);
    }
}
