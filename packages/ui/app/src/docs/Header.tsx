import { DocsV1Read } from "@fern-api/fdr-sdk";
import { ArrowRightIcon, Cross1Icon, HamburgerMenuIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { CSSProperties, forwardRef, memo, PropsWithChildren } from "react";
import { FernButton, FernButtonGroup, FernLinkButton } from "../components/FernButton";
import { useSearchService } from "../services/useSearchService";
import { useIsSearchDialogOpen, useOpenSearchDialog } from "../sidebar/atom";
import { SidebarSearchBar } from "../sidebar/SidebarSearchBar";
import { SidebarNavigation } from "../sidebar/types";
import { HeaderLogoSection } from "./HeaderLogoSection";
import { ThemeButton } from "./ThemeButton";

export declare namespace Header {
    export interface Props {
        className?: string;
        style?: CSSProperties;
        config: DocsV1Read.DocsConfig;
        isMobileSidebarOpen: boolean;
        openMobileSidebar: () => void;
        closeMobileSidebar: () => void;
        showSearchBar?: boolean;
        navigation: SidebarNavigation;
    }
}

const UnmemoizedHeader = forwardRef<HTMLDivElement, PropsWithChildren<Header.Props>>(function Header(
    {
        className,
        style,
        config,
        isMobileSidebarOpen,
        openMobileSidebar,
        closeMobileSidebar,
        showSearchBar = true,
        navigation,
    },
    ref,
) {
    const openSearchDialog = useOpenSearchDialog();
    const isSearchDialogOpen = useIsSearchDialogOpen();
    const searchService = useSearchService();

    const { navbarLinks, colorsV3 } = config;
    const navbarLinksSection = (
        <div className="hidden lg:block">
            <FernButtonGroup>
                {navbarLinks?.map((navbarLink, idx) => (
                    <FernLinkButton
                        key={idx}
                        className="group cursor-pointer"
                        href={navbarLink.url}
                        target="_blank"
                        intent={navbarLink.type === "primary" || navbarLink.type === "filled" ? "primary" : "none"}
                        rightIcon={
                            navbarLink.type === "primary" ||
                            (navbarLink.type === "filled" && idx === navbarLinks.length - 1) ? (
                                <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
                            ) : undefined
                        }
                        variant={
                            navbarLink.type === "primary"
                                ? "outlined"
                                : navbarLink.type === "secondary"
                                  ? "minimal"
                                  : navbarLink.type
                        }
                    >
                        {navbarLink.text}
                    </FernLinkButton>
                ))}

                {colorsV3?.type === "darkAndLight" && <ThemeButton className="hidden lg:flex" />}
            </FernButtonGroup>
        </div>
    );

    return (
        <nav
            aria-label="primary"
            className={classNames(
                "flex justify-between items-center shrink-0 px-4 md:px-6 lg:px-8 shrink-0",
                // this matches with the calc() in the EndpointContent examples section
                "h-full",
                className,
            )}
            ref={ref}
            style={style}
        >
            <HeaderLogoSection
                config={config}
                versions={navigation.versions}
                currentVersionIndex={navigation.currentVersionIndex}
            />

            {showSearchBar && searchService.isAvailable && (
                <div
                    className={classNames("max-w-content-width w-full max-lg:hidden shrink min-w-0 mx-2", {
                        invisible: isSearchDialogOpen,
                    })}
                >
                    <SidebarSearchBar onClick={openSearchDialog} className="w-full" />
                </div>
            )}

            <div
                className={classNames("-mr-1 flex items-center justify-end space-x-0 md:mr-0 lg:space-x-4", {
                    "flex-1": showSearchBar && searchService.isAvailable,
                })}
            >
                {navbarLinksSection}

                <div className="flex lg:hidden">
                    {colorsV3?.type === "darkAndLight" && <ThemeButton size="large" />}

                    {searchService.isAvailable && (
                        <FernButton
                            onClickCapture={(e) => {
                                e.stopPropagation();
                                openSearchDialog();
                            }}
                            icon={<MagnifyingGlassIcon className="!size-5" />}
                            intent="none"
                            variant="minimal"
                            rounded={true}
                            size="large"
                            className="hidden sm:inline"
                        />
                    )}

                    <FernButton
                        onClickCapture={(e) => {
                            e.stopPropagation();
                            if (isMobileSidebarOpen) {
                                closeMobileSidebar();
                            } else {
                                openMobileSidebar();
                            }
                        }}
                        icon={
                            isMobileSidebarOpen ? (
                                <Cross1Icon className="!size-5" />
                            ) : (
                                <HamburgerMenuIcon className="!size-5" />
                            )
                        }
                        intent={isMobileSidebarOpen ? "primary" : "none"}
                        variant={isMobileSidebarOpen ? "filled" : "minimal"}
                        rounded={true}
                        size="large"
                    />
                </div>
            </div>
        </nav>
    );
});

export const Header = memo(UnmemoizedHeader);

export declare namespace HeaderPrimaryLink {
    export interface Props {
        navbarLink: DocsV1Read.NavbarLink.Primary;
    }
}
