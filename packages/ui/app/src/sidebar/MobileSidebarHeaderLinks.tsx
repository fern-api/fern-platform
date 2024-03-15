import { DocsV1Read } from "@fern-api/fdr-sdk";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import Link from "next/link";
import { ReactElement } from "react";
import { FernLinkButton } from "../components/FernButton";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";

interface HeaderSidebarSlugLinkProps {
    navbarLink: DocsV1Read.NavbarLink;
}

export const HeaderSidebarSlugLink: React.FC<HeaderSidebarSlugLinkProps> = ({ navbarLink }) => {
    return (
        <Link
            className={classNames(
                "text-sm group pl-4 pr-3 py-1.5 border border-border-accent-muted hover:border-2 flex space-x-1.5 items-center no-underline hover:no-underline t-accent hover:t-accent transition rounded-lg hover:bg-tag-primary",
                "hover:py-[calc(theme(spacing.1.5)-1px)] hover:pr-[calc(theme(spacing.3)-1px)] hover:pl-[calc(theme(spacing.4)-1px)]",
            )}
            href={navbarLink.url}
            target="_blank"
        >
            <span className="whitespace-nowrap">{navbarLink.text}</span>
            {navbarLink.type === "primary" && (
                <div className="flex size-5 items-center">
                    <ArrowRightIcon />
                </div>
            )}
        </Link>
    );
};

interface MobileSidebarHeaderLinksProps {
    navbarLinks: DocsV1Read.NavbarLink[] | undefined;
}

export function MobileSidebarHeaderLinks({ navbarLinks }: MobileSidebarHeaderLinksProps): ReactElement | null {
    const { layout } = useDocsContext();
    if (navbarLinks == null || navbarLinks.length === 0) {
        return null;
    }
    return (
        <div
            className={classNames("border-concealed list-none -mx-4 border-t p-4 mt-4", {
                "lg:hidden": layout?.disableHeader !== true,
            })}
        >
            {navbarLinks?.map((navbarLink, idx) => (
                <FernLinkButton
                    key={idx}
                    href={navbarLink.url}
                    target="_blank"
                    text={navbarLink.text}
                    rightIcon={
                        navbarLink.type === "primary" ||
                        (navbarLink.type === "filled" && idx === navbarLinks.length - 1) ? (
                            <ArrowRightIcon className="!size-5" />
                        ) : undefined
                    }
                    className={classNames("w-full lg:hidden", {
                        "mt-2": navbarLink.type === "primary" || navbarLink.type === "filled",
                    })}
                    variant={
                        navbarLink.type === "primary"
                            ? "outlined"
                            : navbarLink.type === "secondary"
                              ? "minimal"
                              : navbarLink.type
                    }
                    intent={navbarLink.type === "primary" || navbarLink.type === "filled" ? "primary" : "none"}
                    size="large"
                />
            ))}
        </div>
    );
}
