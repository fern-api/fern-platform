import { FernButtonGroup } from "@fern-docs/components";
import clsx from "clsx";
import { ComponentProps, ReactElement } from "react";

export function ButtonGroup(
  props: ComponentProps<typeof FernButtonGroup>
): ReactElement<any> {
  return (
    <FernButtonGroup
      {...props}
      className={clsx(props.className, "m-mdx flex-wrap")}
    />
  );
}
