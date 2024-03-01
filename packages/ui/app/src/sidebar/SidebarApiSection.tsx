import { APIV1Read, DocsV1Read, joinUrlSlugs } from "@fern-api/fdr-sdk";
import { ActivityLogIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { isEqual, last, sortBy } from "lodash-es";
import moment from "moment";
import { memo, ReactElement, ReactNode, useCallback } from "react";
import { areApiArtifactsNonEmpty } from "../api-page/artifacts/areApiArtifactsNonEmpty";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { FernTooltip } from "../components/FernTooltip";
import { API_ARTIFACTS_TITLE } from "../config";
import { useNavigationContext } from "../contexts/navigation-context";
import { checkSlugStartsWith, useCollapseSidebar } from "./CollapseSidebarContext";
import { SidebarSlugLink } from "./SidebarLink";
import { isApiPage, SidebarNode } from "./types";

export interface SidebarApiSectionProps {
    className?: string;
    apiSection: SidebarNode.ApiSection;
    slug: string[];
    registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
    depth: number;
}

export const SidebarApiSection: React.FC<SidebarApiSectionProps> = ({
    className,
    slug,
    registerScrolledToPathListener,
    apiSection,
    depth,
}) => {
    return (
        <InnerSidebarApiSection
            className={className}
            slug={slug}
            registerScrolledToPathListener={registerScrolledToPathListener}
            artifacts={apiSection.artifacts}
            depth={depth}
            apiSection={apiSection}
        />
    );
};

interface InnerSidebarApiSectionProps extends SidebarApiSectionProps {
    artifacts: DocsV1Read.ApiArtifacts | undefined;
}

const HTTP_METHOD_TAGS: Record<APIV1Read.HttpMethod, ReactElement> = {
    GET: <HttpMethodTag className="ml-2 font-normal" method={APIV1Read.HttpMethod.Get} small />,
    POST: <HttpMethodTag className="ml-2 font-normal" method={APIV1Read.HttpMethod.Post} small />,
    PUT: <HttpMethodTag className="ml-2 font-normal" method={APIV1Read.HttpMethod.Put} small />,
    PATCH: <HttpMethodTag className="ml-2 font-normal" method={APIV1Read.HttpMethod.Patch} small />,
    DELETE: <HttpMethodTag className="ml-2 font-normal" method={APIV1Read.HttpMethod.Delete} small />,
};

const InnerSidebarApiSection = memo<InnerSidebarApiSectionProps>(function InnerSidebarApiSection({
    className,
    slug,
    registerScrolledToPathListener,
    artifacts,
    depth,
    apiSection,
}) {
    const { selectedSlug } = useCollapseSidebar();
    const { activeNavigatable } = useNavigationContext();
    const shallow =
        activeNavigatable != null && isApiPage(activeNavigatable) && activeNavigatable.api === apiSection.api;
    const renderArtifacts = () => {
        if (artifacts == null || !areApiArtifactsNonEmpty(artifacts)) {
            return null;
        }
        const clientLibrariesSlug = [...slug, "client-libraries"];
        return (
            <SidebarSlugLink
                slug={clientLibrariesSlug}
                title={API_ARTIFACTS_TITLE}
                registerScrolledToPathListener={registerScrolledToPathListener}
                selected={isEqual(clientLibrariesSlug, selectedSlug)}
                depth={Math.max(0, depth - 1)}
            />
        );
    };

    if (
        apiSection.endpoints.length === 0 &&
        apiSection.webhooks.length === 0 &&
        apiSection.websockets.length === 0 &&
        apiSection.subpackages.length === 0 &&
        (artifacts == null || areApiArtifactsNonEmpty(artifacts))
    ) {
        return null;
    }

    return (
        <ul className={classNames(className, "fern-sidebar-group")}>
            {renderArtifacts()}
            {apiSection.endpoints.map((endpoint) => (
                <SidebarSlugLink
                    key={joinUrlSlugs(...endpoint.slug)}
                    slug={endpoint.slug}
                    shallow={shallow}
                    title={endpoint.title}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    selected={isEqual(endpoint.slug, selectedSlug)}
                    depth={Math.max(0, depth - 1)}
                    rightElement={HTTP_METHOD_TAGS[endpoint.method]}
                />
            ))}
            {apiSection.websockets.map((channel) => (
                <SidebarSlugLink
                    key={joinUrlSlugs(...channel.slug)}
                    slug={channel.slug}
                    shallow={shallow}
                    title={channel.title}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    selected={isEqual(channel.slug, selectedSlug)}
                    depth={Math.max(0, depth - 1)}
                    rightElement={
                        <FernTooltip content="WebSocket Channel">
                            <span className="rounded-md font-mono text-xs uppercase leading-none">wss</span>
                        </FernTooltip>
                    }
                />
            ))}
            {apiSection.webhooks.map((webhook) => (
                <SidebarSlugLink
                    key={joinUrlSlugs(...webhook.slug)}
                    slug={webhook.slug}
                    shallow={shallow}
                    title={webhook.title}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    selected={isEqual(webhook.slug, selectedSlug)}
                    depth={Math.max(0, depth - 1)}
                />
            ))}
            {apiSection.subpackages.map((subpackage) => (
                <ExpandableSidebarApiSection
                    key={joinUrlSlugs(...subpackage.slug)}
                    title={subpackage.title}
                    slug={subpackage.slug}
                    apiSection={subpackage}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    depth={depth}
                    artifacts={undefined}
                />
            ))}
            {apiSection.changelog != null && (
                <SidebarSlugLink
                    slug={apiSection.changelog.slug}
                    title={apiSection.changelog.title}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    selected={isEqual(apiSection.changelog.slug, selectedSlug)}
                    depth={Math.max(0, depth - 1)}
                    icon={<ActivityLogIcon />}
                    rightElement={
                        shouldShowIndicator(apiSection.changelog) && (
                            <span className="relative flex size-2">
                                <span className="bg-accent absolute inline-flex size-full animate-ping rounded-full opacity-75"></span>
                                <span className="bg-accent relative inline-flex size-2 rounded-full"></span>
                            </span>
                        )
                    }
                    tooltipContent={renderChangelogTooltip(apiSection.changelog)}
                />
            )}
        </ul>
    );
});

function shouldShowIndicator(changelog: SidebarNode.ChangelogPage): boolean {
    // if latest change was within the last 7 days
    const latestChange = last(sortBy(changelog.items, "date"));
    if (latestChange == null) {
        return false;
    }

    return moment().diff(latestChange.date, "days") <= 7;
}

function renderChangelogTooltip(changelog: SidebarNode.ChangelogPage): ReactNode {
    const latestChange = last(sortBy(changelog.items, "date"));

    if (latestChange == null) {
        return null;
    }

    return `Last updated ${moment(latestChange.date).fromNow()}`;
}

interface ExpandableSidebarApiSectionProps extends InnerSidebarApiSectionProps {
    className?: string;
    title: string;
}

export const ExpandableSidebarApiSection: React.FC<ExpandableSidebarApiSectionProps> = ({
    className,
    title,
    slug,
    registerScrolledToPathListener,
    depth,
    artifacts,
    apiSection,
}) => {
    const { checkExpanded, toggleExpanded, selectedSlug } = useCollapseSidebar();
    const expanded = checkExpanded(slug);

    return (
        <SidebarSlugLink
            className={className}
            depth={Math.max(depth - 1, 0)}
            registerScrolledToPathListener={registerScrolledToPathListener}
            title={title}
            expanded={expanded}
            toggleExpand={useCallback(() => toggleExpanded(slug), [slug, toggleExpanded])}
            showIndicator={selectedSlug != null && checkSlugStartsWith(selectedSlug, slug) && !expanded}
        >
            <InnerSidebarApiSection
                className={classNames("expandable", { hidden: !expanded })}
                slug={slug}
                registerScrolledToPathListener={registerScrolledToPathListener}
                depth={depth + 1}
                artifacts={artifacts}
                apiSection={apiSection}
            />
        </SidebarSlugLink>
    );
};
