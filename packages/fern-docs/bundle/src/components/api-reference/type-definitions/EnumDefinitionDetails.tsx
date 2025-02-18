"use client";

import React from "react";

import { isPlainObject } from "@fern-api/ui-core-utils";
import { Empty } from "@fern-docs/components";

export interface EnumDefinitionDetailsProps {
  elements: React.ReactNode[];
  searchInput: string;
}

export function EnumDefinitionDetails({
  elements,
  searchInput,
}: EnumDefinitionDetailsProps) {
  const [filteredElements, setFilteredElements] = React.useState<
    React.ReactNode[]
  >([]);

  React.useEffect(() => {
    const temp = elements.filter(React.isValidElement).filter((element) => {
      if (!isPlainObject(element.props)) {
        return false;
      }
      return (
        (typeof element.props.name === "string" &&
          element.props.name
            .toLowerCase()
            .includes(searchInput.toLowerCase())) ||
        (typeof element.props.description === "string" &&
          element.props.description
            .toLowerCase()
            .includes(searchInput.toLowerCase()))
      );
    });
    setFilteredElements(temp);
  }, [elements, searchInput]);

  // use 140px to decapitate overflowing enum values and indicate scrollability
  return (
    <div className="max-h-[140px] gap-2 overflow-y-auto p-2">
      {filteredElements.length > 0 ? (
        <div className="flex flex-wrap gap-2">{filteredElements}</div>
      ) : (
        <Empty name="No results" description="No enum values found" />
      )}
    </div>
  );
}
