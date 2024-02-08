import { DocsV1Read } from "@fern-api/fdr-sdk";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import Link from "next/link";
import { ReactElement } from "react";
import { FernButtonGroup, FernLinkButton } from "../components/FernButton";

interface HeaderSidebarSlugLinkProps {
    navbarLink: DocsV1Read.NavbarLink;
}

export const HeaderSidebarSlugLink: React.FC<HeaderSidebarSlugLinkProps> = ({ navbarLink }) => {
    return (
        <Link
            className={classNames(
                "text-sm group pl-4 pr-3 py-1.5 border border-border-accent-muted-light dark:border-border-accent-muted-dark hover:border-2 flex space-x-1.5 items-center no-underline hover:no-underline t-accent hover:t-accent transition rounded-lg hover:bg-tag-primary",
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
        <div className="border-concealed -mx-4 list-none border-b p-4 lg:hidden">
            <FernButtonGroup className="w-full">
                {navbarLinks?.map((navbarLink, idx) => (
                    <FernLinkButton
                        key={idx}
                        href={navbarLink.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        text={navbarLink.text}
                        rightIcon={navbarLink.type === "primary" && <ArrowRightIcon className="size-5" />}
                        className="w-full text-left lg:hidden"
                        buttonStyle={navbarLink.type === "primary" ? "outlined" : "minimal"}
                        intent={navbarLink.type === "primary" ? "primary" : "none"}
                        size="large"
                    />
                ))}
            </FernButtonGroup>
        </div>
    );
}
