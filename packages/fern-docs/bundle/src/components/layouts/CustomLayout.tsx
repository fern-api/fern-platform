import { BuiltWithFern } from "@/components/built-with-fern";
import { ReactElement, ReactNode } from "react";

interface CustomLayoutProps {
  children: ReactNode;
}

export function CustomLayout({ children }: CustomLayoutProps): ReactElement<any> {
  return (
    <main>
      {children}

      <BuiltWithFern className="mx-auto my-8 w-fit" />
    </main>
  );
}
