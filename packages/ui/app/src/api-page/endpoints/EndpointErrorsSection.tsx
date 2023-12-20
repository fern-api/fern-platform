import { FdrAPI } from "@fern-api/fdr-sdk";
import { type JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { EndpointError } from "./EndpointError";

export declare namespace EndpointErrorsSection {
    export interface Props {
        errors: FdrAPI.api.v1.read.ErrorDeclarationV2[];
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        onClickError: (
            e: FdrAPI.api.v1.read.ErrorDeclarationV2,
            index: number,
            event: React.MouseEvent<HTMLButtonElement>
        ) => void;
        selectedErrorIndex: number | null;
        anchorIdParts: string[];
        route: string;
        defaultExpandAll?: boolean;
    }
}

export const EndpointErrorsSection: React.FC<EndpointErrorsSection.Props> = ({
    errors,
    selectedErrorIndex,
    onHoverProperty,
    onClickError,
    anchorIdParts,
    route,
    defaultExpandAll = false,
}) => {
    return (
        <div className="border-border-default-light dark:border-border-default-dark flex flex-col overflow-visible rounded-md border">
            {errors.map((error, idx) => {
                return (
                    <EndpointError
                        key={idx}
                        error={error}
                        isFirst={idx === 0}
                        isLast={idx === errors.length - 1}
                        isSelected={idx === selectedErrorIndex}
                        onClick={(event) => onClickError(error, idx, event)}
                        onHoverProperty={onHoverProperty}
                        anchorIdParts={[...anchorIdParts, `${idx}`]}
                        route={route}
                        availability={error.availability}
                        defaultExpandAll={defaultExpandAll}
                    />
                );
            })}
        </div>
    );
};
