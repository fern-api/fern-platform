import { PropsWithChildren, ReactElement, ReactNode } from "react";

import { FernCard } from "@fern-docs/components";

interface PlaygroundEndpointFormSection {
  title?: ReactNode;
  ignoreHeaders: boolean | undefined;
}

export function PlaygroundEndpointFormSection({
  title,
  ignoreHeaders,
  children,
}: PropsWithChildren<PlaygroundEndpointFormSection>): ReactElement<any> | null {
  if (children == null) {
    return null;
  }
  return (
    <section>
      {!ignoreHeaders && title && (
        <div className="mb-4 px-4">
          {typeof title === "string" ? (
            <h5 className="text-(color:--grayscale-a11) m-0">{title}</h5>
          ) : (
            title
          )}
        </div>
      )}
      <FernCard className="rounded-3 p-4 shadow-sm">{children}</FernCard>
    </section>
  );
}
