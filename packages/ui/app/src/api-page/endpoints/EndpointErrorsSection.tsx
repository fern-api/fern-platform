import { FernRegistry } from "@fern-fern/registry-browser";
import classNames from "classnames";
import { type JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

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
    }
}

export const EndpointErrorsSection: React.FC<EndpointErrorsSection.Props> = ({
    errors,
    selectedErrorIndex,
    onHoverProperty,
    onClickError,
}) => {
    return (
        <div className="border-border-default-light dark:border-border-default-dark flex flex-col overflow-hidden rounded-md border">
            {errors.map((e, idx) => {
                return (
                    <button
                        key={idx}
                        className={classNames(
                            "space flex hover:bg-background-primary-light dark:hover:bg-background-primary-dark flex-col items-start p-3",
                            {
                                "bg-background-primary-light dark:bg-background-primary-dark":
                                    idx === selectedErrorIndex,
                                "border-border-default-light dark:border-border-default-dark border-b":
                                    idx !== errors.length - 1,
                            }
                        )}
                        onClick={(event) => {
                            onClickError(e, idx, event);
                        }}
                    >
                        <div className="flex items-baseline space-x-2">
                            <div className="rounded bg-red-500/20 p-1 text-xs text-red-400">{e.statusCode}</div>
                            <div className="t-muted text-xs">
                                {e.type != null && <TypeShorthand type={e.type} plural={false} />}
                            </div>
                        </div>
                        <div className="t-muted mt-3 text-start text-base font-light leading-7">{e.description}</div>
                        {idx === selectedErrorIndex && (
                            <div className="text-start">
                                {e.type != null && (
                                    <TypeReferenceDefinitions
                                        isCollapsible={false}
                                        type={e.type}
                                        onHoverProperty={onHoverProperty}
                                    />
                                )}
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
