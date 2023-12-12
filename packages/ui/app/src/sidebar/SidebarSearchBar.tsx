import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { type Theme } from "@fern-ui/theme";
import classNames from "classnames";
import { memo, useEffect, useState, type MouseEventHandler } from "react";
import { SearchIcon } from "../commons/icons/SearchIcon";
import { PlatformSpecificContent } from "../commons/PlatformSpecificContent";

export declare namespace SidebarSearchBar {
    export interface Props {
        theme: Theme | undefined;
        onClick: MouseEventHandler<HTMLButtonElement>;
    }
}

export const SidebarSearchBar: React.FC<SidebarSearchBar.Props> = memo(function UnmemoizedSidebarSearchBar({
    theme,
    onClick,
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <button
            onClick={onClick}
            className={classNames(
                "border-[#CBD5E0] group flex items-center rounded-lg border px-2.5 py-2 hover:shadow-lg transition-shadow",
                {
                    // "bg-background-primary-dark hover:bg-background-hover-dark": theme === "dark",
                    "bg-white": theme === "light",
                }
            )}
        >
            <div className="flex items-center space-x-3">
                <SearchIcon className="text-intent-default h-5 w-5" />
                <div className="group-hover:text-intent-default dark:text-text-disabled-dark text-intent-default">
                    Search...
                </div>
            </div>

            <PlatformSpecificContent>
                {(platform) => (
                    <div className="group-hover:text-intent-default dark:text-text-disabled-dark text-intent-default ml-auto text-start text-xs tracking-wide">
                        {visitDiscriminatedUnion({ platform }, "platform")._visit({
                            mac: () => "⌘+K",
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
