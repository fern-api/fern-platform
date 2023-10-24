import type * as FernRegistryDocsRead from "@fern-api/fdr-sdk/dist/generated/api/resources/docs/resources/v1/resources/read";
import classNames from "classnames";

export declare namespace HeaderSecondaryLink {
    export interface Props {
        navbarLink: FernRegistryDocsRead.NavbarLink.Secondary;
    }
}

export const HeaderSecondaryLink: React.FC<HeaderSecondaryLink.Props> = ({ navbarLink }) => {
    return (
        <a
            className={classNames(
                "!no-underline hover:text-accent-primary hover:dark:text-accent-primary t-muted transition"
            )}
            href={navbarLink.url}
            target="_blank"
            rel="noreferrer noopener"
        >
            {navbarLink.text}
        </a>
    );
};
