import { APIV1Read } from "@fern-api/fdr-sdk";
import cn from "clsx";
import { useRouter } from "next/router";
import { FC, PropsWithChildren, forwardRef, memo, useEffect, useRef, useState } from "react";
import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { SerializedMdxContent } from "../../mdx/mdx";
import { getAnchorId } from "../../util/anchor";
import { ResolvedTypeDefinition, ResolvedTypeShape } from "../../util/resolver";
import { ApiPageDescription } from "../ApiPageDescription";
import { renderTypeShorthandRoot } from "../types/type-shorthand/TypeShorthand";
import { EndpointAvailabilityTag } from "./EndpointAvailabilityTag";

export declare namespace EndpointParameter {
    export interface Props {
        name: string;
        description: SerializedMdxContent | undefined;
        shape: ResolvedTypeShape;
        anchorIdParts: string[];
        route: string;
        availability: APIV1Read.Availability | null | undefined;
        types: Record<string, ResolvedTypeDefinition>;
    }

    export interface ContentProps {
        name: string;
        description: SerializedMdxContent | undefined;
        anchorRoute: string;
        isActive: boolean;
        availability: APIV1Read.Availability | null | undefined;
        shape: ResolvedTypeShape;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const EndpointParameter: FC<EndpointParameter.Props> = ({
    name,
    description,
    anchorIdParts,
    route,
    shape,
    availability,
    types,
}) => {
    const anchorId = getAnchorId(anchorIdParts);
    const anchorRoute = `${route}#${anchorId}`;
    const router = useRouter();
    const [isActive, setIsActive] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const active = router.asPath.endsWith(`${route}#${anchorId}`);
        setIsActive(active);

        if (active) {
            setTimeout(() => {
                ref.current?.scrollIntoView({ block: "start", behavior: "smooth" });
            }, 450);
        }
    }, [router.asPath, anchorId, route]);

    return (
        <EndpointParameterContent
            name={name}
            description={description}
            anchorRoute={anchorRoute}
            isActive={isActive}
            availability={availability}
            shape={shape}
            types={types}
        />
    );
};

export const EndpointParameterContent = memo(
    forwardRef<HTMLDivElement, PropsWithChildren<EndpointParameter.ContentProps>>((props, ref) => {
        const { name, anchorRoute, isActive, availability, description, shape, types, children } = props;
        const typeShorthand = renderTypeShorthandRoot(shape, types);
        return (
            <div
                ref={ref}
                data-route={anchorRoute.toLowerCase()}
                className={cn("scroll-mt-header-height-padded relative flex flex-col gap-2 py-3", {
                    "before:outline-border-accent-muted before:outline-1 before:outline before:outline-offset-0 before:content-[''] before:inset-y-0 before:-inset-x-2 before:rounded-sm":
                        isActive,
                })}
            >
                <div className="group/anchor-container flex items-center">
                    <AbsolutelyPositionedAnchor href={anchorRoute} />
                    <span className="inline-flex items-baseline gap-2">
                        <MonospaceText
                            className={cn("t-default text-sm", {
                                "t-accent": isActive,
                            })}
                        >
                            {name}
                        </MonospaceText>
                        {typeShorthand}
                        {availability != null && <EndpointAvailabilityTag availability={availability} minimal={true} />}
                    </span>
                </div>
                <ApiPageDescription isMarkdown={true} description={description} className="!t-muted text-sm" />
                {children}
            </div>
        );
    }),
);

EndpointParameterContent.displayName = "EndpointParameterContent";
