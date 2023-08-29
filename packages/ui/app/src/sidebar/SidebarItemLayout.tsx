import { useIsHovering } from "@fern-ui/react-commons";
import classNames from "classnames";
import { useContext } from "react";
import { SidebarDepthContext } from "./context/SidebarDepthContext";

export declare namespace SidebarItemLayout {
    export interface Props {
        title: JSX.Element | string | ((args: { isHovering: boolean }) => JSX.Element | string);
        className?: string;
        isSelected?: boolean;
        paddingLeftAdditional?: number;
    }
}

export const SidebarItemLayout: React.FC<SidebarItemLayout.Props> = ({
    className,
    title,
    paddingLeftAdditional,
    isSelected = false,
}) => {
    const { isHovering, ...hoveringCallbacks } = useIsHovering();

    const sidebarContext = useContext(SidebarDepthContext);

    return (
        <div
            className={classNames(className, "text-ellipsis flex shrink-0 z-0 items-center min-w-0 t-muted", {
                relative: isSelected,
            })}
            style={{
                paddingLeft: (sidebarContext != null ? 16 * sidebarContext.depth : 0) + (paddingLeftAdditional ?? 0),
            }}
            {...hoveringCallbacks}
        >
            {typeof title === "function" ? title({ isHovering }) : title}
        </div>
    );
};
