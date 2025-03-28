import { PropsWithChildren, ReactElement } from "react";

import { FernProductDropdown as ProductDropdown } from "@fern-docs/components";

import { FernLink } from "./FernLink";

export function FernProductDropdown(
  props: PropsWithChildren<ProductDropdown.Props>
): ReactElement<any> {
  return (
    <ProductDropdown
      {...props}
      dropdownMenuElement={<FernLink href={""} scroll={true} />}
    />
  );
}
