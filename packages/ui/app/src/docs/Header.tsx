import { DocsV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { faChevronDown } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import classNames from "classnames";
import Link from "next/link";
import { forwardRef, Fragment, memo, PropsWithChildren } from "react";
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
        <div className="hidden items-center space-x-5 md:flex md:space-x-4">
            {navbarLinks.map((navbarLink, idx) =>
                visitDiscriminatedUnion(navbarLink, "type")._visit({
                    primary: (navbarLink) => <HeaderPrimaryLink key={idx} navbarLink={navbarLink} />,
                    secondary: (navbarLink) => <HeaderSecondaryLink key={idx} navbarLink={navbarLink} />,
                    _other: () => null,
                })
            )}
            <HeaderPrimaryLink
                navbarLink={{ type: "primary", text: "Talk to Sales", url: "https://www.tryfinch.com/sales" }}
                fill={true}
            />
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

            <div className="ml-8 hidden gap-5 md:flex">
                <HeadlessMenu as="div" className="relative inline-block text-left">
                    <>
                        <div className="my-auto">
                            <HeadlessMenu.Button
                                className={classNames(
                                    "flex gap-2 text-base font-medium items-center hover:opacity-50 transition-opacity antialiased"
                                )}
                            >
                                {({ open }) => {
                                    return (
                                        <>
                                            <span>Solutions</span>
                                            <FontAwesomeIcon
                                                icon={faChevronDown}
                                                className={classNames("transition w-3 h-3", {
                                                    "rotate-180": open,
                                                    "text-accent-primary": open,
                                                })}
                                            />
                                        </>
                                    );
                                }}
                            </HeadlessMenu.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0"
                            enterTo="transform opacity-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100"
                            leaveTo="transform opacity-0"
                        >
                            <HeadlessMenu.Items
                                className={classNames(
                                    "shadow-[0_0_26px_8px_rgba(22,22,22,.09)] w-[220px] bg-white px-5 py-3 rounded-xl absolute left-0 flex flex-col mt-4"
                                )}
                            >
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"https://www.tryfinch.com/solutions/employee-benefits"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        Employee Benefits
                                    </Link>
                                </HeadlessMenu.Item>
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"https://www.tryfinch.com/solutions/hr-technology"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        HR Technology
                                    </Link>
                                </HeadlessMenu.Item>
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"https://www.tryfinch.com/solutions/b2b-fintech"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        B2B Fintech
                                    </Link>
                                </HeadlessMenu.Item>
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"https://www.tryfinch.com/solutions/tax-compliance"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        Tax & Compliance
                                    </Link>
                                </HeadlessMenu.Item>
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"https://www.tryfinch.com/solutions/insurance"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        Insurance
                                    </Link>
                                </HeadlessMenu.Item>
                            </HeadlessMenu.Items>
                        </Transition>
                    </>
                </HeadlessMenu>

                <HeadlessMenu as="div" className="relative inline-block text-left">
                    <>
                        <div className="my-auto">
                            <HeadlessMenu.Button
                                className={classNames(
                                    "flex gap-2 text-base font-medium items-center hover:opacity-50 transition-opacity antialiased"
                                )}
                            >
                                {({ open }) => {
                                    return (
                                        <>
                                            <span>Developers</span>
                                            <FontAwesomeIcon
                                                icon={faChevronDown}
                                                className={classNames("transition w-3 h-3", {
                                                    "rotate-180": open,
                                                    "text-accent-primary": open,
                                                })}
                                            />
                                        </>
                                    );
                                }}
                            </HeadlessMenu.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0"
                            enterTo="transform opacity-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100"
                            leaveTo="transform opacity-0"
                        >
                            <HeadlessMenu.Items
                                className={classNames(
                                    "shadow-[0_0_26px_8px_rgba(22,22,22,.09)] w-[220px] bg-white px-5 py-3 rounded-xl absolute left-0 flex flex-col mt-4"
                                )}
                            >
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"/"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        Docs
                                    </Link>
                                </HeadlessMenu.Item>
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"/"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        Quickstart
                                    </Link>
                                </HeadlessMenu.Item>
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"https://www.tryfinch.com/integrations"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        Integrations
                                    </Link>
                                </HeadlessMenu.Item>
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"https://changelog.tryfinch.com/"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        Changelog
                                    </Link>
                                </HeadlessMenu.Item>
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"https://status.tryfinch.com/"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        System Status
                                    </Link>
                                </HeadlessMenu.Item>
                            </HeadlessMenu.Items>
                        </Transition>
                    </>
                </HeadlessMenu>

                <HeadlessMenu as="div" className="relative inline-block text-left">
                    <>
                        <div className="my-auto">
                            <HeadlessMenu.Button
                                className={classNames(
                                    "flex gap-2 text-base font-medium items-center hover:opacity-50 transition-opacity antialiased"
                                )}
                            >
                                {({ open }) => {
                                    return (
                                        <>
                                            <span>Resources</span>
                                            <FontAwesomeIcon
                                                icon={faChevronDown}
                                                className={classNames("transition w-3 h-3", {
                                                    "rotate-180": open,
                                                    "text-accent-primary": open,
                                                })}
                                            />
                                        </>
                                    );
                                }}
                            </HeadlessMenu.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0"
                            enterTo="transform opacity-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100"
                            leaveTo="transform opacity-0"
                        >
                            <HeadlessMenu.Items
                                className={classNames(
                                    "shadow-[0_0_26px_8px_rgba(22,22,22,.09)] w-[220px] bg-white px-5 py-3 rounded-xl absolute left-0 flex flex-col mt-4"
                                )}
                            >
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"https://www.tryfinch.com/blog"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        Blog
                                    </Link>
                                </HeadlessMenu.Item>
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"https://www.tryfinch.com/whitepapers"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        Whitepapers
                                    </Link>
                                </HeadlessMenu.Item>
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"https://www.tryfinch.com/tag/case-study"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        Customer Stories
                                    </Link>
                                </HeadlessMenu.Item>
                            </HeadlessMenu.Items>
                        </Transition>
                    </>
                </HeadlessMenu>

                <HeadlessMenu as="div" className="relative inline-block text-left">
                    <>
                        <div className="my-auto">
                            <HeadlessMenu.Button
                                className={classNames(
                                    "flex gap-2 text-base font-medium items-center hover:opacity-50 transition-opacity antialiased"
                                )}
                            >
                                {({ open }) => {
                                    return (
                                        <>
                                            <span>Company</span>
                                            <FontAwesomeIcon
                                                icon={faChevronDown}
                                                className={classNames("transition w-3 h-3", {
                                                    "rotate-180": open,
                                                    "text-accent-primary": open,
                                                })}
                                            />
                                        </>
                                    );
                                }}
                            </HeadlessMenu.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0"
                            enterTo="transform opacity-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100"
                            leaveTo="transform opacity-0"
                        >
                            <HeadlessMenu.Items
                                className={classNames(
                                    "shadow-[0_0_26px_8px_rgba(22,22,22,.09)] w-[220px] bg-white px-5 py-3 rounded-xl absolute left-0 flex flex-col mt-4"
                                )}
                            >
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"https://www.tryfinch.com/company/about"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        About
                                    </Link>
                                </HeadlessMenu.Item>
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"https://www.tryfinch.com/company/security"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        Security
                                    </Link>
                                </HeadlessMenu.Item>
                                <HeadlessMenu.Item as={Fragment}>
                                    <Link
                                        href={"https://www.tryfinch.com/careers"}
                                        className="inline-block p-3 text-base text-black hover:no-underline"
                                    >
                                        Careers
                                    </Link>
                                </HeadlessMenu.Item>
                            </HeadlessMenu.Items>
                        </Transition>
                    </>
                </HeadlessMenu>
                <div className="my-auto">
                    <Link
                        href="https://www.tryfinch.com/pricing"
                        className="flex items-center gap-2 text-base font-medium text-black antialiased transition-opacity hover:text-black hover:no-underline hover:opacity-50"
                    >
                        <span>Pricing</span>
                    </Link>
                </div>
            </div>

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
