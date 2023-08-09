import classNames from "classnames";
import { HiOutlineChevronDown } from "react-icons/hi2";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace ClickableSidebarGroupTitle {
    export interface Props {
        title: string;
        onClick: React.MouseEventHandler<HTMLButtonElement>;
        collapsed: boolean;
    }
}

export const ClickableSidebarGroupTitle: React.FC<ClickableSidebarGroupTitle.Props> = ({
    onClick,
    title,
    collapsed,
}) => {
    return (
        <button onClick={onClick} className="group/sb-group-container">
            <SidebarItemLayout
                title={
                    <div
                        className={classNames(
                            "uppercase text-white group-hover/sb-group-container:text-accentPrimary transition-colors font-medium w-full flex justify-between items-center"
                        )}
                    >
                        <span className="text-xs tracking-wide">{title}</span>
                        <HiOutlineChevronDown
                            className={classNames("text-sm transition-all", {
                                "-rotate-90": collapsed,
                                "rotate-0": !collapsed,
                            })}
                        />
                    </div>
                }
            />
        </button>
    );
};
