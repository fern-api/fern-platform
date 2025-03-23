"use client";

import { FernDropdown } from "./FernDropdown";
import { cn } from "./cn";

/**
 * This component is used to render a product option in the dropdown. Since this could be used
 * within different dropdowns, we separate the logic for rendering the item from the dropdown into
 * its own component.
 *
 * @param option: the product to be rendered
 * @param highlighted: whether the item is highlighted
 * @returns the rendered product item
 */
export function FernProductDropdownItem({
  option,
  highlighted,
}: {
  option: FernDropdown.ProductOption;
  highlighted: boolean;
}) {
  return (
    <div
      className={cn("fern-product-dropdown-item", option.className)}
      data-highlighted={highlighted}
    >
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
