import { Icon } from "@blueprintjs/core";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { type MouseEventHandler } from "react";
import { PlatformSpecificContent } from "../commons/PlatformSpecificContent";

export declare namespace SidebarSearchBar {
    export interface Props {
        onClick: MouseEventHandler<HTMLButtonElement>;
    }
}

export const SidebarSearchBar: React.FC<SidebarSearchBar.Props> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="dark:border-border-default-dark border-border-default-light hover:bg-background-hover-light hover:dark:bg-background-hover-dark group flex items-center rounded-lg border px-4 py-2 transition"
        >
            <div className="flex items-center space-x-3">
                <Icon className="text-intent-default" icon="search" size={14} />
                <div className="text-text-disabled-light group-hover:text-intent-default dark:text-text-disabled-dark transition">
                    Search...
                </div>
            </div>

            <PlatformSpecificContent>
                {(platform) => (
                    <div className="text-text-disabled-light group-hover:text-intent-default dark:text-text-disabled-dark ml-auto text-start text-xs tracking-wide transition">
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
};
