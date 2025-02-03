import { useAtomValue } from "jotai";
import { PropsWithChildren, ReactElement } from "react";
import { FernLink } from "../../components/link";
import { LOGO_ATOM, LOGO_TEXT_ATOM, VERSIONS_ATOM } from "../atoms";
import { HeaderLogoImage } from "./HeaderLogoImage";
import { VersionDropdown } from "./VersionDropdown";

export function HeaderLogoSection(): ReactElement {
  const logoHref = useAtomValue(LOGO_ATOM).href;
  const versions = useAtomValue(VERSIONS_ATOM);
  const logoText = useAtomValue(LOGO_TEXT_ATOM);

  return (
    <div className="relative flex h-full min-w-fit flex-1 shrink-0 items-center gap-2 py-1">
      <div className="flex items-center gap-2">
        <HeaderLogoContainer href={logoHref}>
          <HeaderLogoImage />
          {logoText != null && logoText.length > 0 && (
            <span className="font-heading text-accent ml-1 text-[1.5rem] font-light lowercase">
              {logoText}
            </span>
          )}
        </HeaderLogoContainer>
        {versions.length > 1 && (
          <div>
            <VersionDropdown />
          </div>
        )}
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
