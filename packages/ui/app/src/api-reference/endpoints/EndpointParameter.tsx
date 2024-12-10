import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import { CopyToClipboardButton, cn } from "@fern-ui/components";
import { AvailabilityBadge, Badge } from "@fern-ui/components/badges";
import { compact } from "es-toolkit/array";
import { FC, PropsWithChildren, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { capturePosthogEvent } from "../../analytics/posthog";
import { useIsApiReferencePaginated, useRouteListener } from "../../atoms";
import { FernAnchor } from "../../components/FernAnchor";
import { Markdown } from "../../mdx/Markdown";
import { renderTypeShorthandRoot } from "../../type-shorthand";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { useAnchorId, useSlug } from "./AnchorIdParts";

export declare namespace EndpointParameter {
    export interface Props {
        name: string;
        description: FernDocs.MarkdownText | undefined;
        additionalDescriptions: FernDocs.MarkdownText[] | undefined;
        availability: ApiDefinition.Availability | null | undefined;
        shape: ApiDefinition.TypeShape;
        types: Record<string, ApiDefinition.TypeDefinition>;
    }

    export interface ContentProps {
        name: string;
        description: FernDocs.MarkdownText | undefined;
        additionalDescriptions: FernDocs.MarkdownText[] | undefined;
        typeShorthand: ReactNode;
        availability: ApiDefinition.Availability | null | undefined;
    }
}

export const EndpointParameter = ({
    name,
    description,
    additionalDescriptions,
    shape,
    availability,
    types,
}: EndpointParameter.Props): ReactElement => (
    <EndpointParameterContent
        name={name}
        description={description}
        additionalDescriptions={additionalDescriptions}
        typeShorthand={renderTypeShorthandRoot(shape, types, false)}
        availability={availability}
    >
        <TypeReferenceDefinitions
            shape={shape}
            isCollapsible={true}
            // onHoverProperty={onHoverProperty}
            applyErrorStyles={false}
            types={types}
        />
    </EndpointParameterContent>
);

export const EndpointParameterContent: FC<PropsWithChildren<EndpointParameter.ContentProps>> = ({
    name,
    availability,
    description,
    additionalDescriptions = EMPTY_ARRAY,
    typeShorthand,
    children,
}) => {
    const slug = useSlug();
    const anchorId = useAnchorId();

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

    const descriptions = compact([description, ...additionalDescriptions]);

    useEffect(() => {
        if (descriptions.length > 0) {
            capturePosthogEvent("api_reference_multiple_descriptions", {
                name,
                href: String(new URL(`/${slug}#${anchorId}`, window.location.href)),
                count: descriptions.length,
                descriptions,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [descriptions]);

    return (
        <div
            ref={ref}
            id={anchorId}
            className={cn("scroll-mt-content-padded relative flex flex-col gap-2 py-3", {
                "outline-accent outline-1 outline outline-offset-4 rounded-sm": isActive,
            })}
        >
            <FernAnchor href={`#${anchorId}`} asChild>
                <span className="inline-flex items-baseline gap-2">
                    <CopyToClipboardButton content={name} asChild hideIcon>
                        <Badge
                            className="fern-api-property-key -ml-2"
                            variant="ghost"
                            rounded
                            interactive
                            color="accent"
                        >
                            {name}
                        </Badge>
                    </CopyToClipboardButton>
                    {typeShorthand}
                    {availability != null && <AvailabilityBadge availability={availability} size="sm" rounded />}
                </span>
            </FernAnchor>
            <Markdown mdx={descriptions[0]} className="!t-muted" size="sm" />
            {children}
        </div>
    );
};
