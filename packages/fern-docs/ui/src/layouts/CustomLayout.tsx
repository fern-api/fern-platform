import { ReactElement, ReactNode } from "react";
import { BuiltWithFern } from "../sidebar/BuiltWithFern";

interface CustomLayoutProps {
  children: ReactNode;
}

export function CustomLayout({ children }: CustomLayoutProps): ReactElement {
  return (
    <main>
      {children}

      <div className="mx-auto my-8 w-fit">
        <BuiltWithFern />
      </div>
    </main>
  );
}
