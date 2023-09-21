import { FernRegistry } from "@fern-fern/registry-browser";
import { type JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { EndpointError } from "./EndpointError";

export declare namespace EndpointErrorsSection {
    export interface Props {
        errors: FernRegistry.api.v1.read.ErrorDeclaration[];
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        onClickError: (
            e: FernRegistry.api.v1.read.ErrorDeclaration,
            index: number,
            event: React.MouseEvent<HTMLButtonElement>
        ) => void;
        selectedErrorIndex: number | null;
        anchorIdParts: string[];
    }
}

export const EndpointErrorsSection: React.FC<EndpointErrorsSection.Props> = ({
    errors,
    selectedErrorIndex,
    onHoverProperty,
    onClickError,
    anchorIdParts,
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
                    />
                );
            })}
        </div>
    );
};
