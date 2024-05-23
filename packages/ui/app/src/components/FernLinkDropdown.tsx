import { FernDropdown } from "@fern-ui/components";
import { PropsWithChildren, ReactElement } from "react";
import { FernLink } from "./FernLink";

export function FernLinkDropdown(props: PropsWithChildren<FernDropdown.Props>): ReactElement {
    return <FernDropdown {...props} dropdownMenuElement={<FernLink href={""} />} />;
}
