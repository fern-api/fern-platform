import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import Link from "next/link";

export declare namespace HeaderSecondaryLink {
    export interface Props {
        navbarLink: DocsV1Read.NavbarLink.Secondary;
    }
}

export const HeaderSecondaryLink: React.FC<HeaderSecondaryLink.Props> = ({ navbarLink }) => {
    return (
        <Link
            className={classNames(
                "hover:text-accent-primary hover:dark:text-accent-primary-dark t-muted font-mono text-sm tracking-wider !no-underline transition",
                {
                    "font-semibold text-[#212121]": navbarLink.url === "/",
                }
            )}
            href={navbarLink.url}
            target="_blank"
            rel="noreferrer noopener"
        >
            {navbarLink.text}
        </Link>
    );
};
