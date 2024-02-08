import { DocsV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { Cross1Icon, HamburgerMenuIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { CSSProperties, forwardRef, memo, PropsWithChildren } from "react";
import { FernButton, FernButtonGroup } from "../components/FernButton";
import { SearchService } from "../services/useSearchService";
import { HeaderLogoSection } from "./HeaderLogoSection";
import { HeaderPrimaryLink } from "./HeaderPrimaryLink";
import { HeaderSecondaryLink } from "./HeaderSecondaryLink";
import { ThemeButton } from "./ThemeButton";

export declare namespace Header {
    export interface Props {
        className?: string;
        style?: CSSProperties;
        config: DocsV1Read.DocsConfig;
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
        style,
        config,
        openSearchDialog,
        isMobileSidebarOpen,
        openMobileSidebar,
        closeMobileSidebar,
        searchService,
    },
    ref,
) {
    const { navbarLinks, colorsV3 } = config;
    const navbarLinksSection = (
        <div className="hidden lg:block">
            <FernButtonGroup>
                {navbarLinks?.map((navbarLink, idx) =>
                    visitDiscriminatedUnion(navbarLink, "type")._visit({
                        primary: (navbarLink) => <HeaderPrimaryLink key={idx} navbarLink={navbarLink} />,
                        secondary: (navbarLink) => <HeaderSecondaryLink key={idx} navbarLink={navbarLink} />,
                        _other: () => null,
                    }),
                )}

                {colorsV3?.type === "darkAndLight" && <ThemeButton className="hidden lg:flex" />}
            </FernButtonGroup>
        </div>
    );

    return (
        <nav
            aria-label="primary"
            className={classNames(
                "flex justify-between items-center shrink-0 px-4 md:px-6 lg:px-8",
                // this matches with the calc() in the EndpointContent examples section
                "h-full",
                className,
            )}
            ref={ref}
            style={style}
        >
            <HeaderLogoSection config={config} />

            <div className="-mr-2 ml-auto flex items-center space-x-0 md:mr-0 lg:space-x-4">
                {navbarLinksSection}

                <div className="flex lg:hidden">
                    {colorsV3?.type === "darkAndLight" && <ThemeButton size="large" />}

                    {searchService.isAvailable && (
                        <FernButton
                            onClick={openSearchDialog}
                            icon={<MagnifyingGlassIcon className="size-6" />}
                            intent="none"
                            variant="minimal"
                            rounded={true}
                            size="large"
                            className="hidden sm:inline"
                        />
                    )}

                    <FernButton
                        onClick={isMobileSidebarOpen ? closeMobileSidebar : openMobileSidebar}
                        icon={
                            isMobileSidebarOpen ? (
                                <Cross1Icon className="size-6" />
                            ) : (
                                <HamburgerMenuIcon className="size-6" />
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
