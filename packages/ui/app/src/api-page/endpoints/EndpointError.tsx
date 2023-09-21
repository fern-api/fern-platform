import { FernRegistry } from "@fern-fern/registry-browser";
import classNames from "classnames";
import { memo, MouseEventHandler } from "react";
import { type JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointError {
    export interface Props {
        error: FernRegistry.api.v1.read.ErrorDeclaration;
        isFirst: boolean;
        isLast: boolean;
        isSelected: boolean;
        onClick: MouseEventHandler<HTMLButtonElement>;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: string[];
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
}) {
    return (
        <button
            className={classNames(
                "space flex hover:bg-background-primary-light dark:hover:bg-background-primary-dark flex-col items-start px-3",
                {
                    "bg-background-primary-light dark:bg-background-primary-dark": isSelected,
                    "border-border-default-light dark:border-border-default-dark border-b": !isLast,
                },
                {
                    "rounded-t-md": isFirst,
                    "rounded-b-md": isLast,
                },
                {
                    "py-3": !isSelected,
                    "pt-3": isSelected,
                }
            )}
            onClick={onClick}
        >
            <div className="flex items-baseline space-x-2">
                <div className="rounded bg-red-500/20 p-1 text-xs text-red-400">{error.statusCode}</div>
                <div className="t-muted text-xs">
                    {error.type != null && <TypeShorthand type={error.type} plural={false} />}
                </div>
            </div>
            {error.description != null && error.description.length > 0 && (
                <div className="t-muted mt-3 text-start text-base font-light leading-7">{error.description}</div>
            )}

            {isSelected && (
                <div className="border-border-concealed-light dark:border-border-concealed-dark mt-2 w-full border-t text-start">
                    {error.type != null && (
                        <TypeReferenceDefinitions
                            isCollapsible={false}
                            type={error.type}
                            onHoverProperty={onHoverProperty}
                            anchorIdParts={anchorIdParts}
                        />
                    )}
                </div>
            )}
        </button>
    );
});
