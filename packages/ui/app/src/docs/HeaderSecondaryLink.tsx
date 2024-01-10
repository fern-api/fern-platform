import { DocsV1Read } from "@fern-api/fdr-sdk";
import Link from "next/link";

export declare namespace HeaderSecondaryLink {
    export interface Props {
        navbarLink: DocsV1Read.NavbarLink.Secondary;
    }
}

export const HeaderSecondaryLink: React.FC<HeaderSecondaryLink.Props> = ({ navbarLink }) => {
    return (
        <Link
            className={
                "hover:text-accent-primary hover:dark:text-accent-primary-dark t-muted text-sm !no-underline transition"
            }
            href={navbarLink.url}
            target="_blank"
            rel="noreferrer noopener"
        >
            {navbarLink.text}
        </Link>
    );
};
