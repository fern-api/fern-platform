import classNames from "classnames";
import { CornerDownLeft } from "react-feather";
import type { PageSearchRecordV2 } from "../types";
import { SearchHitBreadCrumbs } from "./SearchHitBreadCrumbs";

export declare namespace PageRecordV2 {
    export interface Props {
        hit: PageSearchRecordV2;
        isHovered: boolean;
    }
}

export const PageRecordV2: React.FC<PageRecordV2.Props> = ({ hit, isHovered }) => {
    return (
        <div className="flex w-full flex-col space-y-1.5">
            <div className="flex justify-between">
                <span
                    className={classNames("line-clamp-1 text-sm text-start", {
                        "text-text-default-light dark:text-text-default-dark": !isHovered,
                        "t-accent-contrast": isHovered,
                    })}
                >
                    {hit.title}
                </span>
                <div
                    className={classNames("text-sm tracking-wide", {
                        "t-muted": !isHovered,
                        "t-accent-contrast": isHovered,
                    })}
                >
                    Page
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span
                    className={classNames("line-clamp-1 text-start text-xs", {
                        "t-accent-contrast": isHovered,
                        "t-muted": !isHovered,
                    })}
                >
                    <SearchHitBreadCrumbs parts={hit.path.parts} />
                </span>

                <CornerDownLeft
                    className={classNames("size-3", {
                        "t-accent-contrast": isHovered,
                        "t-muted": !isHovered,
                    })}
                />
            </div>
        </div>
    );
};
