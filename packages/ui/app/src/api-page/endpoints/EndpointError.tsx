import { APIV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { memo, MouseEventHandler } from "react";
import { FernCollapse } from "../../components/FernCollapse";
import { ResolvedError } from "../../util/resolver";
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
                "space flex flex-col items-start px-3 hover:bg-white/70 hover:dark:bg-tag-default-soft hover:transition-[background] py-3",
                {
                    "bg-white/70 dark:bg-tag-default-soft": isSelected,
                },
                {
                    "border-default border-b": !isLast,
                },
                {
                    "rounded-t-md": isFirst,
                    "rounded-b-md": isLast,
                },
            )}
            onClick={onClick}
        >
            <div className="flex items-baseline space-x-2">
                <div className="bg-tag-danger text-intent-danger rounded-lg px-2 py-1 text-xs">{error.statusCode}</div>
                <div className="t-muted text-xs">
                    {error.name != null ? toTitleCase(error.name) : getErrorNameForStatus(error.statusCode)}
                </div>
                {availability != null && <EndpointAvailabilityTag availability={availability} minimal={true} />}
            </div>

            {error.shape != null && (
                <FernCollapse isOpen={isSelected} className="w-full">
                    <div className="space-y-2 pt-2">
                        <div className="t-muted w-full text-start text-sm leading-7">
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
                </FernCollapse>
            )}
        </button>
    );
});
