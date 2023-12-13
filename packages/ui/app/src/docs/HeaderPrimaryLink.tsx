import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";

export declare namespace HeaderPrimaryLink {
    export interface Props {
        navbarLink: DocsV1Read.NavbarLink.Primary;
        fill?: boolean;
    }
}

export const HeaderPrimaryLink: React.FC<HeaderPrimaryLink.Props> = ({ navbarLink, fill = false }) => {
    return (
        <a
            className={classNames(
                "group p-2.5 border-2 border-black flex space-x-1.5 items-center !no-underline text-black transition rounded-lg hover:bg-accent-primary hover:text-white hover:border-accent-primary text-base font-medium antialiased",
                {
                    "text-white bg-black": fill,
                }
            )}
            href={navbarLink.url}
            target="_blank"
            rel="noreferrer noopener"
        >
            <span className="whitespace-nowrap">{navbarLink.text}</span>
        </a>
    );
};
