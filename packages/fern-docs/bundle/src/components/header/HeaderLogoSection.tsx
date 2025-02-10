import { ReactElement } from "react";

import { useAtomValue } from "jotai";

import { DOCS_ATOM, LOGO_ATOM, LOGO_TEXT_ATOM, VERSIONS_ATOM } from "../atoms";
import { Logo } from "../logo";
import { VersionDropdown } from "./VersionDropdown";

export function HeaderLogoSection(): ReactElement<any> {
  const title = useAtomValue(DOCS_ATOM).title ?? "Logo";
  const { light, dark, height, href } = useAtomValue(LOGO_ATOM);
  const versions = useAtomValue(VERSIONS_ATOM);
  const logoText = useAtomValue(LOGO_TEXT_ATOM);

  return (
    <div className="relative flex h-full min-w-fit flex-1 shrink-0 items-center gap-2 py-1">
      <div className="flex items-center gap-2">
        <Logo
          className="shrink-0"
          alt={title}
          logo={{
            light,
            dark,
            height,
            href,
          }}
        />
        {logoText != null && logoText.length > 0 && (
          <span className="font-heading text-accent ml-1 text-[1.5rem] font-light lowercase">
            {logoText}
          </span>
        )}
        {versions.length > 1 && (
          <div>
            <VersionDropdown />
          </div>
        )}
      </div>
    </div>
  );
}
