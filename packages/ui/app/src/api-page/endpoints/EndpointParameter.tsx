import { APIV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { useRouter } from "next/router";
import { FC, PropsWithChildren, ReactNode, useEffect, useState } from "react";
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
        typeShorthand: ReactNode;
        anchorIdParts: string[];
        route: string;
        availability: APIV1Read.Availability | null | undefined;
    }
}

export const EndpointParameter: React.FC<EndpointParameter.Props> = ({
    name,
    description,
    anchorIdParts,
    route,
    shape,
    availability,
    types,
}) => {
    return (
        <EndpointParameterContent
            name={name}
            description={description}
            typeShorthand={renderTypeShorthandRoot(shape, types)}
            anchorIdParts={anchorIdParts}
            route={route}
            availability={availability}
        />
    );
};

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
    const router = useRouter();
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setIsActive(router.asPath.endsWith(`${route}#${anchorId}`));
    }, [router.asPath, anchorId, route]);

    return (
        <div
            data-route={anchorRoute.toLowerCase()}
            className={classNames("scroll-mt-header-height-padded relative flex flex-col gap-2 py-3", {
                "before:outline-border-accent-muted before:outline-1 before:outline before:outline-offset-0 before:content-[''] before:inset-y-0 before:-inset-x-2 before:rounded-sm":
                    isActive,
            })}
        >
            <div className="group/anchor-container flex items-center">
                <AbsolutelyPositionedAnchor href={anchorRoute} />
                <span className="inline-flex items-baseline gap-2">
                    <MonospaceText
                        className={classNames("t-default text-sm", {
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
