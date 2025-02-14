export function HeaderContainer({
  header,
  className,
  tabs,
}: {
  header: React.ReactNode;
  className?: string;
  tabs?: React.ReactNode;
}) {
  return (
    <header id="fern-header" className={className}>
      <div className="fern-header-container width-before-scroll-bar">
        <div className="fern-header">{header}</div>
        {tabs}
      </div>
    </header>
  );
}
