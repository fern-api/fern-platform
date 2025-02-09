import { FernDropdown } from "@fern-docs/components";
import { PropsWithChildren, ReactElement } from "react";
import { FernLink } from "./FernLink";

export function FernLinkDropdown(
  props: PropsWithChildren<FernDropdown.Props>
): ReactElement<any> {
  // dropdownMenuElement is cloned in FernDropdown and href is passed to the cloned element
  // TODO: make this more composeable
  return (
    <FernDropdown {...props} dropdownMenuElement={<FernLink href={""} />} />
  );
}
