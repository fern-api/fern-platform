import { ReactElement, ReactNode } from "react";

export function ReferenceLayoutAside({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <aside className="relative max-md:-order-1">
      <div className="prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 md:top-header-offset break-words md:sticky md:-my-8 md:py-8">
        {children}
      </div>
    </aside>
  );
}
