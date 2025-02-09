import { ReactElement, ReactNode } from "react";

export function ReferenceLayoutMain({
  children,
}: {
  children: ReactNode;
}): ReactElement<any> {
  return (
    <div className="prose dark:prose-invert prose-h1:mt-[1.5em] first:prose-h1:mt-0 break-words">
      {children}
    </div>
  );
}
