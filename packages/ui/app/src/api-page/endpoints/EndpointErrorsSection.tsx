import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { camelCase, upperFirst } from "lodash-es";
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
        selectedError: APIV1Read.ErrorDeclarationV2 | undefined;
        anchorIdParts: string[];
        route: string;
        defaultExpandAll?: boolean;
    }
}

function isErrorEqual(a: APIV1Read.ErrorDeclarationV2, b: APIV1Read.ErrorDeclarationV2): boolean {
    return (
        a.statusCode === b.statusCode &&
        (a.name != null && b.name != null ? a.name === b.name : a.name == null && b.name == null)
    );
}

export function convertNameToAnchorPart(name: string | undefined): string | undefined {
    if (name == null) {
        return undefined;
    }
    return upperFirst(camelCase(name));
}

export const EndpointErrorsSection: React.FC<EndpointErrorsSection.Props> = ({
    errors,
    selectedError,
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
                        key={error.statusCode}
                        error={error}
                        isFirst={idx === 0}
                        isLast={idx === errors.length - 1}
                        isSelected={selectedError != null && isErrorEqual(error, selectedError)}
                        onClick={(event) => onClickError(error, idx, event)}
                        onHoverProperty={onHoverProperty}
                        anchorIdParts={[...anchorIdParts, `${convertNameToAnchorPart(error.name) ?? error.statusCode}`]}
                        route={route}
                        availability={error.availability}
                        defaultExpandAll={defaultExpandAll}
                    />
                );
            })}
        </div>
    );
};
