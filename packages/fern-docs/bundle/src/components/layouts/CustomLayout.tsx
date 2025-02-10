import { ReactElement, ReactNode } from "react";

import { BuiltWithFern } from "@/components/built-with-fern";

interface CustomLayoutProps {
  children: ReactNode;
}

export function CustomLayout({
  children,
}: CustomLayoutProps): ReactElement<any> {
  return (
    <main>
      {children}

      <BuiltWithFern className="mx-auto my-8 w-fit" />
    </main>
  );
}
