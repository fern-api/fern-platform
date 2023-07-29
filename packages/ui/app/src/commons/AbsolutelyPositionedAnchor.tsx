import classNames from "classnames";
import { LinkIcon } from "./icons/LinkIcon";

export declare namespace AbsolutelyPositionedAnchor {
    export interface Props {
        anchor: string;
        verticalPosition: "center" | "default";
    }
}

/**
 * Can only be used with a parent div that has `position` set to `"relative"`.
 */
export const AbsolutelyPositionedAnchor: React.FC<AbsolutelyPositionedAnchor.Props> = ({
    verticalPosition,
    anchor,
}) => {
    return (
        <div
            className={classNames(
                "absolute -left-[calc(0.875rem+0.375rem*2)] flex items-center justify-center px-1.5 py-1 opacity-0 hover:opacity-100 group-hover:opacity-100",
                {
                    "top-2.5": verticalPosition === "default",
                    "top-auto bottom-auto": verticalPosition === "center",
                }
            )}
        >
            <a href={`#${anchor}`}>
                <LinkIcon className="text-text-muted hover:text-text-stark h-3.5 w-3.5 transition" />
            </a>
        </div>
    );
};
