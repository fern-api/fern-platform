import { useBooleanState } from "@fern-ui/react-commons";
import { Cross2Icon } from "@radix-ui/react-icons";
import classNames from "classnames";
import React, { ReactElement, useEffect, useState } from "react";
import { Search } from "react-feather";
import { Chip } from "../../../components/Chip";
import { FernButton } from "../../../components/FernButton";
import { FernCollapse } from "../../../components/FernCollapse";
import { FernInput } from "../../../components/FernInput";
import { FernTooltipProvider } from "../../../components/FernTooltip";
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
                    <FernTooltipProvider>
                        <div className="t-muted flex flex-row flex-wrap gap-2">
                            {elements.map((item) => (
                                <Chip key={item.key} name={item.props.name} description={item.props.description} />
                            ))}
                        </div>
                    </FernTooltipProvider>
                </div>
            ) : (
                <div
                    className={classNames("border-default flex flex-col overflow-visible rounded border", {
                        "w-full": !isCollapsed,
                        "w-fit": isCollapsed,
                    })}
                    // ref={ref}
                >
                    <div
                        className={classNames(
                            "flex gap-1 items-center border-b hover:bg-tag-default focus-within:bg-tag-default cursor-pointer px-2 py-1 transition t-muted",
                            {
                                "border-transparent": isCollapsed,
                                "border-default": !isCollapsed,
                            },
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleIsCollapsed();
                            shouldAutoFocus.setTrue();
                        }}
                    >
                        {isCollapsed && (
                            <Cross2Icon
                                className={classNames("transition", {
                                    "rotate-45": isCollapsed,
                                })}
                            />
                        )}

                        <div className="w-full select-none whitespace-nowrap" data-show-text={showText}>
                            {isCollapsed ? (
                                showText
                            ) : (
                                <div className="flex flex-row items-center justify-between gap-1 py-1">
                                    <FernInput
                                        autoFocus={shouldAutoFocus.value}
                                        type="search"
                                        placeholder="Search..."
                                        value={searchInput}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        onValueChange={setSearchInput}
                                        className="w-full"
                                        style={{ flex: 1, backgroundColor: "transparent" }}
                                        leftIcon={<Search className="t-muted size-4" />}
                                        rightElement={
                                            <FernButton
                                                icon={
                                                    <Cross2Icon
                                                        className={classNames("transition", {
                                                            "rotate-45": isCollapsed,
                                                        })}
                                                    />
                                                }
                                                variant="minimal"
                                            />
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <FernCollapse isOpen={!isCollapsed}>
                        <TypeDefinitionContext.Provider value={collapsibleContentContextValue}>
                            <EnumDefinitionDetails elements={elements} searchInput={searchInput} />
                        </TypeDefinitionContext.Provider>
                    </FernCollapse>
                </div>
            )}
        </>
    );
};
