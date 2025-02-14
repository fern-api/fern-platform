import { ComponentProps, ReactElement } from "react";

import { cn } from "@fern-docs/components";
import { FernButtonGroup } from "@fern-docs/components";

export function ButtonGroup(
  props: ComponentProps<typeof FernButtonGroup>
): ReactElement<any> {
  return (
    <FernButtonGroup
      {...props}
      className={cn(props.className, "m-mdx flex-wrap")}
    />
  );
}
