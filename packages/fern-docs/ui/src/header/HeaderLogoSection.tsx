import { useAtomValue } from "jotai";
import { PropsWithChildren, ReactElement } from "react";
import { LOGO_HREF_ATOM, LOGO_TEXT_ATOM } from "../atoms";
import { FernLink } from "../components/FernLink";
import { HeaderLogoImage } from "./HeaderLogoImage";
import { NavigationControls } from "./NavigationControls";

export function HeaderLogoSection(): ReactElement {
  const logoHref = useAtomValue(LOGO_HREF_ATOM);
  const logoText = useAtomValue(LOGO_TEXT_ATOM);

  return (
    <div className="relative flex h-full min-w-fit flex-1 shrink-0 items-center gap-2 py-1">
      <div className="flex items-center gap-1">
        <HeaderLogoContainer href={logoHref}>
          <HeaderLogoImage />
          {logoText != null && logoText.length > 0 && (
            <span className="font-heading text-accent ml-1 text-[1.5rem] font-light lowercase">
              {logoText}
            </span>
          )}
        </HeaderLogoContainer>
        <NavigationControls />
      </div>
    </div>
  );
}

function HeaderLogoContainer({
  children,
  href,
}: PropsWithChildren<{ href: string | undefined }>): ReactElement {
  const container = <div className="fern-logo-container">{children}</div>;
  return href != null ? (
    <FernLink href={href}>{container}</FernLink>
  ) : (
    container
  );
}
