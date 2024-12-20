import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { EMPTY_ARRAY, unknownToString } from "@fern-api/ui-core-utils";
import { trackInternal } from "@fern-docs/analytics";
import { AvailabilityBadge } from "@fern-ui/components/badges";
import cn from "clsx";
import { compact } from "es-toolkit/array";
import { FC, PropsWithChildren, ReactNode, memo, useEffect, useRef, useState } from "react";
import { useHref, useIsApiReferencePaginated, useRouteListener } from "../../atoms";
import { FernAnchor } from "../../components/FernAnchor";
import { Markdown } from "../../mdx/Markdown";
import { renderTypeShorthandRoot } from "../../type-shorthand";
import { getAnchorId } from "../../util/anchor";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";

export declare namespace EndpointParameter {
    export interface Props {
        name: string;
        description: FernDocs.MarkdownText | undefined;
        additionalDescriptions: FernDocs.MarkdownText[] | undefined;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        availability: ApiDefinition.Availability | null | undefined;
        shape: ApiDefinition.TypeShape;
        types: Record<string, ApiDefinition.TypeDefinition>;
    }

    export interface ContentProps {
        name: string;
        description: FernDocs.MarkdownText | undefined;
        additionalDescriptions: FernDocs.MarkdownText[] | undefined;
        typeShorthand: ReactNode;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        availability: ApiDefinition.Availability | null | undefined;
    }
}

export const EndpointParameter = memo<EndpointParameter.Props>(
    ({ name, description, additionalDescriptions, anchorIdParts, slug, shape, availability, types }) => (
        <EndpointParameterContent
            name={name}
            description={description}
            additionalDescriptions={additionalDescriptions}
            typeShorthand={renderTypeShorthandRoot(shape, types, false)}
            anchorIdParts={anchorIdParts}
            slug={slug}
            availability={availability}
        >
            <TypeReferenceDefinitions
                shape={shape}
                isCollapsible={true}
                // onHoverProperty={onHoverProperty}
                anchorIdParts={anchorIdParts}
                slug={slug}
                applyErrorStyles={false}
                types={types}
            />
        </EndpointParameterContent>
    ),
    (prev, next) =>
        prev.name === next.name &&
        prev.description === next.description &&
        prev.additionalDescriptions === next.additionalDescriptions &&
        prev.slug === next.slug &&
        prev.availability === next.availability &&
        prev.shape === next.shape &&
        prev.anchorIdParts.join("/") === next.anchorIdParts.join("/"),
);

EndpointParameter.displayName = "EndpointParameter";

export const EndpointParameterContent: FC<PropsWithChildren<EndpointParameter.ContentProps>> = ({
    name,
    anchorIdParts,
    slug,
    availability,
    description,
    additionalDescriptions = EMPTY_ARRAY,
    typeShorthand,
    children,
}) => {
    const anchorId = getAnchorId(anchorIdParts);
    const ref = useRef<HTMLDivElement>(null);

    const [isActive, setIsActive] = useState(false);
    const isPaginated = useIsApiReferencePaginated();
    useRouteListener(slug, (anchor) => {
        const isActive = anchor === anchorId;
        setIsActive(isActive);
        if (isActive) {
            setTimeout(() => {
                ref.current?.scrollIntoView({ block: "start", behavior: isPaginated ? "smooth" : "instant" });
            }, 450);
        }
    });

    const href = useHref(slug, anchorId);
    const descriptions = compact([description, ...additionalDescriptions]);

    useEffect(() => {
        if (descriptions.length > 0) {
            trackInternal("api_reference_multiple_descriptions", {
                name,
                slug,
                anchorIdParts,
                count: descriptions.length,
                descriptions: descriptions.map((d) => unknownToString(d)),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [descriptions]);

    return (
        <div
            ref={ref}
            id={href}
            className={cn("scroll-mt-content-padded relative flex flex-col gap-2 py-3", {
                "outline-accent outline-1 outline outline-offset-4 rounded-sm": isActive,
            })}
        >
            <FernAnchor href={href} sideOffset={6}>
                <span className="inline-flex items-baseline gap-2">
                    <span className="fern-api-property-key">{name}</span>
                    {typeShorthand}
                    {availability != null && <AvailabilityBadge availability={availability} size="sm" rounded />}
                </span>
            </FernAnchor>
            <Markdown mdx={descriptions[0]} className="!t-muted" size="sm" />
            {children}
        </div>
    );
};
