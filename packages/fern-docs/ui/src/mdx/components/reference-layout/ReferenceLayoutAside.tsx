import { ReactElement, ReactNode } from "react";

export function ReferenceLayoutAside({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <aside className="relative max-md:-order-1">
      <div className="prose break-words dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 md:sticky md:top-header-offset md:-my-8 md:py-8">
        {children}
      </div>
    </aside>
  );
}
