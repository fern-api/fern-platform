import { Collapse, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useBooleanState } from "@fern-ui/react-commons";
import classNames from "classnames";
import React, { ReactElement, useEffect, useState } from "react";
import { Chip } from "../../../components/Chip";
import { SearchInput } from "../../../components/SearchInput";
import { useNavigationContext } from "../../../navigation-context";
import { TypeDefinitionContext, TypeDefinitionContextValue } from "../context/TypeDefinitionContext";
import { EnumDefinitionDetails } from "./EnumDefinitionDetails";

type EnumTypeDefinitionProps = {
    elements: ReactElement[];
    isCollapsed: boolean;
    toggleIsCollapsed: () => void;
    collapsibleContentContextValue: () => TypeDefinitionContextValue;
    showText: string;
};

export type Ref = React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;

export const EnumTypeDefinition = ({
    elements,
    isCollapsed,
    toggleIsCollapsed,
    collapsibleContentContextValue,
    showText,
}: EnumTypeDefinitionProps): ReactElement => {
    const { hydrated, justNavigated } = useNavigationContext();
    const [searchInput, setSearchInput] = useState("");
    const shouldAutoFocus = useBooleanState(false);

    useEffect(() => {
        if (isCollapsed) {
            shouldAutoFocus.setFalse();
        }
    }, [isCollapsed, shouldAutoFocus]);

    return (
        <>
            {elements.length < 4 ? (
                <div className="t-muted flex flex-row gap-2 ">
                    <div className="shrink-0 text-sm"> Allowed values: </div>
                    <div className="t-muted flex flex-row flex-wrap gap-2">
                        {elements.map((item) => (
                            <Chip key={item.key} name={item.props.name} description={item.props.description} />
                        ))}
                    </div>
                </div>
            ) : (
                <div
                    className={classNames(
                        "border-border-default-light dark:border-border-default-dark flex flex-col overflow-visible rounded border",
                        {
                            "w-full": !isCollapsed,
                            "w-fit": isCollapsed,
                        },
                    )}
                    // ref={ref}
                >
                    <div
                        className={classNames(
                            "flex gap-1 items-center border-b hover:bg-tag-default-light dark:hover:bg-tag-default-dark cursor-pointer px-2 py-1 transition t-muted",
                            {
                                "border-transparent": isCollapsed,
                                "border-border-default-light dark:border-border-default-dark": !isCollapsed,
                            },
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleIsCollapsed();
                            shouldAutoFocus.setTrue();
                        }}
                    >
                        {isCollapsed && (
                            <Icon
                                className={classNames("transition", {
                                    "rotate-45": isCollapsed,
                                })}
                                icon={IconNames.CROSS}
                            />
                        )}

                        <div className="w-full select-none whitespace-nowrap" data-show-text={showText}>
                            {isCollapsed ? (
                                showText
                            ) : (
                                <div className="flex flex-row items-center justify-between">
                                    <SearchInput
                                        searchInput={searchInput}
                                        handleSearchInput={setSearchInput}
                                        border={false}
                                        clear={false}
                                        autofocus={shouldAutoFocus.value}
                                    />

                                    <Icon
                                        className={classNames("transition", {
                                            "rotate-45": isCollapsed,
                                        })}
                                        icon={IconNames.CROSS}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <Collapse
                        isOpen={!isCollapsed}
                        keepChildrenMounted
                        transitionDuration={!hydrated || justNavigated ? 0 : 200}
                        className={classNames({ "w-0": isCollapsed })}
                    >
                        <TypeDefinitionContext.Provider value={collapsibleContentContextValue}>
                            <EnumDefinitionDetails elements={elements} searchInput={searchInput} />
                        </TypeDefinitionContext.Provider>
                    </Collapse>
                </div>
            )}
        </>
    );
};
