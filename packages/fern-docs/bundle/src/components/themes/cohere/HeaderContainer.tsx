import { ReactElement, memo } from "react";

import { SearchV2Trigger } from "@/components/search-trigger";

import { Header } from "../../header/Header";
import { HeaderTabs } from "../../header/HeaderTabs";

export const HeaderContainer = memo(function HeaderContainer({
  className,
  showHeaderTabs,
  showSearchBar,
}: {
  className?: string;
  showHeaderTabs: boolean;
  showSearchBar: boolean;
}): ReactElement<any> {
  return (
    <header id="fern-header" className={className}>
      <div className="fern-header-container width-before-scroll-bar">
        <div className="fern-header">
          <Header className="max-w-page-width mx-auto" />
        </div>
        {showHeaderTabs && (
          <nav aria-label="tabs" className="fern-header-tabs">
            <HeaderTabs />

            {showSearchBar && (
              <div className="w-96 shrink">
                <SearchV2Trigger />
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
});
