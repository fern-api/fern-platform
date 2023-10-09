import classNames from "classnames";
import Link from "next/link";
import { LinkIcon } from "./icons/LinkIcon";

export declare namespace AbsolutelyPositionedAnchor {
    export interface Props {
        route: string;
        verticalPosition: "center" | "default";
    }
}

/**
 * Can only be used with a parent div that has `position` set to `"relative"`.
 */
export const AbsolutelyPositionedAnchor: React.FC<AbsolutelyPositionedAnchor.Props> = ({ verticalPosition, route }) => {
    return (
        <div
            className={classNames(
                "absolute -left-[calc(0.875rem+0.375rem*2)] flex items-center justify-center px-1.5 py-1 opacity-0 hover:opacity-100 group-hover/anchor-container:opacity-100 z-10",
                {
                    "top-2.5": verticalPosition === "default",
                    "top-0 bottom-0": verticalPosition === "center",
                }
            )}
        >
            {/* <button onClick={onClick}>
                <LinkIcon className="t-muted hover:text-text-primary-light hover:dark:text-text-primary-dark h-3.5 w-3.5 transition" />
            </button> */}
            <Link href={route} shallow={true} scroll={false} replace={true}>
                <LinkIcon className="t-muted hover:text-text-primary-light hover:dark:text-text-primary-dark h-3.5 w-3.5 transition" />
            </Link>
        </div>
    );
};
