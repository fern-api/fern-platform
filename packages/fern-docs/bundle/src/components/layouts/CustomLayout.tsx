import { HideAsides, SetLayout } from "@/state/layout";

interface CustomLayoutProps {
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function CustomLayout({ children, footer }: CustomLayoutProps) {
  return (
    <div className="width-before-scroll-bar w-screen">
      <SetLayout value="custom" />
      <HideAsides force />
      {children}
      {footer}
    </div>
  );
}
