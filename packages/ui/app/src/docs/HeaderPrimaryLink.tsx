import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { ArrowRightIcon } from "../commons/icons/ArrowRightIcon";

export declare namespace HeaderPrimaryLink {
    export interface Props {
        navbarLink: DocsV1Read.NavbarLink.Primary;
    }
}

export const HeaderPrimaryLink: React.FC<HeaderPrimaryLink.Props> = ({ navbarLink }) => {
    return (
        <a
            className={classNames(
                "text-sm group pl-4 pr-3 py-1.5 border border-border-primary dark:border-border-primary-dark hover:border-2 flex space-x-1.5 items-center no-underline hover:no-underline text-accent-primary dark:text-accent-primary-dark hover:text-accent-primary dark:hover:text-accent-primary-dark transition rounded-lg hover:bg-tag-primary dark:hover:bg-tag-primary-dark",
                "hover:py-[calc(theme(spacing.1.5)-1px)] hover:pr-[calc(theme(spacing.3)-1px)] hover:pl-[calc(theme(spacing.4)-1px)]"
            )}
            href={navbarLink.url}
            target="_blank"
            rel="noreferrer noopener"
        >
            <span className="whitespace-nowrap">{navbarLink.text}</span>
            <div className="flex h-5 w-5 items-center">
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </div>
        </a>
    );
};
