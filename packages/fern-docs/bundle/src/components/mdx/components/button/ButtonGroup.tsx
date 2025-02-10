import { ComponentProps, ReactElement } from "react";

import clsx from "clsx";

import { FernButtonGroup } from "@fern-docs/components";

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
