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
import { ThemeButton } from "./ThemeButton";
import { User } from "./User";

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
    const { navbarLinks, colorsV3 } = docsDefinition.config;

    const navbarLinksSection = (
        <div className="hidden items-center space-x-5 lg:flex lg:space-x-8">
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
        <nav
            aria-label="primary"
            className={classNames(
                "flex justify-between items-center shrink-0 px-6 sm:px-8",
                // this matches with the calc() in the EndpointContent examples section
                "h-full",
                className
            )}
            ref={ref}
        >
            <HeaderLogoSection />

            <div className="-mr-2 ml-auto flex items-center space-x-0 md:mr-0 lg:space-x-4">
                {navbarLinksSection}

                <User />

                {colorsV3.type === "darkAndLight" && (
                    <>
                        <div className="dark:bg-border-default-dark bg-border-default-light hidden w-px self-stretch lg:flex" />
                        <ThemeButton className="hidden lg:flex" />
                    </>
                )}

                {searchService.isAvailable && (
                    <button
                        onClick={openSearchDialog}
                        className="text-intent-default dark:hover:text-text-primary-dark hover:text-text-primary-light flex h-[44px] w-[44px] items-center justify-center transition lg:hidden"
                    >
                        <SearchIcon className="h-5 w-5" />
                    </button>
                )}

                <button
                    onClick={isMobileSidebarOpen ? closeMobileSidebar : openMobileSidebar}
                    className={classNames(
                        "text-intent-default dark:hover:text-text-primary-dark hover:text-text-primary-light flex h-[44px] w-[44px] items-center justify-center transition lg:hidden rounded-lg",
                        {
                            "!text-accent-primary !dark:text-accent-primary-dark bg-tag-primary dark:bg-tag-primary-dark ring-inset ring-1 ring-border-primary dark:ring-border-primary-dark":
                                isMobileSidebarOpen,
                        }
                    )}
                >
                    {isMobileSidebarOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                </button>
            </div>
        </nav>
    );
});

export const Header = memo(UnmemoizedHeader);
