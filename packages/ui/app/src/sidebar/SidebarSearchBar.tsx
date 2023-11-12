import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { type Theme } from "@fern-ui/theme";
import classNames from "classnames";
import { memo, type MouseEventHandler } from "react";
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
    return (
        <button
            onClick={onClick}
            className={classNames("border-[rgb(215,207,193)] group flex items-center rounded-lg border px-2.5 py-2", {
                "bg-background-primary-dark hover:bg-background-hover-dark": theme === "dark",
                "bg-background-primary-light hover:bg-background-hover-light": theme === "light",
            })}
        >
            <div className="flex items-center space-x-3">
                <SearchIcon className="text-intent-default h-5 w-5" />
                <div className="text-text-disabled-light group-hover:text-intent-default dark:text-text-disabled-dark">
                    Search...
                </div>
            </div>

            <PlatformSpecificContent>
                {(platform) => (
                    <div className="text-text-disabled-light group-hover:text-intent-default dark:text-text-disabled-dark ml-auto text-start text-xs tracking-wide">
                        {visitDiscriminatedUnion({ platform }, "platform")._visit({
                            mac: () => "CMD+K",
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
