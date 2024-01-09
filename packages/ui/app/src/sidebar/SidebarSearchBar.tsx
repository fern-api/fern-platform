import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import { memo, type MouseEventHandler } from "react";
import { SearchIcon } from "../commons/icons/SearchIcon";
import { PlatformSpecificContent } from "../commons/PlatformSpecificContent";

export declare namespace SidebarSearchBar {
    export interface Props {
        onClick: MouseEventHandler<HTMLButtonElement>;
        className?: string;
    }
}

export const SidebarSearchBar: React.FC<SidebarSearchBar.Props> = memo(function UnmemoizedSidebarSearchBar({
    onClick,
    className,
}) {
    return (
        <button
            onClick={onClick}
            className={classNames(
                className,
                "text-sm dark:border-white/20 border-black/20 group flex items-center rounded-lg border px-2.5 py-2",
                "bg-background-primary-light hover:bg-background-hover-light dark:bg-background-primary-dark dark:hover:bg-background-hover-dark"
            )}
        >
            <div className="flex items-center space-x-3">
                <SearchIcon className="text-intent-default h-5 w-5" />
                <div className="text-black/50 group-hover:text-black/50 dark:text-white/50 dark:group-hover:text-white/50">
                    Search...
                </div>
            </div>

            <PlatformSpecificContent>
                {(platform) => (
                    <div className="ml-auto text-start text-xs tracking-wide text-black/50 group-hover:text-black/50 dark:text-white/50 dark:group-hover:text-white/50">
                        {visitDiscriminatedUnion({ platform }, "platform")._visit({
                            mac: () => "⌘K",
                            windows: () => "CTRL+K",
                            other: () => null,
                            _other: () => null,
                        })}
                    </div>
                )}
            </PlatformSpecificContent>
        </button>
    );
});
