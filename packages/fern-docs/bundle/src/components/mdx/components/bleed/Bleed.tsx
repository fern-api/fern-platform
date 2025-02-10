import { PropsWithChildren, ReactElement } from "react";

import cn from "clsx";

interface BleedProps {
  full?: boolean;
}

export function Bleed({
  full = false,
  children,
}: PropsWithChildren<BleedProps>): ReactElement<any> {
  return (
    <div
      className={cn(
        "fern-bleed relative mt-6 lg:-mr-16 xl:-mx-16 2xl:-mx-24",
        full && [
          "ltr:xl:ml-[calc(50%-50vw+16rem)] ltr:xl:mr-[calc(50%-50vw)]",
          "rtl:xl:ml-[calc(50%-50vw)] rtl:xl:mr-[calc(50%-50vw+16rem)]",
        ]
      )}
    >
      {children}
    </div>
  );
}
