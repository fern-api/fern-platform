import { BuiltWithFern } from "@/components/built-with-fern";
import { SetLayout } from "@/state/layout";

interface CustomLayoutProps {
  children: React.ReactNode;
}

export function CustomLayout({ children }: CustomLayoutProps) {
  return (
    <main className="width-before-scroll-bar w-screen">
      <SetLayout value="custom" />
      {children}
      <BuiltWithFern className="mx-auto my-8 w-fit" />
    </main>
  );
}
