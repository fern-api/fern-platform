import { FernNavigation } from "@fern-api/fdr-sdk";
import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import clsx from "clsx";
import { FC, PropsWithChildren, ReactNode, memo, useRef, useState } from "react";
import { useIsApiReferencePaginated, useRouteListener } from "../../atoms";
import { FernAnchor } from "../../components/FernAnchor";
import { useHref } from "../../hooks/useHref";
import { Markdown } from "../../mdx/Markdown";
import type { BundledMDX } from "../../mdx/types";
import { ResolvedTypeDefinition, ResolvedTypeShape } from "../../resolver/types";
import { getAnchorId } from "../../util/anchor";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthandRoot } from "../types/type-shorthand/TypeShorthand";
import { EndpointAvailabilityTag } from "./EndpointAvailabilityTag";

export declare namespace EndpointParameter {
    export interface Props {
        name: string;
        description: BundledMDX | undefined;
        shape: ResolvedTypeShape;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        availability: APIV1Read.Availability | null | undefined;
        types: Record<string, ResolvedTypeDefinition>;
    }

    export interface ContentProps {
        name: string;
        description: BundledMDX | undefined;
        typeShorthand: ReactNode;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        availability: APIV1Read.Availability | null | undefined;
    }
}

export const EndpointParameter = memo<EndpointParameter.Props>(
    ({ name, description, anchorIdParts, slug, shape, availability, types }) => (
        <EndpointParameterContent
            name={name}
            description={description}
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
    return (
        <div
            ref={ref}
            id={href}
            className={clsx("scroll-mt-content-padded relative flex flex-col gap-2 py-3", {
                "outline-accent rounded-sm outline outline-1 outline-offset-4": isActive,
            })}
        >
            <FernAnchor href={href} sideOffset={6}>
                <span className="inline-flex items-baseline gap-2">
                    <span className="fern-api-property-key">{name}</span>
                    {typeShorthand}
                    {availability != null && <EndpointAvailabilityTag availability={availability} minimal={true} />}
                </span>
            </FernAnchor>
            <Markdown mdx={description} className="!t-muted" size="sm" />
            {children}
        </div>
    );
};
