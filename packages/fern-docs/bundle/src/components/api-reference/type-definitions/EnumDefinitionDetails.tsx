"use client";

import React from "react";

import { Empty } from "@fern-docs/components";

export interface EnumDefinitionDetailsProps {
  elements: {
    element: React.ReactNode;
    searchableString: string;
  }[];
  searchInput: string;
}

export function EnumDefinitionDetails({
  elements,
  searchInput,
}: EnumDefinitionDetailsProps) {
  console.log(elements);
  const [filteredElements, setFilteredElements] = React.useState<
    React.ReactNode[]
  >(() => elements.map((element) => element.element));

  React.useEffect(() => {
    setFilteredElements(
      elements
        .filter((element) => {
          if (searchInput.trim() === "") {
            return true;
          }

          return element.searchableString
            .toLowerCase()
            .includes(searchInput.toLowerCase());
        })
        .map((element) => element.element)
    );
  }, [elements, searchInput]);

  // use 140px to decapitate overflowing enum values and indicate scrollability
  return (
    <div className="max-h-[140px] gap-2 overflow-y-auto p-2">
      {filteredElements.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {filteredElements.map((element, key) => (
            <React.Fragment key={key}>{element}</React.Fragment>
          ))}
        </div>
      ) : (
        <Empty name="No results" description="No enum values found" />
      )}
    </div>
  );
}
