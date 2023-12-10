import { DocsV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import { forwardRef, memo, PropsWithChildren } from "react";
import { MenuIcon } from "../commons/icons/MenuIcon";
import { SearchIcon } from "../commons/icons/SearchIcon";
import { XIcon } from "../commons/icons/XIcon";
import { SearchService } from "../services/useSearchService";
import { HeaderLogoSection } from "./HeaderLogoSection";
import { HeaderPrimaryLink } from "./HeaderPrimaryLink";
import { HeaderSecondaryLink } from "./HeaderSecondaryLink";

export declare namespace Header {
    export interface Props {
        className?: string;
        docsDefinition: DocsV1Read.DocsDefinition;
        openSearchDialog: () => void;
        isMobileSidebarOpen: boolean;
        openMobileSidebar: () => void;
        closeMobileSidebar: () => void;
        searchService: SearchService;
    }
}

const UnmemoizedHeader = forwardRef<HTMLDivElement, PropsWithChildren<Header.Props>>(function Header(
    {
        className,
        docsDefinition,
        openSearchDialog,
        isMobileSidebarOpen,
        openMobileSidebar,
        closeMobileSidebar,
        searchService,
    },
    ref
) {
    const { navbarLinks } = docsDefinition.config;

    const navbarLinksSection = (
        <div className="hidden items-center space-x-5 md:flex md:space-x-8">
            {navbarLinks.map((navbarLink, idx) =>
                visitDiscriminatedUnion(navbarLink, "type")._visit({
                    primary: (navbarLink) => <HeaderPrimaryLink key={idx} navbarLink={navbarLink} />,
                    secondary: (navbarLink) => <HeaderSecondaryLink key={idx} navbarLink={navbarLink} />,
                    _other: () => null,
                })
            )}
        </div>
    );

    return (
        <div
            className={classNames(
                "flex justify-between items-center shrink-0 px-8",
                // this matches with the calc() in the EndpointContent examples section
                "h-full",
                className
            )}
            ref={ref}
        >
            <HeaderLogoSection />

            <div className="ml-auto flex items-center space-x-4">
                {navbarLinksSection}

                {/* {colorsV3.type === "darkAndLight" && (
                    <>
                        <div className="dark:bg-border-default-dark bg-border-default-light hidden w-px self-stretch md:flex" />
                        <ThemeButton className="hidden md:flex" />
                    </>
                )} */}

                {searchService.isAvailable && (
                    <button
                        onClick={openSearchDialog}
                        className="text-intent-default dark:hover:text-text-primary-dark hover:text-text-primary-light flex transition md:hidden"
                    >
                        <SearchIcon className="h-4 w-4" />
                    </button>
                )}

                <button
                    onClick={isMobileSidebarOpen ? closeMobileSidebar : openMobileSidebar}
                    className="text-intent-default dark:hover:text-text-primary-dark hover:text-text-primary-light flex transition md:hidden"
                >
                    {isMobileSidebarOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );
});

export const Header = memo(UnmemoizedHeader);
