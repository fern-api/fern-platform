import * as RadioGroup from "@radix-ui/react-radio-group";
import { PropsWithChildren, ReactElement } from "react";
import { ArrowTurnDownLeftIcon } from "../icons/ArrowTurnDownLeftIcon";
import { RegularCalendarIcon } from "../icons/RegularCalendarIcon";
import { RegularFileLinesIcon } from "../icons/RegularFileLinesIcon";
import { RemoteIcon } from "../icons/RemoteIcon";
import { LinkComponentType } from "./LinkComponent";

interface SearchHitRadioItemProps {
    LinkComponent: LinkComponentType;
    pathname: string;
    icon?: string | undefined;
    type?: string | undefined;
    hash?: string | undefined;
}

export function SearchHitRadioItem({
    LinkComponent,
    children,
    pathname,
    hash,
    type,
    icon,
}: PropsWithChildren<SearchHitRadioItemProps>): ReactElement {
    return (
        <RadioGroup.Item
            value={`${pathname}${hash ?? ""}`}
            className="mx-2 p-2 rounded-md hover:bg-[#CCC]/15 dark:hover:bg-white/5 data-[state=checked]:bg-[#CCC]/30 dark:data-[state=checked]:bg-white/10 text-left block"
        >
            <LinkComponent hit={{ pathname, hash: hash ?? "" }} className="flex gap-2">
                <div className="shrink-0 py-1">
                    {icon != null ? (
                        <RemoteIcon icon={icon} className="size-4 text-[#969696] dark:text-white/50" />
                    ) : type === "changelog" ? (
                        <RegularCalendarIcon className="size-4 text-[#969696] dark:text-white/50" />
                    ) : (
                        <RegularFileLinesIcon className="size-4 text-[#969696] dark:text-white/50" />
                    )}
                </div>

                <div className="flex-1">{children}</div>
                <RadioGroup.Indicator asChild>
                    <ArrowTurnDownLeftIcon className="size-3 text-[#969696] dark:text-white/50 shrink-0" />
                </RadioGroup.Indicator>
            </LinkComponent>
        </RadioGroup.Item>
    );
}
