import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { JsonPropertyPath } from "../../examples/json-example/contexts/JsonPropertyPath";
import { TypeDefinitionContextProvider } from "../context/TypeDefinitionContextProvider";
import { InternalTypeReferenceDefinitions } from "./InternalTypeReferenceDefinitions";

export declare namespace TypeReferenceDefinitions {
    export interface Props {
        type: FernRegistryApiRead.TypeReference;
        applyErrorStyles: boolean;
        isCollapsible: boolean;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: string[];
        className?: string;
        route: string;
    }
}

export const TypeReferenceDefinitions: React.FC<TypeReferenceDefinitions.Props> = ({
    type,
    isCollapsible,
    applyErrorStyles,
    onHoverProperty,
    anchorIdParts,
    className,
    route,
}) => {
    return (
        <TypeDefinitionContextProvider onHoverProperty={onHoverProperty}>
            <InternalTypeReferenceDefinitions
                type={type}
                isCollapsible={isCollapsible}
                applyErrorStyles={applyErrorStyles}
                className={className}
                anchorIdParts={anchorIdParts}
                route={route}
            />
        </TypeDefinitionContextProvider>
    );
};
