import { Collapse } from "@blueprintjs/core";
import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import {
    doesSubpackageHaveEndpointsOrWebhooksRecursive,
    getEndpointTitleAsString,
    getSubpackageTitle,
    joinUrlSlugs,
} from "@fern-ui/app-utils";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { resolveSubpackage } from "../api-context/ApiDefinitionContextProvider";
import { areApiArtifactsNonEmpty } from "../api-page/artifacts/areApiArtifactsNonEmpty";
import { HttpMethodTag } from "../commons/HttpMethodTag";
import { API_ARTIFACTS_TITLE } from "../config";
import { useCollapseSidebar } from "./CollapseSidebarContext";
import { SidebarSlugLink } from "./SidebarLink";

export interface ApiSidebarSectionProps {
    className?: string;
    apiSection: DocsV1Read.ApiSection;
    slug: string;
    registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;
    resolveApi: (apiId: FdrAPI.ApiDefinitionId) => APIV1Read.ApiDefinition | undefined;
    depth: number;
}

export const ApiSidebarSection: React.FC<ApiSidebarSectionProps> = ({
    className,
    slug,
    registerScrolledToPathListener,
    apiSection,
    resolveApi,
    depth,
}) => {
    const apiDefinition = useMemo(() => resolveApi(apiSection.api), [apiSection.api, resolveApi]);
    const resolveSubpackageById = useCallback(
        (subpackageId: APIV1Read.SubpackageId): APIV1Read.ApiDefinitionSubpackage | undefined => {
            if (apiDefinition == null) {
                return undefined;
            }
            return resolveSubpackage(apiDefinition, subpackageId);
        },
        [apiDefinition]
    );
    if (apiDefinition == null) {
        return null;
    }
    return (
        <InnerApiSidebarSection
            className={className}
            apiDefinitionPackage={apiDefinition.rootPackage}
            resolveSubpackageById={resolveSubpackageById}
            slug={slug}
            registerScrolledToPathListener={registerScrolledToPathListener}
            artifacts={apiSection.artifacts}
            resolveApi={resolveApi}
            depth={depth}
        />
    );
};

interface InnerApiSidebarSectionProps extends Omit<ApiSidebarSectionProps, "apiSection"> {
    apiDefinitionPackage: APIV1Read.ApiDefinitionPackage;
    resolveSubpackageById: (subpackageId: APIV1Read.SubpackageId) => APIV1Read.ApiDefinitionSubpackage | undefined;
    artifacts?: DocsV1Read.ApiArtifacts;
}

const InnerApiSidebarSection: React.FC<InnerApiSidebarSectionProps> = ({
    className,
    apiDefinitionPackage,
    resolveSubpackageById,
    slug,
    registerScrolledToPathListener,
    artifacts,
    resolveApi,
    depth,
}) => {
    const { selectedSlug } = useCollapseSidebar();
    const renderArtifacts = () => {
        if (artifacts == null || !areApiArtifactsNonEmpty(artifacts)) {
            return null;
        }
        const clientLibrariesSlug = joinUrlSlugs(slug, "client-libraries");
        return (
            <li>
                <SidebarSlugLink
                    slug={clientLibrariesSlug}
                    title={API_ARTIFACTS_TITLE}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    selected={clientLibrariesSlug === selectedSlug}
                    depth={Math.max(0, depth - 1)}
                />
            </li>
        );
    };
    return (
        <ul className={classNames(className, "list-none")}>
            {renderArtifacts()}
            {apiDefinitionPackage.endpoints.map((endpoint) => {
                const fullSlug = joinUrlSlugs(slug, endpoint.urlSlug);
                return (
                    <SidebarSlugLink
                        key={endpoint.id}
                        slug={fullSlug}
                        title={getEndpointTitleAsString(endpoint)}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        selected={fullSlug === selectedSlug}
                        depth={Math.max(0, depth - 1)}
                        rightElement={<HttpMethodTag className="ml-2 font-normal" method={endpoint.method} small />}
                    />
                );
            })}
            {apiDefinitionPackage.webhooks.map((webhook) => {
                const fullSlug = joinUrlSlugs(slug, webhook.urlSlug);
                return (
                    <SidebarSlugLink
                        key={webhook.id}
                        slug={fullSlug}
                        title={webhook.name ?? "/" + webhook.path.join("/")}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        selected={fullSlug === selectedSlug}
                        depth={Math.max(0, depth - 1)}
                    />
                );
            })}
            {apiDefinitionPackage.subpackages.map((subpackageId) => {
                const subpackage = resolveSubpackageById(subpackageId);
                if (
                    subpackage == null ||
                    !doesSubpackageHaveEndpointsOrWebhooksRecursive(subpackageId, resolveSubpackageById)
                ) {
                    return null;
                }
                const subpackageSlug = joinUrlSlugs(slug, subpackage.urlSlug);
                return (
                    <ExpandableApiSidebarSection
                        key={subpackageId}
                        title={getSubpackageTitle(subpackage)}
                        slug={subpackageSlug}
                        apiDefinitionPackage={subpackage}
                        resolveSubpackageById={resolveSubpackageById}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        resolveApi={resolveApi}
                        depth={depth}
                    />
                );
            })}
        </ul>
    );
};

interface ExpandableApiSidebarSectionProps extends InnerApiSidebarSectionProps {
    className?: string;
    title: string;
}

const ExpandableApiSidebarSection: React.FC<ExpandableApiSidebarSectionProps> = ({
    className,
    title,
    slug,
    registerScrolledToPathListener,
    resolveApi,
    depth,
    apiDefinitionPackage,
    resolveSubpackageById,
    artifacts,
}) => {
    const { checkExpanded, toggleExpanded, selectedSlug } = useCollapseSidebar();
    const expanded = checkExpanded(slug);

    return (
        <SidebarSlugLink
            className={className}
            depth={Math.max(depth - 1, 0)}
            registerScrolledToPathListener={registerScrolledToPathListener}
            onClick={useCallback(() => {
                if (!expanded) {
                    toggleExpanded(slug);
                }
            }, [expanded, slug, toggleExpanded])}
            title={title}
            expanded={expanded}
            toggleExpand={useCallback(() => toggleExpanded(slug), [slug, toggleExpanded])}
            showIndicator={selectedSlug?.startsWith(slug) && !expanded}
        >
            <Collapse isOpen={expanded} transitionDuration={0} keepChildrenMounted={true}>
                <InnerApiSidebarSection
                    slug={slug}
                    registerScrolledToPathListener={registerScrolledToPathListener}
                    resolveApi={resolveApi}
                    depth={depth + 1}
                    apiDefinitionPackage={apiDefinitionPackage}
                    resolveSubpackageById={resolveSubpackageById}
                    artifacts={artifacts}
                />
            </Collapse>
        </SidebarSlugLink>
    );
};
