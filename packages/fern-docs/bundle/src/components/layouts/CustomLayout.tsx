import { BuiltWithFern } from "@/components/built-with-fern";

interface CustomLayoutProps {
  children: React.ReactNode;
}

export function CustomLayout({ children }: CustomLayoutProps) {
  return (
    <article>
      {children}

      <BuiltWithFern className="mx-auto my-8 w-fit" />
    </article>
  );
}
