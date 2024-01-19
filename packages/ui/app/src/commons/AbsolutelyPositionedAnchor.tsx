import { useCopyToClipboard } from "@fern-ui/react-commons";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { Fragment } from "react";
import { CheckIcon } from "./icons/CheckIcon";

export declare namespace AbsolutelyPositionedAnchor {
    export interface Props {
        href: Url;
        smallGap?: boolean;
    }
}

function hrefToString(href: Url): string {
    if (typeof href === "string") {
        return href;
    }
    if (href.pathname == null) {
        return "";
    }
    let result = href.pathname;
    if (href.query != null) {
        result += "?";
        for (const [key, value] of Object.entries(href.query)) {
            result += `${key}=${value}&`;
        }
        result = result.slice(0, -1);
    }
    return result;
}

/**
 * Can only be used with a parent div that has `position` set to `"relative"`.
 */
export const AbsolutelyPositionedAnchor: React.FC<AbsolutelyPositionedAnchor.Props> = ({ href, smallGap = false }) => {
    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(() => window.location.origin + hrefToString(href));
    return (
        <div className="absolute hidden md:block">
            <Link
                href={href}
                shallow={true}
                replace={true}
                className={classNames(
                    "flex items-center border-0 relative h-6 group-hover/anchor-container:bg-background group-hover/anchor-container:dark:bg-background rounded-md",
                    {
                        "-ml-10": !smallGap,
                        "-ml-8": smallGap,
                        "bg-background dark:bg-background": wasJustCopied,
                    }
                )}
                onClick={copyToClipboard}
            >
                {!wasJustCopied && (
                    <span className="zinc-box absolute left-0 flex h-6 w-6 items-center justify-center rounded-md bg-white text-gray-400 opacity-0 ring-1 ring-gray-400/30 hover:ring-gray-400/60 group-hover/anchor-container:opacity-100 dark:bg-white/5 dark:ring-gray-700/25 dark:hover:ring-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="gray" height="12px" viewBox="0 0 576 512">
                            <path d="M0 256C0 167.6 71.6 96 160 96h72c13.3 0 24 10.7 24 24s-10.7 24-24 24H160C98.1 144 48 194.1 48 256s50.1 112 112 112h72c13.3 0 24 10.7 24 24s-10.7 24-24 24H160C71.6 416 0 344.4 0 256zm576 0c0 88.4-71.6 160-160 160H344c-13.3 0-24-10.7-24-24s10.7-24 24-24h72c61.9 0 112-50.1 112-112s-50.1-112-112-112H344c-13.3 0-24-10.7-24-24s10.7-24 24-24h72c88.4 0 160 71.6 160 160zM184 232H392c13.3 0 24 10.7 24 24s-10.7 24-24 24H184c-13.3 0-24-10.7-24-24s10.7-24 24-24z"></path>
                        </svg>
                    </span>
                )}
                <Transition
                    show={wasJustCopied}
                    leave="duration-200 pointer-events-none transition-all"
                    leaveFrom="opacity-100 translate-x-0"
                    leaveTo="opacity-0 -translate-x-2"
                    as={Fragment}
                >
                    <div className="bg-tag-primary dark:bg-tag-primary-dark ring-accent-primary/60 dark:ring-accent-primary/60 absolute left-0 flex h-6 w-6 items-center justify-center rounded-md ring-1">
                        <CheckIcon className="text-accent-primary dark:text-accent-primary-dark h-4 w-4" />
                    </div>
                </Transition>
            </Link>
        </div>
    );
};
