import { APIV1Read } from "@fern-api/fdr-sdk";
import { ResolvedError } from "@fern-ui/app-utils";
import classNames from "classnames";
import { memo, MouseEventHandler } from "react";
import { toTitleCase } from "../../util/string";
import { type JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthand } from "../types/type-shorthand/TypeShorthand";
import { getErrorNameForStatus } from "../utils/getErrorNameForStatus";
import { EndpointAvailabilityTag } from "./EndpointAvailabilityTag";

export declare namespace EndpointError {
    export interface Props {
        error: ResolvedError;
        isFirst: boolean;
        isLast: boolean;
        isSelected: boolean;
        onClick: MouseEventHandler<HTMLButtonElement>;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: string[];
        route: string;
        availability: APIV1Read.Availability | undefined;
        defaultExpandAll?: boolean;
    }
}

export const EndpointError = memo<EndpointError.Props>(function EndpointErrorUnmemoized({
    error,
    isFirst,
    isLast,
    isSelected,
    onHoverProperty,
    onClick,
    anchorIdParts,
    route,
    availability,
    defaultExpandAll = false,
}) {
    return (
        <button
            className={classNames(
                "space flex hover:bg-gray-100/90 dark:hover:bg-background-primary-dark flex-col items-start px-3",
                {
                    "bg-gray-100/90 dark:bg-background-primary-dark": isSelected,
                },
                {
                    "border-default border-b": !isLast,
                },
                {
                    "rounded-t-md": isFirst,
                    "rounded-b-md": isLast,
                },
                {
                    "py-3": !isSelected,
                    "pt-3": isSelected,
                },
            )}
            onClick={onClick}
        >
            <div className="flex items-baseline space-x-2">
                <div className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">{error.statusCode}</div>
                <div className="t-muted text-xs">
                    {error.name != null ? toTitleCase(error.name) : getErrorNameForStatus(error.statusCode)}
                </div>
                {availability != null && <EndpointAvailabilityTag availability={availability} minimal={true} />}
            </div>

            {isSelected && error.shape != null && (
                <div className="w-full pb-3">
                    <div className="t-muted mt-3 w-full text-start text-sm leading-7">
                        {`This error return ${renderTypeShorthand(error.shape, { withArticle: true })}.`}
                    </div>
                    <div className="w-full text-start">
                        <TypeReferenceDefinitions
                            isCollapsible
                            applyErrorStyles
                            shape={error.shape}
                            onHoverProperty={onHoverProperty}
                            anchorIdParts={anchorIdParts}
                            route={route}
                            defaultExpandAll={defaultExpandAll}
                        />
                    </div>
                </div>
            )}
        </button>
    );
});
