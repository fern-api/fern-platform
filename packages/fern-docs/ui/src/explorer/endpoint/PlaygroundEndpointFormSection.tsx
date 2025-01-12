import { FernCard } from "@fern-docs/components";
import { PropsWithChildren, ReactElement, ReactNode } from "react";

interface ExplorerEndpointFormSection {
  title?: ReactNode;
  ignoreHeaders: boolean | undefined;
}

export function ExplorerEndpointFormSection({
  title,
  ignoreHeaders,
  children,
}: PropsWithChildren<ExplorerEndpointFormSection>): ReactElement | null {
  if (children == null) {
    return null;
  }
  return (
    <section>
      {!ignoreHeaders && title && (
        <div className="mb-4 px-4">
          {typeof title === "string" ? (
            <h5 className="t-muted m-0">{title}</h5>
          ) : (
            title
          )}
        </div>
      )}
      <FernCard className="rounded-xl p-4 shadow-sm">{children}</FernCard>
    </section>
  );
}
