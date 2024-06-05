import { useCopyToClipboard, useMounted } from "@fern-ui/react-commons";
import { Transition } from "@headlessui/react";
import { Link1Icon } from "@radix-ui/react-icons";
import cn from "clsx";
import { Url } from "next/dist/shared/lib/router/router";
import { Fragment, memo } from "react";
import { Check } from "react-feather";
import { FernLink } from "../components/FernLink.js";
import "./AbsolutelyPositionedAnchor.scss";

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
    if (href.hash != null) {
        result += `#${href.hash}`;
    }
    return result;
}

/**
 * Can only be used with a parent div that has `position` set to `"relative"`.
 */
export const AbsolutelyPositionedAnchor = memo<AbsolutelyPositionedAnchor.Props>(function AbsolutelyPositionedAnchor({
    href,
    smallGap = false,
}) {
    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(() => window.location.origin + hrefToString(href));

    const mounted = useMounted();

    return (
        <div className="fern-anchor">
            <FernLink
                href={href}
                shallow={true}
                replace={true}
                className={cn({
                    "-ml-10": !smallGap,
                    "-ml-8": smallGap,
                })}
                onClick={copyToClipboard}
                tabIndex={-1}
            >
                {!wasJustCopied && (
                    <span className="fern-anchor-icon opacity-0 group-hover/anchor-container:opacity-100">
                        <Link1Icon />
                    </span>
                )}
                {mounted && (
                    <Transition
                        show={wasJustCopied}
                        leave="duration-200 pointer-events-none transition-all ease-in"
                        leaveFrom="opacity-100 translate-x-0"
                        leaveTo="opacity-0 -translate-x-2"
                        as={Fragment}
                    >
                        <div className="fern-anchor-icon copied">
                            <Check className="size-4" />
                        </div>
                    </Transition>
                )}
            </FernLink>
        </div>
    );
});
