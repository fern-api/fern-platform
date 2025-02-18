interface CustomLayoutProps {
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function CustomLayout({ children, footer }: CustomLayoutProps) {
  return (
    <main className="width-before-scroll-bar w-screen">
      {children}
      {footer}
    </main>
  );
}
