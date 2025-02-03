import {
  FernButton,
  FernInput,
  FernTooltipProvider,
} from "@fern-docs/components";
import { useBooleanState } from "@fern-ui/react-commons";
import cn from "clsx";
import { Search, X } from "lucide-react";
import React, { ReactElement, useState } from "react";
import {
  TypeDefinitionContext,
  TypeDefinitionContextValue,
} from "../context/TypeDefinitionContext";
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
              <X
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
            <span className="inline-flex flex-wrap gap-2">{elements}</span>
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
          <TypeDefinitionContext.Provider
            value={collapsibleContentContextValue}
          >
            <EnumDefinitionDetails
              elements={elements}
              searchInput={searchInput}
            />
          </TypeDefinitionContext.Provider>
        </FernCollapseWithButton>
      )}
    </>
  );
};
