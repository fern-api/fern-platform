import { useIsHovering } from "@fern-ui/react-commons";
import classNames from "classnames";
import Link from "next/link";
import { FernLogo } from "./FernLogo";

export declare namespace BuiltWithFern {
    export interface Props {
        className?: string;
        isWhiteLabeled: boolean;
    }
}

export const BuiltWithFern: React.FC<BuiltWithFern.Props> = ({ className, isWhiteLabeled }) => {
    const { isHovering, ...containerCallbacks } = useIsHovering();

    if (isWhiteLabeled) {
        return null;
    }

    return (
        <Link
            href="https://buildwithfern.com"
            className={classNames(
                "flex cursor-pointer items-center space-x-2 lg:px-3 py-3 mt-4 !no-underline",
                className,
            )}
            {...containerCallbacks}
        >
            <div className="size-4">
                <FernLogo fill={isHovering ? undefined : "rgb(82, 82, 82)"} />
            </div>
            <div
                className={classNames("whitespace-nowrap text-xs transition", {
                    "t-muted": isHovering,
                    "text-text-disabled": !isHovering,
                })}
            >
                Built with Fern
            </div>
        </Link>
    );
};
