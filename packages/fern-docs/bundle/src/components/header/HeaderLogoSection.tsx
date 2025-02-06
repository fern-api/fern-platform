import { useAtomValue } from "jotai";
import { ReactElement } from "react";
import { DOCS_ATOM, LOGO_ATOM, LOGO_TEXT_ATOM, VERSIONS_ATOM } from "../atoms";
import { HeaderLogoContainer, HeaderLogoImage } from "./HeaderLogoImage";
import { VersionDropdown } from "./VersionDropdown";

export function HeaderLogoSection(): ReactElement {
  const title = useAtomValue(DOCS_ATOM).title ?? "Logo";
  const { light, dark, height, href } = useAtomValue(LOGO_ATOM);
  const versions = useAtomValue(VERSIONS_ATOM);
  const logoText = useAtomValue(LOGO_TEXT_ATOM);

  return (
    <div className="relative flex h-full min-w-fit flex-1 shrink-0 items-center gap-2 py-1">
      <div className="flex items-center gap-2">
        <HeaderLogoContainer href={href}>
          <HeaderLogoImage
            light={light}
            dark={dark}
            alt={title}
            height={height}
          />
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
