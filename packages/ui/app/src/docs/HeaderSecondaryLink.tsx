import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";

export declare namespace HeaderSecondaryLink {
    export interface Props {
        navbarLink: DocsV1Read.NavbarLink.Secondary;
    }
}

export const HeaderSecondaryLink: React.FC<HeaderSecondaryLink.Props> = ({ navbarLink }) => {
    return (
        <a
            className={classNames(
                "!no-underline hover:opacity-50 hover:text-black text-black text-base transition font-medium antialiased whitespace-nowrap"
            )}
            href={navbarLink.url}
            target="_blank"
            rel="noreferrer noopener"
        >
            {navbarLink.text}
        </a>
    );
};
