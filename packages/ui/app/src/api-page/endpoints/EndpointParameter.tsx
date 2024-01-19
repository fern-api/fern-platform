import { APIV1Read } from "@fern-api/fdr-sdk";
import { ResolvedTypeReference } from "@fern-ui/app-utils";
import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { getAnchorId } from "../../util/anchor";
import { ApiPageDescription } from "../ApiPageDescription";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthand } from "../types/type-shorthand/TypeShorthand";
import { EndpointAvailabilityTag } from "./EndpointAvailabilityTag";

export declare namespace EndpointParameter {
    export interface Props {
        name: string;
        description: string | undefined;
        descriptionContainsMarkdown: boolean;
        shape: ResolvedTypeReference;
        anchorIdParts: string[];
        route: string;
        availability: APIV1Read.Availability | undefined;
    }
}

export const EndpointParameter: React.FC<EndpointParameter.Props> = ({
    name,
    description,
    anchorIdParts,
    route,
    shape,
    availability,
}) => {
    const anchorId = getAnchorId(anchorIdParts);
    const anchorRoute = `${route}#${anchorId}`;
    return (
        <div data-route={anchorRoute.toLowerCase()} className="relative flex scroll-mt-20 flex-col gap-2 py-3">
            <div className="group/anchor-container flex items-center">
                <AbsolutelyPositionedAnchor href={anchorRoute} />
                <span className="inline-flex items-baseline gap-1">
                    <MonospaceText className="text-text-primary-light dark:text-text-primary-dark text-sm">
                        {name}
                    </MonospaceText>
                    <div className="t-muted text-xs">{renderTypeShorthand(shape)}</div>
                    {availability != null && <EndpointAvailabilityTag availability={availability} minimal={true} />}
                </span>
            </div>
            <ApiPageDescription isMarkdown={true} description={description} className="text-sm" />
            <TypeReferenceDefinitions
                shape={shape}
                isCollapsible
                anchorIdParts={anchorIdParts}
                applyErrorStyles={false}
                route={route}
            />
        </div>
    );
};
