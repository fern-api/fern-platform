import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { ApiPageDescription } from "../ApiPageDescription";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";
import { getAnchorId } from "../utils/getAnchorId";

export declare namespace EndpointParameter {
    export interface Props {
        name: string;
        description?: string;
        descriptionContainsMarkdown: boolean;
        type: FernRegistryApiRead.TypeReference;
        anchorIdParts: string[];
    }
}

export const EndpointParameter: React.FC<EndpointParameter.Props> = ({ name, description, anchorIdParts, type }) => {
    const anchor = getAnchorId(anchorIdParts);
    return (
        <div data-anchor={anchor} className="group/anchor-container relative flex scroll-mt-16 flex-col gap-2 py-3">
            {anchor != null && <AbsolutelyPositionedAnchor verticalPosition="default" anchor={anchor} />}
            <div className="flex items-baseline gap-1">
                <MonospaceText className="text-text-primary-light dark:text-text-primary-dark">{name}</MonospaceText>
                <div className="t-muted text-xs">
                    <TypeShorthand type={type} plural={false} />
                </div>
            </div>
            <ApiPageDescription isMarkdown={true} description={description} />
            <TypeReferenceDefinitions type={type} isCollapsible anchorIdParts={anchorIdParts} />
        </div>
    );
};
