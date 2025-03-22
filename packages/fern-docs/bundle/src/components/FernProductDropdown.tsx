import { PropsWithChildren, ReactElement } from "react";

import { FernProductDropdown as ProductDropdown } from "@fern-docs/components";

import { FernLink } from "./FernLink";

export function FernProductDropdown(
  props: PropsWithChildren<ProductDropdown.Props>
): ReactElement<any> {
  // dropdownMenuElement is cloned in FernDropdown and href is passed to the cloned element
  // TODO: make this more composeable
  return (
    <ProductDropdown
      {...props}
      dropdownMenuElement={<FernLink href={""} scroll={true} />}
    />
  );
}
