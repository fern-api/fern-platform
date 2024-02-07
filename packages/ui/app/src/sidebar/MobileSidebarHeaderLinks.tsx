import { DocsV1Read } from "@fern-api/fdr-sdk";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import Link from "next/link";
import { ReactElement } from "react";
import { SidebarLink } from "./SidebarLink";

interface HeaderSidebarSlugLinkProps {
    navbarLink: DocsV1Read.NavbarLink;
}

export const HeaderSidebarSlugLink: React.FC<HeaderSidebarSlugLinkProps> = ({ navbarLink }) => {
    return (
        <Link
            className={classNames(
                "text-sm group pl-4 pr-3 py-1.5 border border-border-primary dark:border-border-primary-dark hover:border-2 flex space-x-1.5 items-center no-underline hover:no-underline text-accent-primary hover:text-accent-primary dark:hover:text-accent-primary-dark transition rounded-lg hover:bg-tag-primary",
                "hover:py-[calc(theme(spacing.1.5)-1px)] hover:pr-[calc(theme(spacing.3)-1px)] hover:pl-[calc(theme(spacing.4)-1px)]",
            )}
            href={navbarLink.url}
            target="_blank"
            rel="noreferrer noopener"
        >
            <span className="whitespace-nowrap">{navbarLink.text}</span>
            {navbarLink.type === "primary" && (
                <div className="flex size-5 items-center">
                    <ArrowRightIcon className="size-5" />
                </div>
            )}
        </Link>
    );
};

interface MobileSidebarHeaderLinksProps {
    navbarLinks: DocsV1Read.NavbarLink[] | undefined;
}

export function MobileSidebarHeaderLinks({ navbarLinks }: MobileSidebarHeaderLinksProps): ReactElement | null {
    if (navbarLinks == null || navbarLinks.length === 0) {
        return null;
    }
    return (
        <ul className="border-border-concealed-light dark:border-border-concealed-dark -mx-4 list-none border-b p-4 lg:hidden">
            {navbarLinks?.map((navbarLink, idx) => (
                <SidebarLink
                    key={idx}
                    href={navbarLink.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    title={navbarLink.text}
                    rightElement={
                        navbarLink.type === "primary" && (
                            <div className="flex size-5 items-center">
                                <ArrowRightIcon className="size-5" />
                            </div>
                        )
                    }
                    linkClassName={classNames({
                        "my-2 transition ring-inset ring-1 hover:ring-2 ring-border-primary dark:ring-border-primary-dark hover:bg-tag-primary !text-accent-primary !dark:text-accent-primary":
                            navbarLink.type === "primary",
                    })}
                />
            ))}
        </ul>
    );
}
