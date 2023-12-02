import classNames from "classnames";
import { ArrowUTurnRightIcon } from "../../commons/icons/ArrowUTurnRightIcon";
import type { PageSearchRecordV2 } from "../types";

export declare namespace PageRecordV2 {
    export interface Props {
        hit: PageSearchRecordV2;
        isHovered: boolean;
    }
}

export const PageRecordV2: React.FC<PageRecordV2.Props> = ({ hit, isHovered }) => {
    const breadcrumbs = hit.path.parts.map((p) => p.name).join(" > ");
    return (
        <div className="flex w-full flex-col space-y-1.5">
            <div className="flex justify-between">
                <span
                    className={classNames("line-clamp-1 text-xs text-start", {
                        "text-text-primary-light dark:text-text-primary-dark": !isHovered,
                        "text-white dark:text-black": isHovered,
                    })}
                >
                    {hit.title}
                </span>
                <div
                    className={classNames("text-xs tracking-wide", {
                        "t-muted": !isHovered,
                        "text-white dark:text-black": isHovered,
                    })}
                >
                    Page
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span
                    className={classNames("line-clamp-1 text-start text-xs", {
                        "text-white dark:text-black": isHovered,
                        "t-muted": !isHovered,
                    })}
                >
                    {breadcrumbs}
                </span>

                <ArrowUTurnRightIcon
                    className={classNames("h-3 w-3 rotate-180", {
                        "text-white dark:text-black": isHovered,
                        "t-muted": !isHovered,
                    })}
                />
            </div>
        </div>
    );
};
