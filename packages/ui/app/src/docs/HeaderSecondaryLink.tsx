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
                "text-sm !no-underline hover:text-accent-primary hover:dark:text-accent-primary-dark t-muted transition"
            )}
            href={navbarLink.url}
            target="_blank"
            rel="noreferrer noopener"
        >
            {navbarLink.text}
        </a>
    );
};
