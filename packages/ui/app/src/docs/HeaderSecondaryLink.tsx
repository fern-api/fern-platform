import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import classNames from "classnames";
import { DiscordIcon } from "../commons/icons/DiscordIcon";

const PRIMER_DISCORD_URL = "https://bit.ly/3f5vvJ2";

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
            {navbarLink.url === PRIMER_DISCORD_URL ? <DiscordIcon className="h-4 w-4 fill-current" /> : null}
            <span>{navbarLink.text}</span>
        </a>
    );
};
