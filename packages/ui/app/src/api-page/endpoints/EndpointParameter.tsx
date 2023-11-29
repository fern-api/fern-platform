import { APIV1Read } from "@fern-api/fdr-sdk";
import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { HEADER_HEIGHT } from "../../constants";
import { getAnchorId } from "../../util/anchor";
import { ApiPageDescription } from "../ApiPageDescription";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointParameter {
    export interface Props {
        name: string;
        description?: string;
        descriptionContainsMarkdown: boolean;
        type: APIV1Read.TypeReference;
        anchorIdParts: string[];
        route: string;
    }
}

export const EndpointParameter: React.FC<EndpointParameter.Props> = ({
    name,
    description,
    anchorIdParts,
    route,
    type,
}) => {
    const anchorId = getAnchorId(anchorIdParts);
    const anchorRoute = `${route}#${anchorId}`;
    return (
        <div
            data-route={anchorRoute}
            className="group/anchor-container relative flex flex-col gap-2 py-3"
            style={{ scrollMarginTop: HEADER_HEIGHT }}
        >
            <AbsolutelyPositionedAnchor verticalPosition="default" route={anchorRoute} />
            <div className="flex items-baseline gap-1">
                <MonospaceText className="text-text-primary-light dark:text-text-primary-dark">{name}</MonospaceText>
                <div className="t-muted text-xs">
                    <TypeShorthand type={type} plural={false} />
                </div>
            </div>
            <ApiPageDescription isMarkdown={true} description={description} />
            <TypeReferenceDefinitions
                type={type}
                isCollapsible
                anchorIdParts={anchorIdParts}
                applyErrorStyles={false}
                route={route}
            />
        </div>
    );
};
