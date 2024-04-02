import { APIV1Read } from "@fern-api/fdr-sdk";
import cn from "clsx";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { FC, PropsWithChildren, ReactNode, memo, useRef, useState } from "react";
import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { useRouteListener } from "../../contexts/useRouteListener";
import { getAnchorId } from "../../util/anchor";
import { ResolvedTypeDefinition, ResolvedTypeShape } from "../../util/resolver";
import { ApiPageDescription } from "../ApiPageDescription";
import { renderTypeShorthandRoot } from "../types/type-shorthand/TypeShorthand";
import { EndpointAvailabilityTag } from "./EndpointAvailabilityTag";

export declare namespace EndpointParameter {
    export interface Props {
        name: string;
        description: MDXRemoteSerializeResult | string | undefined;
        shape: ResolvedTypeShape;
        anchorIdParts: readonly string[];
        route: string;
        availability: APIV1Read.Availability | null | undefined;
        types: Record<string, ResolvedTypeDefinition>;
    }

    export interface ContentProps {
        name: string;
        description: MDXRemoteSerializeResult | string | undefined;
        typeShorthand: ReactNode;
        anchorIdParts: readonly string[];
        route: string;
        availability: APIV1Read.Availability | null | undefined;
    }
}

export const EndpointParameter = memo<EndpointParameter.Props>(
    ({ name, description, anchorIdParts, route, shape, availability, types }) => (
        <EndpointParameterContent
            name={name}
            description={description}
            typeShorthand={renderTypeShorthandRoot(shape, types)}
            anchorIdParts={anchorIdParts}
            route={route}
            availability={availability}
        />
    ),
    (prev, next) =>
        prev.name === next.name &&
        prev.description === next.description &&
        prev.route === next.route &&
        prev.availability === next.availability &&
        prev.shape === next.shape &&
        prev.anchorIdParts.join("/") === next.anchorIdParts.join("/"),
);

EndpointParameter.displayName = "EndpointParameter";

export const EndpointParameterContent: FC<PropsWithChildren<EndpointParameter.ContentProps>> = ({
    name,
    anchorIdParts,
    route,
    availability,
    description,
    typeShorthand,
    children,
}) => {
    const anchorId = getAnchorId(anchorIdParts);
    const anchorRoute = `${route}#${anchorId}`;
    const ref = useRef<HTMLDivElement>(null);

    const [isActive, setIsActive] = useState(false);
    useRouteListener(route, (anchor) => {
        const isActive = anchor === anchorId;
        setIsActive(isActive);
        if (isActive) {
            setTimeout(() => {
                ref.current?.scrollIntoView({ block: "start", behavior: "smooth" });
            }, 450);
        }
    });

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
};
