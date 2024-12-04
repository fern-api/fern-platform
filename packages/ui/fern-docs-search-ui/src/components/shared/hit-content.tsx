import { tz } from "@date-fns/tz";
import { AvailabilityBadge, HttpMethodBadge } from "@fern-ui/fern-docs-badges";
import clsx from "clsx";
import { format } from "date-fns";
import { uniq } from "es-toolkit/array";
import { ChevronRight } from "lucide-react";
import { Fragment, ReactElement, ReactNode } from "react";
import { Highlight, Snippet } from "react-instantsearch";
import { MarkRequired, UnreachableCaseError } from "ts-essentials";
import { AlgoliaRecordHit, ApiReferenceRecordHit, ChangelogRecordHit, MarkdownRecordHit } from "../types";

const utc = tz("UTC");

const headingLevels = ["h0", "h1", "h2", "h3", "h4", "h5", "h6"] as const;

function Breadcrumb({ breadcrumb }: { breadcrumb: string[] }): ReactNode {
    if (breadcrumb.length === 0) {
        return false;
    }

    return (
        <div className="fern-search-hit-breadcrumb">
            <span className="inline-flex items-center gap-0.5">
                {uniq(breadcrumb).map((title, idx) => (
                    <Fragment key={title}>
                        <span>{title}</span>
                        {idx < breadcrumb.length - 1 && <ChevronRight className="size-3 shrink-0 -mb-px" />}
                    </Fragment>
                ))}
            </span>
        </div>
    );
}

type SegmentType = "markdown" | "changelog" | "parameter" | "http" | "webhook" | "websocket";
const SEGMENT_DISPLAY_NAMES: Record<SegmentType, string> = {
    markdown: "Guide",
    changelog: "Changelog",
    parameter: "Parameter",
    http: "Endpoint",
    webhook: "Webhook",
    websocket: "WebSocket",
};

function HitContentWithTitle({ hit, children }: { hit: AlgoliaRecordHit; children: ReactNode }): ReactElement {
    return (
        <div className="flex-1 shrink min-w-0">
            <div className="flex items-baseline gap-1 justify-between">
                <span
                    className={clsx("fern-search-hit-title", {
                        deprecated:
                            hit.availability === "Deprecated" ||
                            hit.availability === "Sunset" ||
                            hit.availability === "Retired",
                    })}
                >
                    <Highlight
                        attribute="title"
                        hit={hit}
                        classNames={{
                            highlighted: "fern-search-hit-highlighted",
                            nonHighlighted: "fern-search-hit-non-highlighted",
                        }}
                    />
                    {hit.availability && (
                        <AvailabilityBadge availability={hit.availability} size="sm" rounded className="ml-1" />
                    )}
                </span>
                <span className="text-[var(--grayscale-a10)] text-sm">
                    {SEGMENT_DISPLAY_NAMES[hit.type === "api-reference" ? hit.api_type : hit.type]}
                </span>
            </div>
            {children}
        </div>
    );
}

function MarkdownHitContent({ hit }: { hit: MarkdownRecordHit }): ReactElement {
    return (
        <HitContentWithTitle hit={hit}>
            <Breadcrumb breadcrumb={createHierarchyBreadcrumb(hit.breadcrumb, hit.hierarchy, hit.level)} />
        </HitContentWithTitle>
    );
}

function ChangelogHitContent({ hit }: { hit: ChangelogRecordHit }): ReactElement {
    const datestring = format(utc(hit.date), "MMM d, yyyy");
    return (
        <HitContentWithTitle hit={hit}>
            <Breadcrumb breadcrumb={[...hit.breadcrumb.map((crumb) => crumb.title), datestring]} />
        </HitContentWithTitle>
    );
}

function ApiReferenceHitContent({ hit }: { hit: ApiReferenceRecordHit }): ReactElement {
    return (
        <HitContentWithTitle hit={hit}>
            <div className="inline-flex items-baseline gap-1 max-w-full">
                <HttpMethodBadge method={hit.method} size="sm" className="shrink-0" variant="outlined" />
                <span className="fern-search-hit-endpoint-path shrink">{hit.endpoint_path}</span>
            </div>
        </HitContentWithTitle>
    );
}

function HitSnippet({ hit, attribute }: { hit: AlgoliaRecordHit; attribute?: keyof AlgoliaRecordHit }): ReactNode {
    if (!attribute) {
        return false;
    }

    return (
        <Snippet
            attribute={attribute}
            hit={hit}
            classNames={{
                root: "fern-search-hit-snippet",
                highlighted: "fern-search-hit-highlighted",
                nonHighlighted: "fern-search-hit-non-highlighted",
            }}
        />
    );
}

export function HitContent({ hit }: { hit: MarkRequired<AlgoliaRecordHit, "type"> }): ReactNode {
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
            // eslint-disable-next-line no-console
            console.error(new UnreachableCaseError(hit));
            return false;
    }
}

function createHierarchyBreadcrumb(
    breadcrumb: { title: string; pathname?: string }[],
    hierarchy: Partial<Record<(typeof headingLevels)[number], { title?: string; id?: string }>> | undefined,
    level: (typeof headingLevels)[number] | undefined,
) {
    const combinedBreadcrumb: string[] = [];

    combinedBreadcrumb.push(...breadcrumb.map((crumb) => crumb.title));

    if (level) {
        headingLevels.slice(0, headingLevels.indexOf(level)).forEach((headingLevel) => {
            const title = hierarchy?.[headingLevel]?.title;
            if (title) {
                combinedBreadcrumb.push(title);
            }
        });
    }

    return combinedBreadcrumb;
}

export { HitSnippet };
