"use client";

import { FernDropdown } from "./FernDropdown";
import { cn } from "./cn";

export function FernProductDropdownItem({
  option,
}: {
  option: FernDropdown.ProductOption;
}) {
  return (
    <div className={cn("fern-product-dropdown-item", option.className)}>
      <div className="fern-product-dropdown-item-icon">{option.icon}</div>

      <div className="flex flex-col">
        <p className="text-sm font-medium leading-tight">{option.title}</p>
        {option.subtitle ? (
          <p className="text-(color:--grayscale-a9) text-sm leading-tight">
            {option.subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
