import { APIV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { useRouter } from "next/router";
import { memo, useEffect, useState, useTransition } from "react";
import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { SerializedMdxContent } from "../../mdx/mdx";
import { getAnchorId } from "../../util/anchor";
import { ResolvedTypeDefinition, ResolvedTypeShape } from "../../util/resolver";
import { ApiPageDescription } from "../ApiPageDescription";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthand } from "../types/type-shorthand/TypeShorthand";
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
    const anchorId = getAnchorId(anchorIdParts);
    const anchorRoute = `${route}#${anchorId}`;
    const router = useRouter();
    const [isActive, setIsActive] = useState(false);
    const [, startTransition] = useTransition();

    useEffect(() => {
        if (router.isReady) {
            startTransition(() => {
                setIsActive(router.asPath.endsWith(anchorRoute));
            });
        }
    }, [anchorRoute, router.asPath, router.isReady]);

    return (
        <EndpointParameterInternal
            name={name}
            description={description}
            anchorIdParts={anchorIdParts}
            route={route}
            shape={shape}
            availability={availability}
            types={types}
            isActive={isActive}
        />
    );
};

interface EndpointParameterInternalProps extends EndpointParameter.Props {
    isActive: boolean;
}

const EndpointParameterInternal = memo<EndpointParameterInternalProps>(function EndpointParameterInternal({
    name,
    description,
    anchorIdParts,
    route,
    shape,
    availability,
    types,
    isActive,
}) {
    const anchorId = getAnchorId(anchorIdParts);
    const anchorRoute = `${route}#${anchorId}`;
    return (
        <div
            data-route={anchorRoute.toLowerCase()}
            className={classNames("scroll-mt-header-height-padded relative flex flex-col gap-2 py-3", {
                "outline-accent-primary outline-1 outline outline-offset-4 rounded-sm": isActive,
            })}
        >
            <div className="group/anchor-container flex items-center">
                <AbsolutelyPositionedAnchor href={anchorRoute} />
                <span className="inline-flex items-baseline gap-1">
                    <MonospaceText
                        className={classNames("t-default text-sm", {
                            "t-accent": isActive,
                        })}
                    >
                        {name}
                    </MonospaceText>
                    <div className="t-muted text-xs">{renderTypeShorthand(shape, undefined, types)}</div>
                    {availability != null && <EndpointAvailabilityTag availability={availability} minimal={true} />}
                </span>
            </div>
            <ApiPageDescription isMarkdown={true} description={description} className="!t-muted text-sm" />
            <TypeReferenceDefinitions
                shape={shape}
                isCollapsible
                anchorIdParts={anchorIdParts}
                applyErrorStyles={false}
                route={route}
                types={types}
            />
        </div>
    );
});
