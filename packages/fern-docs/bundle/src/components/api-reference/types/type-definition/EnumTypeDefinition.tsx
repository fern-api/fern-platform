"use client";

import React, { useState } from "react";

import { Search, Xmark } from "iconoir-react";

import { cn } from "@fern-docs/components";
import {
  FernButton,
  FernInput,
  FernTooltipProvider,
} from "@fern-docs/components";
import { useBooleanState } from "@fern-ui/react-commons";

import { EnumDefinitionDetails } from "./EnumDefinitionDetails";
import { FernCollapseWithButton } from "./FernCollapseWithButton";

export type Ref = React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;

export function EnumTypeDefinition({
  elements,
  showText,
}: {
  elements: React.ReactNode[];
  showText: string;
}) {
  const collapse = useBooleanState(false);
  const autofocus = useBooleanState(false);
  const [searchInput, setSearchInput] = useState("");
  const hideText = (
    <div className="-mx-1 py-1">
      <FernInput
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
              <Xmark
                className={cn("transition", {
                  "rotate-45": collapse.value,
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
          isOpen={collapse.value}
          toggleIsOpen={collapse.toggleValue}
          showText={showText}
          hideText={hideText}
          buttonProps={{
            className: !collapse.value ? "multiline" : undefined,
            disableAutomaticTooltip: true,
            onClickCapture: () => {
              if (collapse.value) {
                autofocus.setTrue();
              }
            },
          }}
        >
          <EnumDefinitionDetails
            elements={elements}
            searchInput={searchInput}
          />
        </FernCollapseWithButton>
      )}
    </>
  );
}
