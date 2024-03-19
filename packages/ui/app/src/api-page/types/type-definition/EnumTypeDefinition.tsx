import { useBooleanState } from "@fern-ui/react-commons";
import { Cross2Icon } from "@radix-ui/react-icons";
import cn from "clsx";
import React, { ReactElement, useState } from "react";
import { Search } from "react-feather";
import { Chip } from "../../../components/Chip";
import { FernButton } from "../../../components/FernButton";
import { FernInput } from "../../../components/FernInput";
import { FernTooltipProvider } from "../../../components/FernTooltip";
import { TypeDefinitionContext, TypeDefinitionContextValue } from "../context/TypeDefinitionContext";
import { EnumDefinitionDetails } from "./EnumDefinitionDetails";
import { FernCollapseWithButton } from "./FernCollapseWithButton";

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
    const autofocus = useBooleanState(false);
    const [searchInput, setSearchInput] = useState("");
    const hideText = (
        <div className="-mx-1 py-1">
            <FernInput
                autoFocus={autofocus.value}
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
                                className={cn("transition", {
                                    "rotate-45": isCollapsed,
                                })}
                            />
                        }
                        variant="minimal"
                    />
                }
            />
        </div>
    );

    return (
        <>
            {elements.length < 6 ? (
                <div className="t-muted flex items-baseline gap-2">
                    <span className="shrink-0 text-sm"> Allowed values: </span>
                    <FernTooltipProvider>
                        <span className="inline-flex flex-wrap gap-2">
                            {elements.map((item) => (
                                <Chip key={item.key} name={item.props.name} description={item.props.description} />
                            ))}
                        </span>
                    </FernTooltipProvider>
                </div>
            ) : (
                <FernCollapseWithButton
                    isOpen={!isCollapsed}
                    toggleIsOpen={toggleIsCollapsed}
                    showText={showText}
                    hideText={hideText}
                    buttonProps={{
                        className: !isCollapsed ? "multiline" : undefined,
                        disableAutomaticTooltip: true,
                        onClickCapture: () => {
                            if (isCollapsed) {
                                autofocus.setTrue();
                            }
                        },
                    }}
                    onClose={autofocus.setFalse}
                >
                    <TypeDefinitionContext.Provider value={collapsibleContentContextValue}>
                        <EnumDefinitionDetails elements={elements} searchInput={searchInput} />
                    </TypeDefinitionContext.Provider>
                </FernCollapseWithButton>
            )}
        </>
    );
};
