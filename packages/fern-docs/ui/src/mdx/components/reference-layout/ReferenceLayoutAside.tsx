import { ReactElement, ReactNode } from "react";

export function ReferenceLayoutAside({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <aside className="relative max-md:-order-1">
      <div className="md:top-header-offset md:sticky md:py-8 md:-my-8 prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 break-words">
        {children}
      </div>
    </aside>
  );
}
