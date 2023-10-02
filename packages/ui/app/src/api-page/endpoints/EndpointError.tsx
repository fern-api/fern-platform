import { FernRegistry } from "@fern-fern/registry-browser";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import { memo, MouseEventHandler, useEffect } from "react";
import { NavigationInfo, NavigationStatus } from "../../navigation-context/NavigationContext";
import { useNavigationContext } from "../../navigation-context/useNavigationContext";
import { getAnchorId } from "../../util/anchor";
import { toTitleCase } from "../../util/string";
import { type JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeDefinitionContextProvider } from "../types/context/TypeDefinitionContextProvider";
import { InternalTypeDefinitionError } from "../types/type-definition/InternalTypeDefinitionError";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

function shouldSelectError(navigation: NavigationInfo, curAnchorId: string) {
    if (navigation.status !== NavigationStatus.INITIAL_NAVIGATION_TO_ANCHOR) {
        return false;
    }
    const { anchorId: destAnchorId } = navigation;
    return destAnchorId.startsWith(`${curAnchorId}-`);
}

export declare namespace EndpointError {
    export interface Props {
        error: FernRegistry.api.v1.read.ErrorDeclarationV2;
        isFirst: boolean;
        isLast: boolean;
        isSelected: boolean;
        onClick: MouseEventHandler<HTMLButtonElement>;
        select: () => void;
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
    select,
    anchorIdParts,
}) {
    const { navigation } = useNavigationContext();
    const anchorIdSoFar = getAnchorId(anchorIdParts);

    useEffect(() => {
        if (shouldSelectError(navigation, anchorIdSoFar)) {
            select();
        }
    }, [navigation, anchorIdSoFar, select]);

    return (
        <button
            className={classNames(
                "space flex hover:bg-gray-100/90 dark:hover:bg-background-primary-dark flex-col items-start px-3",
                {
                    "bg-gray-100/90 dark:bg-background-primary-dark": isSelected,
                },
                {
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
                <div className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">{error.statusCode}</div>
                {error.name != null ? <div className="t-muted text-xs">{toTitleCase(error.name)}</div> : null}
            </div>

            {isSelected && error.type != null && (
                <div className="w-full pb-3">
                    <div className="t-muted mt-3 w-full text-start text-sm font-light leading-7">
                        This error returns{" "}
                        {visitDiscriminatedUnion(error.type, "type")._visit<string | JSX.Element>({
                            alias: (type) => (
                                <>
                                    <TypeShorthand type={type.value} plural={false} withArticle />.
                                </>
                            ),
                            object: () => "an object.",
                            discriminatedUnion: () => "a union.",
                            undiscriminatedUnion: () => "a union.",
                            enum: () => "an enum.",
                            _other: () => "unknown.",
                        })}
                    </div>
                    {error.type.type === "alias" ? (
                        <div className="w-full text-start">
                            <TypeReferenceDefinitions
                                isCollapsible
                                isError
                                type={error.type.value}
                                onHoverProperty={onHoverProperty}
                                anchorIdParts={anchorIdParts}
                            />
                        </div>
                    ) : error.type.type === "object" ? (
                        <div className="mt-2.5 w-full text-start">
                            <TypeDefinitionContextProvider onHoverProperty={onHoverProperty}>
                                <InternalTypeDefinitionError
                                    isCollapsible
                                    typeShape={error.type}
                                    anchorIdParts={anchorIdParts}
                                />
                            </TypeDefinitionContextProvider>
                        </div>
                    ) : null}
                </div>
            )}
        </button>
    );
});
