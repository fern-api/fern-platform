import { DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import Link from "next/link";
import { ArrowRightIcon } from "../commons/icons/ArrowRightIcon";

export declare namespace HeaderPrimaryLink {
    export interface Props {
        navbarLink: DocsV1Read.NavbarLink.Primary;
    }
}

export const HeaderPrimaryLink: React.FC<HeaderPrimaryLink.Props> = ({ navbarLink }) => {
    return (
        <Link
            className={classNames(
                "text-sm group pl-4 pr-3 py-1.5 flex space-x-1.5 items-center no-underline hover:no-underline text-accent-primary dark:text-accent-primary-dark hover:text-accent-primary dark:hover:text-accent-primary-dark transition rounded-lg hover:bg-tag-primary dark:hover:bg-tag-primary-dark",
                "ring-border-primary dark:ring-border-primary-dark ring-1 hover:ring-2 ring-inset",
            )}
            href={navbarLink.url}
            target="_blank"
            rel="noreferrer noopener"
        >
            <span className="whitespace-nowrap">{navbarLink.text}</span>
            <div className="flex h-5 w-5 items-center">
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </div>
        </Link>
    );
};
