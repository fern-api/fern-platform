import { APIV1Read } from "@fern-api/fdr-sdk";
import { FinchProviderMatrix } from "../../../mdx/components/FinchProviderMatrix";
import { JsonPropertyPath } from "../../examples/json-example/contexts/JsonPropertyPath";
import { TypeDefinitionContextProvider } from "../context/TypeDefinitionContextProvider";
import { InternalTypeReferenceDefinitions } from "./InternalTypeReferenceDefinitions";

export declare namespace TypeReferenceDefinitions {
    export interface Props {
        type: APIV1Read.TypeReference;
        applyErrorStyles: boolean;
        isCollapsible: boolean;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: string[];
        className?: string;
        route: string;
        finchProperties?: FinchProviderMatrix.Property[];
        defaultExpandAll?: boolean;
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
    finchProperties,
    defaultExpandAll = false,
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
                finchProperties={finchProperties}
                defaultExpandAll={defaultExpandAll}
            />
        </TypeDefinitionContextProvider>
    );
};
