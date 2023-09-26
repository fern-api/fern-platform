import { Icon } from "@blueprintjs/core";
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
        <>
            <div
                className={classNames("flex flex-col items-center justify-center rounded-md border p-1", {
                    "border-border-default-light dark:border-border-default-dark": !isHovered,
                    "border-white bg-white": isHovered,
                })}
            >
                <Icon
                    className={classNames({
                        "!text-text-muted-light dark:!text-text-muted-dark": !isHovered,
                        "!text-accent-primary": isHovered,
                    })}
                    size={14}
                    icon="document"
                />
            </div>

            <div className="flex w-full flex-col space-y-1.5">
                <div className="flex justify-between">
                    <span
                        className={classNames("line-clamp-1 text-xs text-start", {
                            "text-text-primary-light dark:text-text-primary-dark": !isHovered,
                            "text-white": isHovered,
                        })}
                    >
                        {hit.title}
                    </span>
                    <div
                        className={classNames("text-xs tracking-wide", {
                            "t-muted": !isHovered,
                            "text-white": isHovered,
                        })}
                    >
                        Page
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span
                        className={classNames("line-clamp-1 text-start text-xs", {
                            "text-white": isHovered,
                            "t-muted": !isHovered,
                        })}
                    >
                        {breadcrumbs}
                    </span>

                    <ArrowUTurnRightIcon
                        className={classNames("h-3 w-3 rotate-180", {
                            "text-white": isHovered,
                            "t-muted": !isHovered,
                        })}
                    />
                </div>
            </div>
        </>
    );
};
