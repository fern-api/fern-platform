import { useIsHovering } from "@fern-ui/react-commons";
import classNames from "classnames";
import Link from "next/link";
import { useDocsContext } from "../docs-context/useDocsContext";
import { FernLogo } from "./FernLogo";

export declare namespace BuiltWithFern {
    export interface Props {
        className?: string;
    }
}

export const BuiltWithFern: React.FC<BuiltWithFern.Props> = ({ className }) => {
    const { isHovering, ...containerCallbacks } = useIsHovering();

    const { domain } = useDocsContext();

    // TODO: move this to venus
    if (domain.toLowerCase().includes("polytomic")) {
        return null;
    }

    return (
        <Link
            href="https://buildwithfern.com"
            className={classNames("flex cursor-pointer items-center space-x-2 pl-3 py-3 mt-4 !no-underline", className)}
            {...containerCallbacks}
        >
            <div className="h-4 w-4">
                <FernLogo fill={isHovering ? undefined : "rgb(82, 82, 82)"} />
            </div>
            <div
                className={classNames("whitespace-nowrap text-xs transition", {
                    "t-muted": isHovering,
                    "text-intent-default dark:text-text-disabled-dark": !isHovering,
                })}
            >
                Built with Fern
            </div>
        </Link>
    );
};
